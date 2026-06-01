<?php

namespace App\Support;

use App\Models\Tournament;

class TournamentFormatSummary
{
    private const LABELS = [
        'single_elimination' => 'Single Elimination',
        'double_elimination' => 'Double Elimination',
        'round_robin' => 'Round Robin',
        'swiss' => 'Swiss',
    ];

    public static function for(Tournament $tournament): string
    {
        $label = fn (?string $key) => ($key && (self::LABELS[$key] ?? null)) ?: $key ?: '';

        if ($tournament->tournament_type === 'two_stage') {
            $groupFmt = $label($tournament->group_stage_format ?: $tournament->format);
            $finalFmt = $label($tournament->final_stage_format ?: 'single_elimination');
            $rounds = $tournament->swiss_rounds
                ? "{$tournament->swiss_rounds} {$groupFmt} rounds"
                : $groupFmt;

            $cut = '';
            $perGroup = $tournament->participants_per_group;
            $advance = $tournament->advance_per_group;
            if ($perGroup && $advance) {
                $advanceDisplay = min((int) $advance, (int) $perGroup);
                $cut = ", top {$advanceDisplay} per group ({$perGroup} per group)";
            }

            return "Two Stage: {$rounds}{$cut} → {$finalFmt}";
        }

        if (in_array($tournament->format, ['swiss', 'round_robin'], true)) {
            $rounds = $tournament->swiss_rounds ? "{$tournament->swiss_rounds} rounds" : '';
            $cut = $tournament->swiss_top_cut_players ? ", top {$tournament->swiss_top_cut_players} cut" : '';
            $roundsPart = $rounds ? " ({$rounds})" : '';

            return $label($tournament->format).$roundsPart.$cut;
        }

        return $label($tournament->format);
    }
}
