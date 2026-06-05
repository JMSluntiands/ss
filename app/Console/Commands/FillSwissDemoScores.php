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

                [$winnerId, $p1Bp, $p2Bp, $roundDetails] = $this->sampleOutcome($match, $round);

                $service->submitMatchResult($match, $winnerId, $p1Bp, $p2Bp, false);
                $match->update(['round_details' => $roundDetails]);
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
     * Beyblade X: first to 4 points wins. Generates round_details + battle points.
     *
     * @return array{0: int, 1: int, 2: int, 3: list<array{round: int, winner: string, finish: string, points: int}>}
     */
    private function sampleOutcome(TournamentMatch $match, int $round): array
    {
        $p1WinsMatch = (($match->id + $round) % 3) !== 0;
        $winnerSide = $p1WinsMatch ? 'p1' : 'p2';
        $loserSide = $p1WinsMatch ? 'p2' : 'p1';

        $templates = [
            [
                ['side' => 'w', 'finish' => 'XF', 'points' => 3],
                ['side' => 'l', 'finish' => 'BF', 'points' => 2],
                ['side' => 'w', 'finish' => 'SF', 'points' => 1],
            ],
            [
                ['side' => 'w', 'finish' => 'OF', 'points' => 2],
                ['side' => 'l', 'finish' => 'SF', 'points' => 1],
                ['side' => 'w', 'finish' => 'BF', 'points' => 2],
            ],
            [
                ['side' => 'l', 'finish' => 'SF', 'points' => 1],
                ['side' => 'w', 'finish' => 'XF', 'points' => 3],
                ['side' => 'l', 'finish' => 'OF', 'points' => 2],
                ['side' => 'w', 'finish' => 'SF', 'points' => 1],
            ],
            [
                ['side' => 'w', 'finish' => 'XF', 'points' => 3],
                ['side' => 'w', 'finish' => 'SF', 'points' => 1],
            ],
        ];

        $template = $templates[($match->match_number + $round) % count($templates)];
        $roundDetails = [];
        $p1Bp = 0;
        $p2Bp = 0;

        foreach ($template as $i => $entry) {
            $side = $entry['side'] === 'w' ? $winnerSide : $loserSide;
            $roundDetails[] = [
                'round' => $i + 1,
                'winner' => $side,
                'finish' => $entry['finish'],
                'points' => $entry['points'],
            ];

            if ($side === 'p1') {
                $p1Bp += $entry['points'];
            } else {
                $p2Bp += $entry['points'];
            }
        }

        $winnerId = $p1Bp >= $p2Bp ? $match->player1_id : $match->player2_id;

        return [$winnerId, $p1Bp, $p2Bp, $roundDetails];
    }

    private function startFinalStage(Tournament $tournament): void
    {
        $method = new ReflectionMethod(TournamentController::class, 'startFinalStage');
        $method->setAccessible(true);
        $method->invoke(app(TournamentController::class), $tournament);
    }
}
