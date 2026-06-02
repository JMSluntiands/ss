<?php

namespace App\Services;

use App\Models\Participant;
use App\Models\SwissStanding;
use App\Models\Tournament;
use App\Models\TournamentMatch;
use App\Support\TwoStageGroups;

class RoundRobinService
{
    /**
     * Initialize and start a Round Robin tournament.
     * Schedules all rounds upfront using the circle method (no duplicate matchups).
     */
    public function startTournament(Tournament $tournament): void
    {
        $participants = $tournament->participants()->orderBy('seed')->get();

        if (TwoStageGroups::usesGroupStage($tournament)) {
            $groups = TwoStageGroups::split($participants, $tournament);
            $largestGroup = max(2, $groups->max(fn ($g) => $g->count()) ?? 2);
            $maxRounds = $largestGroup % 2 === 0 ? $largestGroup - 1 : $largestGroup;
        } else {
            $count = $participants->count();
            $maxRounds = $count % 2 === 0 ? $count - 1 : $count;
        }

        $totalRounds = $tournament->swiss_rounds ?: $maxRounds;
        $totalRounds = max(1, min($totalRounds, $maxRounds));

        $tournament->update([
            'swiss_rounds' => $totalRounds,
            'current_round' => 1,
            'status' => 'active',
        ]);

        $tournament->swissStandings()->delete();
        $tournament->matches()->delete();

        foreach ($participants as $participant) {
            SwissStanding::create([
                'tournament_id' => $tournament->id,
                'participant_id' => $participant->id,
                'rank' => $participant->seed,
            ]);
        }

        if (TwoStageGroups::usesGroupStage($tournament)) {
            $this->createTwoStageRoundRobinSchedule($tournament, TwoStageGroups::split($participants, $tournament), $totalRounds);
        } else {
            $schedule = $this->buildCircleSchedule($participants, $totalRounds);
            $this->persistSchedule($tournament, $schedule);
        }
    }

    /**
     * @param  \Illuminate\Support\Collection<int, \Illuminate\Support\Collection<int, Participant>>  $groups
     */
    private function createTwoStageRoundRobinSchedule(Tournament $tournament, $groups, int $totalRounds): void
    {
        $groupSchedules = $groups->map(function ($group) use ($totalRounds) {
            $size = $group->count();
            $groupMaxRounds = $size % 2 === 0 ? $size - 1 : $size;
            $rounds = min($totalRounds, max(1, $groupMaxRounds));

            return $this->buildCircleSchedule($group, $rounds);
        });

        $merged = [];
        for ($r = 1; $r <= $totalRounds; $r++) {
            $merged[$r] = ['pairings' => [], 'byes' => []];
        }

        foreach ($groupSchedules as $schedule) {
            foreach ($schedule as $round => $roundData) {
                foreach ($roundData['pairings'] as $pairing) {
                    $merged[$round]['pairings'][] = $pairing;
                }
                if ($roundData['bye']) {
                    $merged[$round]['byes'][] = $roundData['bye'];
                }
            }
        }

        $this->persistSchedule($tournament, $merged);
    }

    /**
     * @param  array<int, array{pairings: array<int, array{0: Participant, 1: Participant}>, bye?: Participant|null, byes?: array<int, Participant>}>  $schedule
     */
    private function persistSchedule(Tournament $tournament, array $schedule): void
    {
        $matchNumber = 1;

        foreach ($schedule as $round => $roundData) {
            foreach ($roundData['pairings'] as [$p1, $p2]) {
                TournamentMatch::create([
                    'tournament_id' => $tournament->id,
                    'round' => $round,
                    'match_number' => $matchNumber++,
                    'player1_id' => $p1->id,
                    'player2_id' => $p2->id,
                    'status' => 'pending',
                ]);
            }

            $byes = $roundData['byes'] ?? ($roundData['bye'] ? [$roundData['bye']] : []);
            foreach ($byes as $byePlayer) {
                $this->assignBye($tournament, $round, $byePlayer, $matchNumber);
                $matchNumber++;
            }
        }
    }

    /**
     * Build round pairings using the circle method.
     * Each player faces a different opponent each round; no matchup repeats.
     *
     * @return array<int, array{pairings: array<int, array{0: Participant, 1: Participant}>, bye: Participant|null}>
     */
    private function buildCircleSchedule($participants, int $rounds): array
    {
        $slots = $participants->values()->all();
        $hasBye = count($slots) % 2 !== 0;

        if ($hasBye) {
            $slots[] = null;
        }

        $n = count($slots);
        $schedule = [];

        for ($r = 0; $r < $rounds; $r++) {
            $pairings = [];
            $byePlayer = null;

            for ($i = 0; $i < (int) ($n / 2); $i++) {
                $home = $slots[$i];
                $away = $slots[$n - 1 - $i];

                if ($home === null) {
                    $byePlayer = $away;
                } elseif ($away === null) {
                    $byePlayer = $home;
                } else {
                    $pairings[] = [$home, $away];
                }
            }

            $schedule[$r + 1] = [
                'pairings' => $pairings,
                'bye' => $byePlayer,
            ];

            if ($r < $rounds - 1) {
                $last = array_pop($slots);
                array_splice($slots, 1, 0, [$last]);
            }
        }

        return $schedule;
    }

