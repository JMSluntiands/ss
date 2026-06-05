<?php

namespace App\Support;

use App\Services\SiteSettingsService;

class TournamentXMarketing
{
    /**
     * @return array<string, mixed>
     */
    public static function inertiaProps(): array
    {
        $settings = app(SiteSettingsService::class);

        return [
            'registrationEnabled' => (bool) config('tournamentx.registration_enabled'),
            'loginUrl' => route('login'),
            'registerUrl' => route('register'),
            'homeUrl' => route('tournamentx.home'),
            'mainSiteUrl' => TournamentXDomain::mainSiteUrl(),
            'promo' => $settings->promo(),
            'pricing' => $settings->pricing(),
        ];
    }
}
