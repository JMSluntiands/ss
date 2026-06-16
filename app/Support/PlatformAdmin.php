<?php

namespace App\Support;

use Illuminate\Support\Facades\Route;

class PlatformAdmin
{
    public static function pathPrefix(): string
    {
        $path = trim((string) config('platform_admin.path', 'ss-platform-control'), '/');

        return $path !== '' ? $path : 'ss-platform-control';
    }

    public static function loginUrl(): string
    {
        if (Route::has('admin.login')) {
            return route('admin.login', absolute: true);
        }

        return url('/'.self::pathPrefix().'/login');
    }

    public static function dashboardUrl(): string
    {
        if (Route::has('admin.dashboard')) {
            return route('admin.dashboard', absolute: true);
        }

        return url('/'.self::pathPrefix());
    }

    public static function isRequest(?\Illuminate\Http\Request $request = null): bool
    {
        $request ??= request();

        return $request && (bool) $request->attributes->get('platform_admin_context');
    }
}
