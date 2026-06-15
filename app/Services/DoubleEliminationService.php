<?php

namespace App\Services;

use App\Models\Participant;
use App\Models\Tournament;
use App\Models\TournamentMatch;
use Illuminate\Support\Collection;

/**
 * Challonge-style double elimination: winners + losers brackets, single grand final.
 */
class DoubleEliminationService
{
    /**
     * @param  Collection<int, Participant>  $participants
     */
    public function generate(
        Tournament $tournament,
        Collection $participants,
        string $stage = 'group',
        ?string $bracketPrefix = null,
    ): void {
        $winnersTag = $this->tag($bracketPrefix, 'winners') ?? 'winners';
        $losersTag = $this->tag($bracketPrefix, 'losers') ?? 'losers';
        $grandFinalTag = $this->tag($bracketPrefix, 'grand_final') ?? 'grand_final';

        $count = $participants->count();
        $bracketSize = 1;
        while ($bracketSize < $count) {
            $bracketSize *= 2;
        }

        $split = (bool) $tournament->de_split_participants;
        $grandFinalsMode = $tournament->de_grand_finals ?? 'reset';

        $fullWinnersRounds = (int) log($bracketSize, 2);
        $winnersBracketSize = $split ? (int) ($bracketSize / 2) : $bracketSize;
        $winnersRounds = $split ? $fullWinnersRounds - 1 : $fullWinnersRounds;
        $losersRounds = max(0, ($fullWinnersRounds - 1) * 2 - 1);

        $matchNumber = 1;
        /** @var array<string, TournamentMatch> $winners */
        $winners = [];
        /** @var array<string, TournamentMatch> $losers */
        $losers = [];

        for ($round = 1; $round <= $winnersRounds; $round++) {
            $n = (int) ($winnersBracketSize / (2 ** $round));
            for ($pos = 0; $pos < $n; $pos++) {
                $winners["{$round}-{$pos}"] = TournamentMatch::create([
                    'tournament_id' => $tournament->id,
                    'stage' => $stage,
                    'bracket' => $winnersTag,
                    'round' => $round,
                    'match_number' => $matchNumber++,
                    'status' => 'pending',
                ]);
            }
        }

        for ($round = 1; $round <= $losersRounds; $round++) {
            $n = $this->losersMatchCount($bracketSize, $round, $split);
            for ($pos = 0; $pos < $n; $pos++) {
                $losers["{$round}-{$pos}"] = TournamentMatch::create([
                    'tournament_id' => $tournament->id,
                    'stage' => $stage,
                    'bracket' => $losersTag,
                    'round' => $round,
                    'match_number' => $matchNumber++,
                    'status' => 'pending',
                ]);
            }
        }

        $grandFinal = null;
        $grandFinalReset = null;

        if ($grandFinalsMode !== 'none') {
            $grandFinal = TournamentMatch::create([
                'tournament_id' => $tournament->id,
                'stage' => $stage,
                'bracket' => $grandFinalTag,
                'round' => 1,
                'match_number' => $matchNumber++,
                'status' => 'pending',
            ]);

            if ($grandFinalsMode === 'reset') {
                $grandFinalReset = TournamentMatch::create([
                    'tournament_id' => $tournament->id,
                    'stage' => $stage,
                    'bracket' => $grandFinalTag,
                    'round' => 2,
                    'match_number' => $matchNumber++,
                    'status' => 'pending',
                ]);

                $grandFinal->update(['next_match_id' => $grandFinalReset->id]);
            }
        }

        $this->wireWinners($winners, $winnersRounds, $grandFinal);
        $this->wireLosers($losers, $losersRounds, $grandFinal);
        $this->wireLosersFromWinners($winners, $losers, $winnersRounds, $losersRounds, $split);

        $winnersEntrants = $split ? $participants->take(intdiv($count, 2)) : $participants;
        $winnersEntrantCount = $winnersEntrants->count();
        $this->seedRoundOne($winnersEntrants, $winners, $winnersBracketSize, $winnersEntrantCount);

        if ($split) {
            $this->seedSplitLosersRoundOne($participants->slice(intdiv($count, 2))->values(), $losers);
        }

        $this->propagateByeAdvances($tournament, $stage);
    }

