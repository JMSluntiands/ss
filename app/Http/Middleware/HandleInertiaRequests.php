<?php

namespace App\Http\Middleware;

use App\Models\SiteVisitorStat;
use App\Support\SiteAssets;
use App\Support\TournamentXDomain;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        $visitCount = $request->attributes->has('_site_visit_count')
            ? (int) $request->attributes->get('_site_visit_count')
            : SiteVisitorStat::currentTotal();

        return [
            ...parent::share($request),
            'csrf_token' => csrf_token(),
            'site_visit_count' => $visitCount,
            'site_logo_url' => SiteAssets::logoUrl(),
            'tournament_x_logo_url' => SiteAssets::tournamentXLogoUrl(),
            'tournamentx_url' => TournamentXDomain::baseUrl(),
            'tournamentx_enabled' => TournamentXDomain::isEnabled(),
            'main_site_url' => TournamentXDomain::mainSiteUrl(),
            'auth' => [
                'user' => $user,
            ],
            'is_admin' => $user?->isAdmin() ?? false,
            'permissions' => [
                'can_create_tournaments' => $user ? ($user->isAdmin() || $user->can_create_tournaments) : false,
                'can_manage_tournaments' => $user ? ($user->isAdmin() || $user->can_manage_tournaments) : false,
                'can_use_judge' => $user ? ($user->isAdmin() || $user->can_use_judge) : false,
                'can_score_matches' => $user ? ($user->isAdmin() || $user->can_score_matches) : false,
                'can_manage_events' => $user ? ($user->isAdmin() || $user->can_manage_events) : false,
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
        ];
    }
}
