<?php

namespace App\Http\Middleware;

use App\Models\SiteVisitorStat;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class TrackSiteVisit
{
    /**
     * Route names that count as a public "website" page view (GET only).
     * Excludes APIs, live polling, authenticated app areas, and admin.
     *
     * @var list<string>
     */
    private const TRACKED_ROUTE_NAMES = [
        'home',
        'members',
        'events',
        'events.show',
        'blog',
        'blog.show',
        'jersey',
        'tournaments.public',
        'judge.login',
        'login',
        'password.request',
        'password.reset',
    ];

    public function handle(Request $request, Closure $next): Response
    {
        if ($request->isMethod('GET') && in_array($request->route()?->getName(), self::TRACKED_ROUTE_NAMES, true)) {
            $total = SiteVisitorStat::incrementAndGetTotal();
            $request->attributes->set('_site_visit_count', $total);
        }

        return $next($request);
    }
}
