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

];
