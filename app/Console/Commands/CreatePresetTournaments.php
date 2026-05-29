<?php

namespace App\Console\Commands;

use App\Models\Participant;
use App\Models\Tournament;
use App\Models\User;
use Illuminate\Console\Command;

class CreatePresetTournaments extends Command
{
    protected $signature = 'tournament:create-presets
                            {--user= : User ID (defaults to first user)}
                            {--force : Recreate if slug already exists (deletes old tournament)}';

    protected $description = 'Create three preset BeybladeX tournament templates with seeded players';

    public function handle(): int
    {
        $userId = $this->option('user') ? (int) $this->option('user') : User::query()->value('id');

        if (! $userId) {
            $this->error('No user found. Create a user first or pass --user=ID');

            return self::FAILURE;
        }

        $presets = [
            [
                'slug' => 'ss-swiss-top16-32p',
                'name' => 'Single Stage — Swiss 5R → Top 16 SE (32 players)',
                'description' => 'Single stage: Swiss (5 rounds), then single-elimination playoff for top 16. Add exactly 32 players.',
                'tournament_type' => 'single_elimination',
                'format' => 'swiss',
                'group_stage_format' => null,
                'final_stage_format' => null,
                'swiss_rounds' => 5,
                'swiss_top_cut_players' => 16,
                'participants_per_group' => null,
                'advance_per_group' => null,
                'player_count' => 32,
            ],
            [
                'slug' => 'ss-swiss-top32-64p',
                'name' => 'Single Stage — Swiss 5R → Top 32 SE (64 players)',
                'description' => 'Single stage: Swiss (5 rounds), then single-elimination playoff for top 32. Add exactly 64 players.',
                'tournament_type' => 'single_elimination',
                'format' => 'swiss',
                'group_stage_format' => null,
                'final_stage_format' => null,
                'swiss_rounds' => 5,
                'swiss_top_cut_players' => 32,
                'participants_per_group' => null,
                'advance_per_group' => null,
                'player_count' => 64,
            ],
            [
                'slug' => 'ts-swiss-top64-128p',
                'name' => 'Two Stage — Swiss 5R → Top 64 SE (128 players)',
                'description' => 'Two stage: Swiss group stage (5 rounds, 2 groups of 64, top 32 per group), then single-elimination finals per group. Add exactly 128 players.',
                'tournament_type' => 'two_stage',
                'format' => 'swiss',
                'group_stage_format' => 'swiss',
                'final_stage_format' => 'single_elimination',
                'swiss_rounds' => 5,
                'swiss_top_cut_players' => null,
                'participants_per_group' => 64,
                'advance_per_group' => 32,
                'player_count' => 128,
            ],
        ];

        $created = [];

        foreach ($presets as $preset) {
            $slug = $preset['slug'];
            $existing = Tournament::where('slug', $slug)->first();

            if ($existing) {
                if (! $this->option('force')) {
                    $this->warn("Skipped “{$preset['name']}” — slug [{$slug}] exists (id #{$existing->id}). Use --force to replace.");

                    continue;
                }

                $existing->participants()->delete();
                $existing->matches()->delete();
                $existing->swissStandings()->delete();
                $existing->delete();
                $this->line("  Replaced existing tournament slug [{$slug}].");
            }

            $tournament = Tournament::create([
                'user_id' => $userId,
                'name' => $preset['name'],
                'slug' => $slug,
                'description' => $preset['description'],
                'tournament_type' => $preset['tournament_type'],
                'format' => $preset['format'],
                'group_stage_format' => $preset['group_stage_format'],
                'final_stage_format' => $preset['final_stage_format'],
                'participants_per_group' => $preset['participants_per_group'],
                'advance_per_group' => $preset['advance_per_group'],
                'swiss_rounds' => $preset['swiss_rounds'],
                'swiss_top_cut_players' => $preset['swiss_top_cut_players'],
                'status' => 'pending',
                'break_ties' => false,
                'third_place_match' => false,
                'placement_matches_fifth_seventh' => false,
            ]);

            $this->seedPlayers($tournament, (int) $preset['player_count']);
            $created[] = $tournament;
        }

        if ($created === []) {
            $this->warn('No new tournaments were created.');

            return self::SUCCESS;
        }

        $this->newLine();
        $this->info('Created preset tournaments (status: pending — open each and click Start Tournament):');
        $this->newLine();

        foreach ($created as $t) {
            $url = url('/tournaments/'.$t->id);
            $this->line("  #{$t->id}  {$t->name}");
            $this->line("       {$t->participants()->count()} players · /tournaments/{$t->id}");
            $this->line("       slug: {$t->slug}");
            $this->newLine();
        }

        return self::SUCCESS;
    }

    private function seedPlayers(Tournament $tournament, int $count): void
    {
        $names = $this->demoNames($count);

        foreach ($names as $i => $name) {
            Participant::create([
                'tournament_id' => $tournament->id,
                'name' => $name,
                'seed' => $i + 1,
            ]);
        }
    }

    /**
     * @return list<string>
     */
    private function demoNames(int $count): array
    {
        $pool = [
            'Atomic IGN', 'Warden', 'Cedar', 'Blitz Striker', 'Nova Fang', 'Iron Gale',
            'Phantom Edge', 'Storm Breaker', 'Volt King', 'Crimson Spin', 'Azure Drift',
            'Titan Loop', 'Echo Blade', 'Frost Bite', 'Solar Rex', 'Night Comet',
            'Rapid Fire', 'Steel Halo', 'Turbo Fang', 'Zero Orbit', 'Hyper Nova',
            'Blade Runner', 'Cosmic Drift', 'Delta Storm', 'Ember Lock', 'Fusion X',
            'Gravity Well', 'Havoc Spin', 'Impact Zone', 'Jet Stream', 'Kinetic Edge',
            'Laser Loop', 'Meteor Dash', 'Nebula Strike', 'Omega Turn', 'Pulse Wave',
            'Quantum Rip', 'Rift Guard', 'Shadow Sync', 'Thunder Coil', 'Ultra Drive',
            'Vortex Ace', 'Wild Axis', 'Xeno Blade', 'Yokai Spin', 'Zenith Core',
        ];

        $names = [];
        for ($i = 0; $i < $count; $i++) {
            if ($i < count($pool)) {
                $names[] = $pool[$i];
            } else {
                $names[] = 'Player '.($i + 1);
            }
        }

        return $names;
    }
}
