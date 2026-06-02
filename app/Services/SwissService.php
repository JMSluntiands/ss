<?php

namespace App\Services;

use App\Models\Participant;
use App\Models\SwissStanding;
use App\Models\Tournament;
use App\Models\TournamentMatch;
use App\Support\TwoStageGroups;
use Illuminate\Support\Collection;

class SwissService
{
    /**
     * Initialize and start a Swiss tournament.
     * Creates standings for all participants, calculates rounds, and generates round 1 pairings.
     */
    public function startTournament(Tournament $tournament): void
    {
        $participants = $tournament->participants()->orderBy('seed')->get();
        if (TwoStageGroups::usesGroupStage($tournament)) {
            $groups = TwoStageGroups::split($participants, $tournament);
            $count = max(2, $groups->max(fn ($g) => $g->count()) ?? 2);
        } else {
            $count = $participants->count();
        }

        $totalRounds = $tournament->swiss_rounds ?: (int) ceil(log($count, 2));
        if ($totalRounds < 1) {
            $totalRounds = 1;
        }

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

        $this->generateRoundPairings($tournament, 1);
    }

    /**
     * Generate pairings for a specific round.
     * Round 1: random pairings. Round 2+: pair by standings, preventing rematches.
     */
    public function generateRoundPairings(Tournament $tournament, int $round): void
    {
        if (TwoStageGroups::usesGroupStage($tournament)) {
            $this->generateTwoStageRoundPairings($tournament, $round);

            return;
        }

        $participants = $tournament->participants()->get();

        if ($round === 1) {
            $shuffled = $participants->shuffle();
            $this->createPairingsFromList($tournament, $round, $shuffled);
        } else {
            $standings = $tournament->swissStandings()
                ->with('participant')
                ->orderByDesc('tournament_points')
                ->orderByDesc('battle_points')
                ->orderByDesc('opponent_strength')
                ->get();

            $sortedParticipants = $standings->map(fn ($s) => $s->participant);
            $playedPairs = $this->getPlayedPairs($tournament);

            $this->createSwissPairings($tournament, $round, $sortedParticipants, $playedPairs);
        }
    }

    /**
     * Two-stage group stage: pair only within each group (no cross-group Swiss matches).
     */
    private function generateTwoStageRoundPairings(Tournament $tournament, int $round): void
    {
        $participants = $tournament->participants()->orderBy('seed')->get();
        $groups = TwoStageGroups::split($participants, $tournament);
        $playedPairs = $this->getPlayedPairs($tournament);
        $matchNumber = (int) ($tournament->matches()->max('match_number') ?? 0) + 1;

        foreach ($groups as $groupParticipants) {
            if ($round === 1) {
                $matchNumber = $this->createPairingsFromList(
                    $tournament,
                    $round,
                    $groupParticipants->shuffle(),
                    $matchNumber,
                );
            } else {
                $memberIds = $groupParticipants->pluck('id')->all();
                $standings = $tournament->swissStandings()
                    ->with('participant')
                    ->whereIn('participant_id', $memberIds)
                    ->orderByDesc('tournament_points')
                    ->orderByDesc('battle_points')
                    ->orderByDesc('opponent_strength')
                    ->get();

                $sortedParticipants = $standings->map(fn ($s) => $s->participant);
                $matchNumber = $this->createSwissPairings(
                    $tournament,
                    $round,
                    $sortedParticipants,
                    $playedPairs,
                    $matchNumber,
                );
            }
        }
    }

    /**
     * Submit a match result and update standings accordingly.
     */
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

    /**
     * Recalculate opponent strength and rankings for all players.
     * Opponent strength = sum of tournament_points of all opponents faced.
     */
    public function calculateStandings(Tournament $tournament): void
    {
        // Fresh query to get latest data after increments
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

        // Fresh query again then rank
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
     * Advance the tournament to the next round, or complete it if all rounds are done.
     * Returns true if tournament continues, false if completed.
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
            if ($tournament->format === 'swiss' && $topCut >= 2) {
                return false;
            }
            $tournament->update(['status' => 'completed']);

            return false;
        }

        $tournament->update(['current_round' => $nextRound]);
        $this->generateRoundPairings($tournament, $nextRound);

