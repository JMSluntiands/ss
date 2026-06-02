<?php

namespace Database\Seeders;

use App\Models\EventRegistration;
use App\Models\SiteEvent;
use Illuminate\Database\Seeder;

class EventRegistrationSampleSeeder extends Seeder
{
    public function run(): void
    {
        $event = SiteEvent::query()
            ->where('is_upcoming', true)
            ->where('slots', '32')
            ->first();

        if (! $event) {
            $this->command?->warn('No upcoming event with 32 slots found.');

            return;
        }

        EventRegistration::query()
            ->where('site_event_id', $event->id)
            ->whereIn('status', ['tentative', 'confirmed'])
            ->delete();

        $names = [
            'Kai Storm', 'Ren Blaze', 'Yuki Frost', 'Hiro Drift', 'Akira Spin',
            'Takeshi Edge', 'Ryo Nexus', 'Sora Vortex', 'Daiki Strike', 'Kenji Burst',
            'Mika Orbit', 'Haruto Dash', 'Shin Cyclone', 'Taro Impact', 'Naoki Flux',
            'Eiji Razor', 'Kaito Nova', 'Riku Phantom', 'Sota Zenith', 'Yuto Apex',
            'Minato Surge', 'Hayato Pulse', 'Rei Titan', 'Jun Maverick', 'Kazuki Echo',
            'Tsubasa Glide', 'Issei Rampage', 'Nori Quake', 'Goro Tempest', 'Leo Prism',
            'Masaru Bolt', 'Satoshi Fury',
        ];

        foreach ($names as $index => $name) {
            EventRegistration::create([
                'site_event_id' => $event->id,
                'user_id' => null,
                'full_name' => $name,
                'entry_type' => 'single',
                'blader_name_1' => $name,
                'blader_name_2' => null,
                'payment_proof' => null,
                'status' => $index < 20 ? 'confirmed' : 'tentative',
            ]);
        }

        $this->command?->info("Seeded 32 registrations for \"{$event->title}\" (event #{$event->id}).");
    }
}
