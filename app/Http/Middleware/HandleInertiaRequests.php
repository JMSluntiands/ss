<?php

namespace App\Http\Middleware;

use App\Models\SiteVisitorStat;
use App\Services\MemberAccountService;
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
        $authUser = null;

        if ($user) {
            $user->loadMissing('siteMember');
            $authUser = [
                ...$user->toArray(),
                'blader_name' => $user->blader_name,
                'tournament_blader_name' => app(MemberAccountService::class)->tournamentBladerName($user),
                'site_member_id' => $user->siteMember?->id,
            ];
        }

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
                'user' => $authUser,
            ],
            'is_admin' => $user?->isAdmin() ?? false,
            'permissions' => [
                'can_create_tournaments' => $user?->canCreateTournaments() ?? false,
                'can_manage_tournaments' => $user?->canManageTournaments() ?? false,
                'can_use_judge' => $user?->canUseJudge() ?? false,
                'can_score_matches' => $user?->canScoreMatches() ?? false,
                'can_manage_events' => $user?->canManageEvents() ?? false,
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
        ];
    }
}