        return true;
    }

    /**
     * Check if all matches in the current round are completed.
     */
    public function isCurrentRoundComplete(Tournament $tournament): bool
    {
        return $tournament->matches()
            ->where('round', $tournament->current_round)
            ->where('status', '!=', 'completed')
            ->doesntExist();
    }

    /**
     * Check if the entire tournament is complete.
     */
    public function isTournamentComplete(Tournament $tournament): bool
    {
        return $tournament->current_round >= $tournament->swiss_rounds
            && $this->isCurrentRoundComplete($tournament);
    }

    /**
     * Get all pairs of player IDs that have already played each other.
     * Returns a collection of sorted [player1_id, player2_id] arrays.
     */
    private function getPlayedPairs(Tournament $tournament): Collection
    {
        return $tournament->matches()
            ->whereNotNull('player1_id')
            ->whereNotNull('player2_id')
            ->where('is_bye', false)
            ->get()
            ->map(function ($match) {
                $ids = [$match->player1_id, $match->player2_id];
                sort($ids);
                return implode('-', $ids);
            });
    }

    /**
     * Round 1: create pairings from a shuffled list, handling odd player count with BYE.
     */
    private function createPairingsFromList(
        Tournament $tournament,
        int $round,
        Collection $participants,
        int $matchNumber = 1,
    ): int {
        $list = $participants->values();
        $byePlayer = null;

        if ($list->count() % 2 !== 0) {
            $byePlayer = $list->pop();
        }

        for ($i = 0; $i < $list->count(); $i += 2) {
            TournamentMatch::create([
                'tournament_id' => $tournament->id,
                'round' => $round,
                'match_number' => $matchNumber++,
                'player1_id' => $list[$i]->id,
                'player2_id' => $list[$i + 1]->id,
                'status' => 'pending',
            ]);
        }

        if ($byePlayer) {
            $this->assignBye($tournament, $round, $byePlayer, $matchNumber);
            $matchNumber++;
        }

        return $matchNumber;
    }

    /**
     * Round 2+: Swiss pairing algorithm.
     * Pairs players top-down by standings, avoiding rematches.
     */
    private function createSwissPairings(
        Tournament $tournament,
        int $round,
        Collection $sortedParticipants,
        Collection $playedPairs,
        int $matchNumber = 1,
    ): int {
        $unpaired = $sortedParticipants->values()->all();
        $paired = [];
        $matches = [];

        // Handle BYE for odd number of players
        $byePlayer = null;
        if (count($unpaired) % 2 !== 0) {
            $byePlayer = $this->selectByePlayer($tournament, $unpaired);
            $unpaired = array_values(array_filter($unpaired, fn ($p) => $p->id !== $byePlayer->id));
        }

        // Greedy pairing: for each unpaired player, find the best available opponent
        $used = [];
        foreach ($unpaired as $player) {
            if (in_array($player->id, $used)) {
                continue;
            }

            $bestOpponent = null;
            foreach ($unpaired as $candidate) {
                if ($candidate->id === $player->id || in_array($candidate->id, $used)) {
                    continue;
                }

                $pairKey = min($player->id, $candidate->id) . '-' . max($player->id, $candidate->id);
                if (!$playedPairs->contains($pairKey)) {
                    $bestOpponent = $candidate;
                    break;
                }
            }

            // Fallback: if no valid opponent without rematch, take the first available
            if (!$bestOpponent) {
                foreach ($unpaired as $candidate) {
                    if ($candidate->id !== $player->id && !in_array($candidate->id, $used)) {
                        $bestOpponent = $candidate;
                        break;
                    }
                }
            }

            if ($bestOpponent) {
                $used[] = $player->id;
                $used[] = $bestOpponent->id;
                $paired[] = [$player, $bestOpponent];
            }
        }

        foreach ($paired as [$p1, $p2]) {
            TournamentMatch::create([
                'tournament_id' => $tournament->id,
                'round' => $round,
                'match_number' => $matchNumber++,
                'player1_id' => $p1->id,
                'player2_id' => $p2->id,
                'status' => 'pending',
            ]);
        }

        if ($byePlayer) {
            $this->assignBye($tournament, $round, $byePlayer, $matchNumber);
            $matchNumber++;
        }

        return $matchNumber;
    }

    /**
     * Select the player to receive a BYE: lowest-ranked player who hasn't had one yet.
     */
    private function selectByePlayer(Tournament $tournament, array $participants): Participant
    {
        $byeReceivedIds = SwissStanding::where('tournament_id', $tournament->id)
            ->where('bye_received', true)
            ->pluck('participant_id')
            ->toArray();

        // Walk from bottom of standings upward
        $reversed = array_reverse($participants);
        foreach ($reversed as $participant) {
            if (!in_array($participant->id, $byeReceivedIds)) {
                return $participant;
            }
        }

        // Everyone has had a BYE already -- give it to the lowest ranked
        return $reversed[0];
    }

    /**
     * Create a BYE match and auto-award points.
     */
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

        if ($standing) {
            $standing->increment('tournament_points', $tournament->pts_for_bye);
            $standing->increment('wins');
            $standing->update(['bye_received' => true]);
        }

        $this->calculateStandings($tournament);
    }
}
