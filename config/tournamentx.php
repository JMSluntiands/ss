<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Tournament X subdomain (login + tournament management)
    |--------------------------------------------------------------------------
    |
    | Example: tournamentx.luntian.com.au
    | Leave empty on local dev to serve the app on the same host as the public site.
    |
    */

    'registration_enabled' => env('TOURNAMENTX_REGISTRATION_ENABLED', false),

    'domain' => env('TOURNAMENTX_DOMAIN'),

    'url' => env('TOURNAMENTX_URL', env('APP_URL')),

    /*
    |--------------------------------------------------------------------------
    | Main public site host (Shadow Syndicate)
    |--------------------------------------------------------------------------
    |
    | Example: luntian.com.au or shadowsyndicate.luntian.com.au
    | Leave empty to allow the public site on any host (typical for localhost).
    |
    */

    'main_domain' => env('MAIN_SITE_DOMAIN'),

    'main_url' => env('MAIN_SITE_URL', env('APP_URL')),

    /*
    |--------------------------------------------------------------------------
    | Shadow Syndicate member accounts (provisioned from site roster)
    |--------------------------------------------------------------------------
    */

    'member_email_domain' => env('MEMBER_EMAIL_DOMAIN', 'shadowsyndicate.com'),

    'member_default_password' => env('MEMBER_DEFAULT_PASSWORD', 'ShadowSyndicate2026!'),

    /*
    |--------------------------------------------------------------------------
    | Organizer plan limits (enforced in app; upgrade via pricing)
    |--------------------------------------------------------------------------
    */

    'plans' => [
        'starter' => [
            'max_players' => 50,
            'max_active_tournaments' => 1,
            'judge_panel' => false,
            'live_scoring' => false,
        ],
        'community' => [
            'max_players' => null,
            'max_active_tournaments' => null,
            'judge_panel' => true,
            'live_scoring' => true,
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Tournament X marketing site (subdomain landing)
    |--------------------------------------------------------------------------
    */

    'promo' => [
        'enabled' => env('TOURNAMENTX_PROMO_ENABLED', true),
        'badge' => env('TOURNAMENTX_PROMO_BADGE', 'Featured'),
        'title' => env('TOURNAMENTX_PROMO_TITLE', 'Run your next Beyblade event on Tournament X'),
        'subtitle' => env(
            'TOURNAMENTX_PROMO_SUBTITLE',
            'Brackets, live judging, and public spectator pages — free to start for community organizers.',
        ),
        'cta_label' => env('TOURNAMENTX_PROMO_CTA', 'Create free account'),
    ],

    'plan_upgrade' => [
        'amount' => '₱499',
        'period' => '/ month',
        'payment_method' => 'GCash / Maya',
        'instructions' => 'Pay the Community plan fee, then upload a screenshot of your payment below.',
        'payment_qr' => null,
    ],

    'pricing' => [
        [
            'id' => 'free',
            'name' => 'Starter',
            'price' => 'Free',
            'period' => 'forever',
            'description' => 'Perfect for shop events and small club nights.',
            'featured' => false,
            'cta_label' => 'Get started',
            'features' => [
                '1 active tournament',
                'Up to 50 players',
                'All bracket formats',
                'Public live bracket page',
                'No judge panel or live scoring',
            ],
        ],
        [
            'id' => 'community',
            'name' => 'Community',
            'price' => '₱499',
            'period' => '/ month',
            'description' => 'For regular Shadow Syndicate–style communities.',
            'featured' => true,
            'cta_label' => 'Get started',
            'features' => [
                'Unlimited tournaments',
                'Unlimited players',
                'Judge panel & live scoring',
                'Multi-stadium assignment',
                'Event registration sync',
                'Priority support',
            ],
        ],
        [
            'id' => 'pro',
            'name' => 'Pro',
            'price' => 'Coming soon',
            'period' => '',
            'description' => 'Team formats and league tools for competitive play.',
            'featured' => false,
            'coming_soon' => true,
            'cta_label' => 'Coming soon',
            'features' => [
                '3v3, 5v5 & 2v2 all-in brackets',
                'Free website',
                'Everything in Community',
                'Custom branding',
                'Sponsor banner slots',
                'Dedicated onboarding',
            ],
        ],
    ],

];