    public function resolveEliminationProgress(Tournament $tournament, TournamentMatch $match): void
    {
        if (! $this->usesDoubleElimination($tournament, $match->stage ?? 'group')) {
            return;
        }

        $gfMode = $tournament->de_grand_finals ?? 'reset';

        if ($this->isGrandFinalMatch($match) && $match->status === 'completed' && $match->winner_id) {
            if ((int) $match->round === 2) {
                $tournament->update(['status' => 'completed']);

                return;
            }

            if ($gfMode === 'reset' && (int) $match->round === 1 && $match->next_match_id) {
                if ($match->winner_id === $match->player1_id) {
                    $tournament->update(['status' => 'completed']);

                    return;
                }

                $reset = TournamentMatch::find($match->next_match_id);
                if ($reset && ! $reset->player1_id && ! $reset->player2_id) {
                    $reset->update([
                        'player1_id' => $match->player1_id,
                        'player2_id' => $match->player2_id,
                        'status' => 'pending',
                    ]);
                }

                return;
            }

            if ($gfMode === 'single' || $gfMode === 'reset') {
                $tournament->update(['status' => 'completed']);
            }

            return;
        }

        if ($gfMode === 'none' && $this->isWinnersBracketFinal($match) && $match->status === 'completed' && $match->winner_id) {
            $tournament->update(['status' => 'completed']);
        }
    }

    public function usesDoubleElimination(Tournament $tournament, string $stage = 'group'): bool
    {
        if ($tournament->format === 'double_elimination') {
            return true;
        }

        return $tournament->tournament_type === 'two_stage'
            && ($tournament->final_stage_format ?? '') === 'double_elimination'
            && $stage === 'final';
    }

    public function propagateParticipantToNextMatch(
        TournamentMatch $from,
        int $participantId,
        string $linkColumn = 'next_match_id',
    ): void {
        $nextId = $from->{$linkColumn};
        if (! $nextId) {
            return;
        }

        $next = TournamentMatch::find($nextId);
        if (! $next) {
            return;
        }

        $slot = $this->feederSlot($from, $linkColumn, $next);

        if ($slot === 1) {
            if (! $next->player1_id) {
                $next->update(['player1_id' => $participantId]);
            }

            return;
        }

        if (! $next->player2_id && $next->player1_id !== $participantId) {
            $next->update(['player2_id' => $participantId]);
        }
    }

    public function propagateByeAdvances(Tournament $tournament, string $stage): void
    {
        for ($i = 0; $i < 50; $i++) {
            $moved = false;

            foreach (
                TournamentMatch::query()
                    ->where('tournament_id', $tournament->id)
                    ->where('stage', $stage)
                    ->where('is_bye', true)
                    ->where('status', 'completed')
                    ->whereNotNull('winner_id')
                    ->get() as $bye
            ) {
                if (! $bye->next_match_id || ! $bye->winner_id) {
                    continue;
                }

                $next = TournamentMatch::find($bye->next_match_id);
                if (! $next) {
                    continue;
                }

                $before = [$next->player1_id, $next->player2_id];
                $this->propagateParticipantToNextMatch($bye, $bye->winner_id, 'next_match_id');
                $next->refresh();

                if ($next->player1_id !== $before[0] || $next->player2_id !== $before[1]) {
                    $moved = true;
                }
            }

            if (! $moved) {
                break;
            }
        }
    }

    public function isGrandFinalMatch(TournamentMatch $match): bool
    {
        $bracket = (string) $match->bracket;

        return $bracket === 'grand_final' || str_ends_with($bracket, '_grand_final');
    }

    private function feederSlot(TournamentMatch $from, string $linkColumn, TournamentMatch $to): int
    {
        $fromBracket = (string) $from->bracket;
        $toBracket = (string) $to->bracket;
        $pos = $this->positionInRound($from);
        $fromRound = (int) $from->round;

        $fromWinners = $this->isWinnersBracket($fromBracket);
        $fromLosers = $this->isLosersBracket($fromBracket);
        $toGrandFinal = $toBracket === 'grand_final' || str_contains($toBracket, 'grand_final');

        if ($toGrandFinal) {
            return $fromWinners ? 1 : 2;
        }

        // Single elimination (and placement mini-brackets): even feeders → player1, odd → player2.
        if ($this->isSingleEliminationBracket($from)) {
            return ($pos % 2) + 1;
        }

        if ($linkColumn === 'loser_next_match_id') {
            // WB R1: pair of losers land in slots 1 & 2 of the same LB match.
            if ($fromWinners && $fromRound === 1) {
                return ($pos % 2) + 1;
            }

            // Later WB rounds: loser faces the LB-side winner already in slot 1.
            return 2;
        }

        if ($fromWinners) {
            return ($pos % 2) + 1;
        }

        if ($fromLosers) {
            return $fromRound % 2 === 1 ? 1 : (($pos % 2) + 1);
        }

        return 1;
    }

