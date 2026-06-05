<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Support\PlatformAdmin;
use App\Support\TournamentXPlan;
use App\Support\UserAccountType;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;

class MakePlatformAdmin extends Command
{
    protected $signature = 'platform:make-admin
                            {email : Admin email address}
                            {--name= : Display name}
                            {--password= : Password (prompted if omitted)}';

    protected $description = 'Create or promote a platform admin (Shadow Syndicate + Tournament X)';

    public function handle(): int
    {
        $email = strtolower(trim((string) $this->argument('email')));
        $name = $this->option('name') ?: 'Platform Admin';
        $password = $this->option('password') ?: $this->secret('Password');

        if ($password === null || strlen($password) < 8) {
            $this->error('Password must be at least 8 characters.');

            return self::FAILURE;
        }

        $user = User::query()->where('email', $email)->first();

        if ($user) {
            $user->update([
                'role' => 'admin',
                'account_type' => UserAccountType::ADMIN,
                'can_create_tournaments' => true,
                'can_manage_tournaments' => true,
                'can_manage_events' => true,
                'can_use_judge' => true,
                'can_score_matches' => true,
                'tournamentx_plan' => TournamentXPlan::COMMUNITY,
            ]);
            $this->info("Updated existing user {$email} as platform admin.");
        } else {
            User::create([
                'name' => $name,
                'email' => $email,
                'password' => Hash::make($password),
                'role' => 'admin',
                'account_type' => UserAccountType::ADMIN,
                'can_create_tournaments' => true,
                'can_manage_tournaments' => true,
                'can_manage_events' => true,
                'can_use_judge' => true,
                'can_score_matches' => true,
                'tournamentx_plan' => TournamentXPlan::COMMUNITY,
            ]);
            $this->info("Created platform admin {$email}.");
        }

        $this->newLine();
        $this->line('Login URL (bookmark this — not linked anywhere public):');
        $this->line(PlatformAdmin::loginUrl());
        $this->newLine();
        $this->line('Change the path in .env: PLATFORM_ADMIN_PATH=your-secret-slug');

        return self::SUCCESS;
    }
}
