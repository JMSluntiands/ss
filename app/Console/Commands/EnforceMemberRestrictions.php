<?php

namespace App\Console\Commands;

use App\Models\SiteMember;
use App\Services\MemberAccountService;
use Illuminate\Console\Command;

class EnforceMemberRestrictions extends Command
{
    protected $signature = 'members:enforce-restrictions';

    protected $description = 'Remove organizer permissions from linked Shadow Syndicate member accounts';

    public function handle(MemberAccountService $accounts): int
    {
        $count = 0;

        SiteMember::query()
            ->with('user')
            ->whereNotNull('user_id')
            ->each(function (SiteMember $member) use ($accounts, &$count) {
                if (! $member->user) {
                    return;
                }

                $accounts->enforceMemberRestrictions($member->user);
                $count++;
            });

        $this->info("Updated permissions for {$count} linked member account(s).");

        return self::SUCCESS;
    }
}
