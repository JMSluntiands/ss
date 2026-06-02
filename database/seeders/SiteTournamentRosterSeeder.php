<?php

namespace Database\Seeders;

use App\Models\SiteTournamentRoster;
use Illuminate\Database\Seeder;

class SiteTournamentRosterSeeder extends Seeder
{
    public function run(): void
    {
        $tournaments = [
            [
                'name' => 'Metro Manila Beyblade Open 2025',
                'event_date' => '2025-11-15',
                'location' => 'SM Mall of Asia, Pasay',
                'result' => 'Top 4 Team',
                'description' => 'First major outing as Shadow Syndicate — strong showing in Swiss rounds.',
                'roster' => [
                    ['name' => 'BladerX', 'placement' => 'Top 8'],
                    ['name' => 'StormRipper', 'placement' => 'Top 4'],
                    ['name' => 'NightFang', 'placement' => 'Top 16'],
                    ['name' => 'CrimsonEdge'],
                    ['name' => 'VortexKing'],
                ],
                'sort_order' => 1,
            ],
            [
                'name' => 'Cavite Community Cup',
                'event_date' => '2025-09-20',
                'location' => 'Dasmariñas, Cavite',
                'result' => 'Champion',
                'description' => 'Shadow Syndicate took home the team trophy with a dominant finals run.',
                'roster' => [
                    ['name' => 'StormRipper', 'placement' => '1st'],
                    ['name' => 'BladerX', 'placement' => '3rd'],
                    ['name' => 'IronSpin'],
                    ['name' => 'ShadowStrike'],
                ],
                'sort_order' => 2,
            ],
            [
                'name' => 'Online Swiss Showdown',
                'event_date' => '2025-07-08',
                'location' => 'Online',
                'result' => 'Participated',
                'description' => 'Community-run online event — great practice for newer recruits.',
                'roster' => [
                    ['name' => 'NightFang'],
                    ['name' => 'CrimsonEdge'],
                    ['name' => 'NovaBlade'],
                    ['name' => 'EchoSpin'],
                    ['name' => 'PhantomX'],
                    ['name' => 'BlitzCore'],
                ],
                'sort_order' => 3,
            ],
        ];

        foreach ($tournaments as $data) {
            SiteTournamentRoster::updateOrCreate(
                ['name' => $data['name']],
                $data
            );
        }
    }
}
