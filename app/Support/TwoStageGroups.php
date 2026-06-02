<?php

namespace App\Support;

use App\Models\Participant;
use App\Models\Tournament;
use Illuminate\Support\Collection;

final class TwoStageGroups
{
    public static function usesGroupStage(Tournament $tournament): bool
    {
        return $tournament->tournament_type === 'two_stage'
            && in_array($tournament->format, ['swiss', 'round_robin'], true);
    }

    public static function groupCount(int $participantCount, Tournament $tournament): int
    {
        $perGroup = (int) ($tournament->participants_per_group ?? 0);

        return $perGroup > 0 ? max(2, (int) ceil($participantCount / $perGroup)) : 2;
    }

    public static function groupSize(int $participantCount, Tournament $tournament): int
    {
        return (int) ceil($participantCount / self::groupCount($participantCount, $tournament));
    }

    /**
     * Split participants into seed-ordered groups (Group 1, Group 2, …).
     *
     * @param  Collection<int, Participant>  $participants
     * @return Collection<int, Collection<int, Participant>>
     */
    public static function split(Collection $participants, Tournament $tournament): Collection
    {
        $ordered = $participants->sortBy('seed')->values();
        $total = $ordered->count();
        if ($total === 0) {
            return collect();
        }

        $groupCount = self::groupCount($total, $tournament);
        $groupSize = self::groupSize($total, $tournament);
        $groups = collect();

        for ($g = 0; $g < $groupCount; $g++) {
            $slice = $ordered->slice($g * $groupSize, $groupSize)->values();
            if ($slice->isNotEmpty()) {
                $groups->push($slice);
            }
        }

        return $groups;
    }

    public static function labelForIndex(int $index): string
    {
        return 'Group '.($index + 1);
    }
}
