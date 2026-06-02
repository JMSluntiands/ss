<?php

namespace App\Console\Commands;

use App\Models\SiteMember;
use App\Services\MemberAccountService;
use Illuminate\Console\Command;

class ProvisionMemberAccounts extends Command
{
    protected $signature = 'members:provision-accounts
                            {--password= : Default password for newly created accounts}
                            {--dry-run : Show what would be created without writing}';

    protected $description = 'Create TournamentX user accounts for Shadow Syndicate site members without one';

    public function handle(MemberAccountService $service): int
    {
        $dryRun = (bool) $this->option('dry-run');
        $password = $this->option('password');

        if ($password) {
            config(['tournamentx.member_default_password' => $password]);
        }

        $members = SiteMember::query()->with('user')->orderBy('sort_order')->get();

        if ($members->isEmpty()) {
            $this->warn('No site members found.');

            return self::SUCCESS;
        }

        foreach ($members as $member) {
            if ($member->user_id) {
                $this->line("✓ {$member->name} — already linked ({$member->user->email})");

                continue;
            }

            $email = $service->defaultEmailForMember($member);

            if ($dryRun) {
                $this->line("→ {$member->name} — would create {$email}");

                continue;
            }

            $user = $service->provisionForMember($member);
            $this->info("✓ {$member->name} — account created ({$user->email})");
        }

        if (! $dryRun) {
            $this->newLine();
            $this->comment('Default password: '.config('tournamentx.member_default_password'));
            $this->comment('Members should log in on TournamentX and change their password under Profile.');
        }

        return self::SUCCESS;
    }
}