    private function positionInRound(TournamentMatch $match): int
    {
        return (int) TournamentMatch::query()
            ->where('tournament_id', $match->tournament_id)
            ->where('stage', $match->stage)
            ->where('bracket', $match->bracket)
            ->where('round', $match->round)
            ->where('match_number', '<', $match->match_number)
            ->count();
    }

    private function losersMatchCount(int $bracketSize, int $round, bool $split = false): int
    {
        if ($split && $round === 1) {
            return (int) ($bracketSize / 4);
        }

        return (int) ($bracketSize / (2 ** ((int) ceil($round / 2) + 1)));
    }

    private function isWinnersBracketFinal(TournamentMatch $match): bool
    {
        if (! $this->isWinnersBracket((string) $match->bracket)) {
            return false;
        }

        return $match->next_match_id === null && $match->status === 'completed';
    }

    /**
     * @param  array<string, TournamentMatch>  $losers
     * @param  Collection<int, Participant>  $participants
     */
    private function seedSplitLosersRoundOne(Collection $participants, array $losers): void
    {
        $lbRoundOne = collect($losers)
            ->filter(fn (TournamentMatch $m) => $m->round === 1)
            ->sortBy('match_number')
            ->values();

        $count = $participants->count();
        if ($count === 0) {
            return;
        }

        $entrantBracketSize = 1;
        while ($entrantBracketSize < $count) {
            $entrantBracketSize *= 2;
        }

        foreach ($this->seedPairs($entrantBracketSize) as $index => [$seed1, $seed2]) {
            $match = $lbRoundOne[$index] ?? null;
            if (! $match) {
                continue;
            }

            $p1 = $seed1 <= $count ? $participants[$seed1 - 1] : null;
            $p2 = $seed2 <= $count ? $participants[$seed2 - 1] : null;

            if ($p1 === null && $p2 === null) {
                continue;
            }

            if ($p1 === null || $p2 === null) {
                $byePlayer = $p1 ?? $p2;
                $match->update([
                    'player1_id' => $p1?->id,
                    'player2_id' => $p2?->id,
                    'winner_id' => $byePlayer?->id,
                    'status' => 'completed',
                    'is_bye' => true,
                ]);
            } else {
                $match->update([
                    'player1_id' => $p1->id,
                    'player2_id' => $p2->id,
                    'status' => 'pending',
                    'is_bye' => false,
                ]);
            }
        }
    }

    /**
     * @param  array<string, TournamentMatch>  $winners
     */
    private function wireWinners(array $winners, int $winnersRounds, ?TournamentMatch $grandFinal): void
    {
        foreach ($winners as $key => $match) {
            [$round, $pos] = array_map('intval', explode('-', $key));

            if ($round >= $winnersRounds) {
                if ($grandFinal) {
                    $match->update(['next_match_id' => $grandFinal->id]);
                }

                continue;
            }

            $next = $winners[($round + 1).'-'.intdiv($pos, 2)] ?? null;
            if ($next) {
                $match->update(['next_match_id' => $next->id]);
            }
        }
    }

    /**
     * @param  array<string, TournamentMatch>  $losers
     */
    private function wireLosers(array $losers, int $losersRounds, ?TournamentMatch $grandFinal): void
    {
        foreach ($losers as $key => $match) {
            [$round, $pos] = array_map('intval', explode('-', $key));

            if ($round >= $losersRounds) {
                if ($grandFinal) {
                    $match->update(['next_match_id' => $grandFinal->id]);
                }

                continue;
            }

            if ($round % 2 === 1) {
                $nextKey = ($round + 1).'-'.$pos;
            } else {
                $nextKey = ($round + 1).'-'.intdiv($pos, 2);
            }

            $next = $losers[$nextKey] ?? null;
            if ($next) {
                $match->update(['next_match_id' => $next->id]);
            }
        }
    }

