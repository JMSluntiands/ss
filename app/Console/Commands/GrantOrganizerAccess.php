<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

class GrantOrganizerAccess extends Command
{
    protected $signature = 'user:grant-organizer {email : User email address}';

    protected $description = 'Grant Tournament X organizer access (can create tournaments) to a user';

    public function handle(): int
    {
        $user = User::query()->where('email', $this->argument('email'))->first();

        if (! $user) {
            $this->error('User not found.');

            return self::FAILURE;
        }

        $user->update([
            'can_create_tournaments' => true,
        ]);

        $this->info("Organizer access granted for {$user->email} ({$user->name}).");
        $this->line('They will use Tournament X dashboard instead of the member portal.');

        return self::SUCCESS;
    }
}
