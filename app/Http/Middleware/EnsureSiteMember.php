<?php

namespace App\Http\Middleware;

use App\Support\UserAccountType;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureSiteMember
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user || ! UserAccountType::isMember($user)) {
            abort(403, 'This area is for Shadow Syndicate members only.');
        }

        return $next($request);
    }
}