    /**
     * @param  array<string, TournamentMatch>  $winners
     * @param  array<string, TournamentMatch>  $losers
     */
    private function wireLosersFromWinners(
        array $winners,
        array $losers,
        int $winnersRounds,
        int $losersRounds,
        bool $split = false,
    ): void {
        foreach ($winners as $key => $match) {
            [$round, $pos] = array_map('intval', explode('-', $key));

            if ($round === $winnersRounds) {
                $lbFinal = $losers["{$losersRounds}-0"] ?? null;
                if ($lbFinal) {
                    $match->update(['loser_next_match_id' => $lbFinal->id]);
                }

                continue;
            }

            if ($round === 1) {
                $lb = $losers['1-'.intdiv($pos, 2)] ?? null;
            } elseif ($round === 2) {
                $half = (int) (2 ** ($winnersRounds - 2));
                $lbPos = $split ? $pos : ($half - 1 - $pos);
                $lb = $losers['2-'.$lbPos] ?? null;
            } else {
                $lbRound = ($round - 2) * 2 + 2;
                $lb = $losers["{$lbRound}-{$pos}"] ?? null;
            }

            if ($lb) {
                $match->update(['loser_next_match_id' => $lb->id]);
            }
        }
    }

    /**
     * @param  array<string, TournamentMatch>  $winners
     * @param  Collection<int, Participant>  $participants
     */
    private function seedRoundOne(
        Collection $participants,
        array $winners,
        int $bracketSize,
        int $count,
    ): void {
        $roundOne = collect($winners)
            ->filter(fn (TournamentMatch $m) => $m->round === 1)
            ->sortBy('match_number')
            ->values();

        foreach ($this->seedPairs($bracketSize) as $index => [$seed1, $seed2]) {
            $match = $roundOne[$index] ?? null;
            if (! $match) {
                continue;
            }

            $p1 = $seed1 <= $count ? $participants[$seed1 - 1] : null;
            $p2 = $seed2 <= $count ? $participants[$seed2 - 1] : null;

            if ($p1 === null || $p2 === null) {
                $byePlayer = $p1 ?? $p2;
                $match->update([
                    'player1_id' => $p1?->id,
                    'player2_id' => $p2?->id,
                    'winner_id' => $byePlayer?->id,
                    'status' => 'completed',
                    'is_bye' => true,
                ]);
            } else {
                $match->update([
                    'player1_id' => $p1->id,
                    'player2_id' => $p2->id,
                    'status' => 'pending',
                    'is_bye' => false,
                ]);
            }
        }
    }

    /**
     * @return array<int, array{0: int, 1: int}>
     */
    private function seedPairs(int $bracketSize): array
    {
        $positions = [1];
        while (count($positions) < $bracketSize) {
            $sum = count($positions) * 2 + 1;
            $next = [];
            foreach ($positions as $seed) {
                $next[] = $seed;
                $next[] = $sum - $seed;
            }
            $positions = $next;
        }

        $pairs = [];
        for ($i = 0; $i < count($positions); $i += 2) {
            $pairs[] = [$positions[$i], $positions[$i + 1]];
        }

        return $pairs;
    }

    private function tag(?string $prefix, string $suffix): ?string
    {
        return $prefix === null ? $suffix : "{$prefix}_{$suffix}";
    }

    private function isWinnersBracket(string $bracket): bool
    {
        return $bracket === 'winners' || str_ends_with($bracket, '_winners');
    }

    private function isLosersBracket(string $bracket): bool
    {
        return $bracket === 'losers' || str_ends_with($bracket, '_losers');
    }

    private function isSingleEliminationBracket(TournamentMatch $match): bool
    {
        if ($this->isGrandFinalMatch($match)) {
            return false;
        }

        $bracket = (string) $match->bracket;

        if ($bracket === '') {
            return true;
        }

        if ($this->isWinnersBracket($bracket) || $this->isLosersBracket($bracket)) {
            return false;
        }

        return ! str_contains($bracket, 'grand_final');
    }
}
