<?php

namespace App\Http\Middleware;

use App\Support\TournamentXDomain;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ConfigureTournamentXSession
{
    public function handle(Request $request, Closure $next): Response
    {
        $request->attributes->set('tournamentx_context', true);

        // Keep the default session cookie on the same host so a Tournament X login
        // is visible on the main site (events, shared auth.user). Use a separate
        // cookie only on a dedicated Tournament X subdomain.
        if (TournamentXDomain::host()) {
            config([
                'session.cookie' => env('TOURNAMENTX_SESSION_COOKIE', 'tournamentx_session'),
            ]);
        }

        config(['auth.defaults.guard' => 'tournamentx']);

        return $next($request);
    }
}
