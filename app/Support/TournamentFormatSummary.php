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

    private static function stageFormatLabel(?string $key): string
    {
        if ($key === null || $key === '' || preg_match('/^\d+$/', $key)) {
            return '';
        }

        return self::LABELS[$key] ?? str_replace('_', ' ', $key);
    }

    public static function for(Tournament $tournament): string
    {
        if ($tournament->tournament_type === 'two_stage') {
            $groupFmt = self::stageFormatLabel($tournament->group_stage_format)
                ?: self::stageFormatLabel($tournament->format)
                ?: 'Swiss';
            $finalFmt = self::stageFormatLabel($tournament->final_stage_format) ?: 'Single Elimination';
            $roundsPart = $tournament->swiss_rounds
                ? "{$tournament->swiss_rounds} {$groupFmt} rounds"
                : $groupFmt;

            $cutPart = '';
            $advance = $tournament->advance_per_group;
            $perGroup = $tournament->participants_per_group;
            if ($advance) {
                $topPerGroup = $perGroup ? min((int) $advance, (int) $perGroup) : (int) $advance;
                $cutPart = " · Top {$topPerGroup} per group";
                $playoffTotal = $tournament->swiss_top_cut_players;
                if ($playoffTotal && $playoffTotal >= 2) {
                    $cutPart .= " ({$playoffTotal} to playoffs)";
                }
            } elseif ($tournament->swiss_top_cut_players && $tournament->swiss_top_cut_players >= 2) {
                $cutPart = " · Top {$tournament->swiss_top_cut_players} to playoffs";
            }

            return "Two Stage: {$roundsPart}{$cutPart} → {$finalFmt}";
        }

        $mainFmt = self::stageFormatLabel($tournament->format);
        if (in_array($tournament->format, ['swiss', 'round_robin'], true)) {
            $rounds = $tournament->swiss_rounds ? "{$tournament->swiss_rounds} rounds" : '';
            $cut = $tournament->swiss_top_cut_players ? " · Top {$tournament->swiss_top_cut_players} cut" : '';
            $roundsPart = $rounds ? " ({$rounds})" : '';

            return $mainFmt.$roundsPart.$cut;
        }

        return $mainFmt ?: (string) $tournament->format;
    }
}
