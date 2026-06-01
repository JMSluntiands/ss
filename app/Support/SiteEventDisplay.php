<?php

namespace App\Support;

use App\Models\SiteEvent;
use Illuminate\Support\Collection;

class SiteEventDisplay
{
    /**
     * @return list<string>
     */
    public static function tournamentColumns(): array
    {
        return [
            'id',
            'name',
            'tournament_type',
            'format',
            'group_stage_format',
            'final_stage_format',
            'swiss_rounds',
            'swiss_top_cut_players',
            'participants_per_group',
            'advance_per_group',
        ];
    }

    public static function applyFormatFromTournament(SiteEvent $event): SiteEvent
    {
        if ($event->relationLoaded('tournament') && $event->tournament) {
            $event->format = TournamentFormatSummary::for($event->tournament);
        }

        return $event;
    }

    /**
     * @param  Collection<int, SiteEvent>|SiteEvent  $events
     */
    public static function loadAndApplyFormat(Collection|SiteEvent $events): Collection|SiteEvent
    {
        if ($events instanceof SiteEvent) {
            $events->load(['tournament' => fn ($q) => $q->select(self::tournamentColumns())]);

            return self::applyFormatFromTournament($events);
        }

        $events->load(['tournament' => fn ($q) => $q->select(self::tournamentColumns())]);
        $events->each(fn (SiteEvent $event) => self::applyFormatFromTournament($event));

        return $events;
    }
}