    public function submitMatchResult(
        TournamentMatch $match,
        int $winnerId,
        int $p1BattlePoints,
        int $p2BattlePoints,
        bool $isDraw = false
    ): void {
        $tournament = $match->tournament;

        $p1Standing = SwissStanding::where('tournament_id', $tournament->id)
            ->where('participant_id', $match->player1_id)
            ->first();
        $p2Standing = SwissStanding::where('tournament_id', $tournament->id)
            ->where('participant_id', $match->player2_id)
            ->first();

        if ($match->status === 'completed') {
            $this->reverseMatchResult($match, $p1Standing, $p2Standing, $tournament);
        }

        $match->update([
            'winner_id' => $isDraw ? null : $winnerId,
            'player1_battle_points' => $p1BattlePoints,
            'player2_battle_points' => $p2BattlePoints,
            'is_draw' => $isDraw,
            'status' => 'completed',
        ]);

        if ($isDraw) {
            $p1Standing->increment('tournament_points', $tournament->pts_for_match_tie);
            $p2Standing->increment('tournament_points', $tournament->pts_for_match_tie);
            $p1Standing->increment('draws');
            $p2Standing->increment('draws');
        } else {
            $winnerStanding = $winnerId === $match->player1_id ? $p1Standing : $p2Standing;
            $loserStanding = $winnerId === $match->player1_id ? $p2Standing : $p1Standing;

            $winnerStanding->increment('tournament_points', $tournament->pts_for_match_win);
            $winnerStanding->increment('wins');
            $loserStanding->increment('losses');
        }

        $p1Standing->increment('battle_points', $p1BattlePoints);
        $p2Standing->increment('battle_points', $p2BattlePoints);

        $this->calculateStandings($tournament);
    }

    private function reverseMatchResult(
        TournamentMatch $match,
        SwissStanding $p1Standing,
        SwissStanding $p2Standing,
        Tournament $tournament
    ): void {
        if ($match->is_draw) {
            $p1Standing->decrement('tournament_points', $tournament->pts_for_match_tie);
            $p2Standing->decrement('tournament_points', $tournament->pts_for_match_tie);
            $p1Standing->decrement('draws');
            $p2Standing->decrement('draws');
        } else {
            $oldWinnerStanding = $match->winner_id === $match->player1_id ? $p1Standing : $p2Standing;
            $oldLoserStanding = $match->winner_id === $match->player1_id ? $p2Standing : $p1Standing;

            $oldWinnerStanding->decrement('tournament_points', $tournament->pts_for_match_win);
            $oldWinnerStanding->decrement('wins');
            $oldLoserStanding->decrement('losses');
        }

        $p1Standing->decrement('battle_points', $match->player1_battle_points);
        $p2Standing->decrement('battle_points', $match->player2_battle_points);
    }

    public function calculateStandings(Tournament $tournament): void
    {
        $standings = SwissStanding::where('tournament_id', $tournament->id)->get();
        $matches = TournamentMatch::where('tournament_id', $tournament->id)
            ->where('status', 'completed')
            ->where('is_bye', false)
            ->get();

        $opponentPoints = [];
        foreach ($standings as $standing) {
            $opponentPoints[$standing->participant_id] = 0;
        }

        foreach ($matches as $match) {
            if ($match->player1_id && $match->player2_id) {
                $p1Standing = $standings->firstWhere('participant_id', $match->player1_id);
                $p2Standing = $standings->firstWhere('participant_id', $match->player2_id);

                if ($p1Standing && $p2Standing) {
                    $opponentPoints[$match->player1_id] += (float) $p2Standing->tournament_points;
                    $opponentPoints[$match->player2_id] += (float) $p1Standing->tournament_points;
                }
            }
        }

        foreach ($standings as $standing) {
            $standing->update([
                'opponent_strength' => $opponentPoints[$standing->participant_id] ?? 0,
            ]);
        }

        $ranked = SwissStanding::where('tournament_id', $tournament->id)
            ->orderByDesc('tournament_points')
            ->orderByDesc('battle_points')
            ->orderByDesc('opponent_strength')
            ->get();

        foreach ($ranked as $index => $standing) {
            $standing->update(['rank' => $index + 1]);
        }
    }

    /**
     * Advance to the next round. Pairings are pre-scheduled; only increment current_round.
     */
    public function advanceToNextRound(Tournament $tournament): bool
    {
        $currentRound = $tournament->current_round;
        $nextRound = $currentRound + 1;

        if ($nextRound > $tournament->swiss_rounds) {
            if ($tournament->tournament_type === 'two_stage') {
                return false;
            }
            $topCut = (int) ($tournament->swiss_top_cut_players ?? 0);
            if ($tournament->format === 'round_robin' && $topCut >= 2) {
                return false;
            }
            $tournament->update(['status' => 'completed']);

            return false;
        }

        $tournament->update(['current_round' => $nextRound]);

        return true;
    }

    public function isCurrentRoundComplete(Tournament $tournament): bool
    {
        return $tournament->matches()
            ->where('round', $tournament->current_round)
            ->where('status', '!=', 'completed')
            ->doesntExist();
    }

    public function isTournamentComplete(Tournament $tournament): bool
    {
        return $tournament->current_round >= $tournament->swiss_rounds
            && $this->isCurrentRoundComplete($tournament);
    }

    private function assignBye(Tournament $tournament, int $round, Participant $player, int $matchNumber): void
    {
        TournamentMatch::create([
            'tournament_id' => $tournament->id,
            'round' => $round,
            'match_number' => $matchNumber,
            'player1_id' => $player->id,
            'player2_id' => null,
            'winner_id' => $player->id,
            'is_bye' => true,
            'status' => 'completed',
        ]);

        $standing = SwissStanding::where('tournament_id', $tournament->id)
            ->where('participant_id', $player->id)
            ->first();

        if ($standing && ! $standing->bye_received) {
            $standing->increment('tournament_points', $tournament->pts_for_bye);
            $standing->increment('wins');
            $standing->update(['bye_received' => true]);
        }

        $this->calculateStandings($tournament);
    }
}
