<?php

namespace App\Observers;

use App\Models\TournamentMatch;
use App\Services\MemberMatchRecordService;

class TournamentMatchObserver
{
    public function __construct(
        private MemberMatchRecordService $memberRecords,
    ) {}

    public function updated(TournamentMatch $match): void
    {
        if (! $match->wasChanged(['status', 'winner_id', 'is_draw'])) {
            return;
        }

        $this->memberRecords->syncForMatch($match);
    }

    public function created(TournamentMatch $match): void
    {
        $this->memberRecords->syncForMatch($match);
    }
}
