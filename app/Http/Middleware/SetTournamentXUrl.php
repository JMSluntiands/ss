<?php

namespace App\Http\Middleware;

use App\Support\TournamentXDomain;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\URL;
use Symfony\Component\HttpFoundation\Response;

class SetTournamentXUrl
{
    public function handle(Request $request, Closure $next): Response
    {
        if (TournamentXDomain::isRequest($request)) {
            URL::forceRootUrl(TournamentXDomain::baseUrl());
        }

        return $next($request);
    }
}
