<?php

namespace App\Services;

use App\Models\Participant;
use App\Models\Tournament;

class ParticipantFinishStatsService
{
    /**
     * Beyblade X finish counts from round_details on completed matches.
     *
     * @return array{sf: int, of: int, bf: int, xf: int, matches_played: int, rounds_won: int}
     */
    public function forParticipant(Tournament $tournament, Participant $participant): array
    {
        $tournament->loadMissing('matches');

        $counts = ['SF' => 0, 'OF' => 0, 'BF' => 0, 'XF' => 0];
        $matchesPlayed = 0;
        $roundsWon = 0;

        foreach ($tournament->matches as $match) {
            if ($match->is_bye) {
                continue;
            }

            if ($match->player1_id !== $participant->id && $match->player2_id !== $participant->id) {
                continue;
            }

            if ($match->status !== 'completed') {
                continue;
            }

            $matchesPlayed++;
            $side = $match->player1_id === $participant->id ? 'p1' : 'p2';

            foreach ($match->round_details ?? [] as $round) {
                if (($round['winner'] ?? '') !== $side) {
                    continue;
                }

                $roundsWon++;
                $finish = (string) ($round['finish'] ?? '');

                if (array_key_exists($finish, $counts)) {
                    $counts[$finish]++;
                }
            }
        }

        return [
            'sf' => $counts['SF'],
            'of' => $counts['OF'],
            'bf' => $counts['BF'],
            'xf' => $counts['XF'],
            'matches_played' => $matchesPlayed,
            'rounds_won' => $roundsWon,
        ];
    }
}
