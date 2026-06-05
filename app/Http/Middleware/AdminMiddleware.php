<?php

namespace App\Http\Middleware;

use App\Support\UserAccountType;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class AdminMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = Auth::guard('platform_admin')->user() ?? $request->user();

        if (! $user || ! UserAccountType::isAdmin($user)) {
            return redirect()->route('admin.login');
        }

        return $next($request);
    }
}
