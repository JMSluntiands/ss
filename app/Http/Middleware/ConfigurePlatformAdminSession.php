<?php

namespace App\Http\Middleware;

use App\Support\PlatformAdmin;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ConfigurePlatformAdminSession
{
    public function handle(Request $request, Closure $next): Response
    {
        $request->attributes->set('platform_admin_context', true);

        config([
            'session.cookie' => config('platform_admin.session_cookie', 'platform_admin_session'),
            'auth.defaults.guard' => 'platform_admin',
        ]);

        return $next($request);
    }

    public static function appliesToPath(string $path): bool
    {
        $prefix = PlatformAdmin::pathPrefix();

        return $path === $prefix || str_starts_with($path, $prefix.'/');
    }
}
