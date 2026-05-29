<?php

namespace App\Console\Commands;

use App\Http\Controllers\TournamentController;
use App\Models\Tournament;
use App\Models\TournamentMatch;
use App\Services\RoundRobinService;
use App\Services\SwissService;
use Illuminate\Console\Command;
use ReflectionMethod;

class FillSwissDemoScores extends Command
{
    protected $signature = 'tournament:fill-swiss-demo {tournament : Tournament ID} {--start-finals : Generate final stage brackets when group stage is done}';

    protected $description = 'Fill sample match results for all Swiss/Round Robin rounds (for local testing)';

    public function handle(SwissService $swissService, RoundRobinService $roundRobinService): int
    {
        $tournament = Tournament::find($this->argument('tournament'));

        if (! $tournament) {
            $this->error('Tournament not found.');

            return self::FAILURE;
        }

        if (! in_array($tournament->format, ['swiss', 'round_robin'], true)) {
            $this->error('Tournament format must be swiss or round_robin.');

            return self::FAILURE;
        }

        $service = $tournament->format === 'round_robin' ? $roundRobinService : $swissService;
        $targetRound = (int) ($tournament->swiss_rounds ?: 1);

        $this->info("Tournament #{$tournament->id} ({$tournament->name}) — filling rounds through {$targetRound}…");

        while ($tournament->current_round <= $targetRound) {
            $round = $tournament->current_round;
            $matches = TournamentMatch::where('tournament_id', $tournament->id)
                ->where('stage', 'group')
                ->where('round', $round)
                ->orderBy('match_number')
                ->get();

            $filled = 0;

            foreach ($matches as $match) {
                if ($match->status === 'completed' || $match->is_bye) {
                    continue;
                }

                if (! $match->player1_id || ! $match->player2_id) {
                    continue;
                }

                [$winnerId, $p1Bp, $p2Bp] = $this->sampleOutcome($match, $round);

                $service->submitMatchResult($match, $winnerId, $p1Bp, $p2Bp, false);
                $filled++;
            }

            $this->line("  Round {$round}: scored {$filled} match(es).");

            $tournament->refresh();

            if (! $service->isCurrentRoundComplete($tournament)) {
                $this->warn("  Round {$round} still has incomplete matches.");

                return self::FAILURE;
            }

            if ($round >= $targetRound) {
                break;
            }

            $continued = $service->advanceToNextRound($tournament);
            $tournament->refresh();

            if (! $continued) {
                $this->line('  No further rounds after round '.$round.'.');
                break;
            }
        }

        $tournament->refresh();
        $this->info("Done. Current round: {$tournament->current_round} / {$targetRound}.");

        if ($this->option('start-finals') && $tournament->tournament_type === 'two_stage') {
            if ($service->isCurrentRoundComplete($tournament) && $tournament->current_round >= $targetRound) {
                $this->startFinalStage($tournament);
                $finalCount = $tournament->matches()->where('stage', 'final')->count();
                $this->info("Final stage generated ({$finalCount} final match records).");
            } else {
                $this->warn('Group stage not complete — finals not started.');
            }
        }

        return self::SUCCESS;
    }

    /**
     * @return array{0: int, 1: int, 2: int}
     */
    private function sampleOutcome(TournamentMatch $match, int $round): array
    {
        $finishPoints = [1, 2, 2, 3];
        $p1Wins = (($match->id + $round) % 3) !== 0;

        $winnerId = $p1Wins ? $match->player1_id : $match->player2_id;
        $winnerBp = $finishPoints[($match->match_number + $round) % count($finishPoints)];
        $loserBp = max(0, $finishPoints[($match->match_number + $round + 1) % count($finishPoints)] - 1);

        $p1Bp = $winnerId === $match->player1_id ? $winnerBp : $loserBp;
        $p2Bp = $winnerId === $match->player2_id ? $winnerBp : $loserBp;

        return [$winnerId, $p1Bp, $p2Bp];
    }

    private function startFinalStage(Tournament $tournament): void
    {
        $method = new ReflectionMethod(TournamentController::class, 'startFinalStage');
        $method->setAccessible(true);
        $method->invoke(app(TournamentController::class), $tournament);
    }
}
