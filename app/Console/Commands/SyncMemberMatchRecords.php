<?php

namespace App\Console\Commands;

use App\Services\MemberMatchRecordService;
use Illuminate\Console\Command;

class SyncMemberMatchRecords extends Command
{
    protected $signature = 'members:sync-match-records';

    protected $description = 'Recalculate site member wins, losses, and win rate from TournamentX match results';

    public function handle(MemberMatchRecordService $matchRecords): int
    {
        $members = $matchRecords->syncAllMembers();

        $this->info("Synced match records for {$members->count()} members.");

        return self::SUCCESS;
    }
}
