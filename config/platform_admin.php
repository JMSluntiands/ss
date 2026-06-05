<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Hidden admin URL prefix (main site only — not on Tournament X)
    |--------------------------------------------------------------------------
    |
    | Example: ss-platform-control → login at /ss-platform-control/login
    | Change PLATFORM_ADMIN_PATH in .env to a secret value only you know.
    |
    */

    'path' => env('PLATFORM_ADMIN_PATH', 'ss-platform-control'),

    'session_cookie' => env('PLATFORM_ADMIN_SESSION_COOKIE', 'platform_admin_session'),

];
