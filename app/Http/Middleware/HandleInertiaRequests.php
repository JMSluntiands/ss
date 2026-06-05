<?php

namespace App\Http\Middleware;

use App\Models\PlanUpgradeRequest;
use App\Models\SiteVisitorStat;
use App\Services\MemberAccountService;
use App\Services\MemberDashboardStatsService;
use App\Support\SiteAssets;
use App\Support\PlatformAdmin;
use App\Support\TournamentXAuth;
use App\Support\TournamentXDomain;
use App\Support\TournamentXPlan;
use Illuminate\Support\Facades\Auth;
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
        $user = PlatformAdmin::isRequest($request)
            ? (Auth::guard('platform_admin')->user() ?? $request->user())
            : (TournamentXAuth::isTournamentXRequest($request)
                ? TournamentXAuth::resolveUser($request)
                : ($request->user() ?? TournamentXAuth::user()));
        $authUser = null;

        if ($user) {
            $user->loadMissing('siteMember');
            $authUser = [
                ...$user->toArray(),
                'blader_name' => $user->blader_name,
                'tournament_blader_name' => app(MemberAccountService::class)->tournamentBladerName($user),
                'site_member_id' => $user->siteMember?->id,
                'site_member_image_url' => $user->siteMember?->image_url,
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
            'is_admin' => PlatformAdmin::isRequest($request) && ($user?->isAdminAccount() ?? false),
            'is_member_portal' => $user
                ? app(MemberDashboardStatsService::class)->isMemberDashboardUser($user)
                : false,
            'permissions' => [
                'can_create_tournaments' => $user?->canCreateTournaments() ?? false,
                'can_manage_tournaments' => $user?->canManageTournaments() ?? false,
                'can_use_judge' => $user?->canUseJudge() ?? false,
                'can_score_matches' => $user?->canScoreMatches() ?? false,
                'can_manage_events' => $user?->canManageEvents() ?? false,
            ],
            'tournamentx_plan' => $user ? TournamentXPlan::forUser($user) : null,
            'tournamentx_plan_label' => $user ? TournamentXPlan::label(TournamentXPlan::forUser($user)) : null,
            'tournamentx_plan_limits' => $user ? TournamentXPlan::limitsForUser($user) : null,
            'tournamentx_show_upgrade' => TournamentXPlan::showUpgrade($user),
            'tournamentx_upgrade_pending' => TournamentXPlan::hasPendingUpgradeRequest($user),
            'tournamentx_pricing_url' => TournamentXPlan::pricingUrl(),
            'tournamentx_upgrade_payment' => TournamentXPlan::upgradePaymentInfo(),
            'tournamentx_upgrade_details' => TournamentXPlan::upgradeDetails($user),
            'admin_pending_plan_upgrades' => PlatformAdmin::isRequest($request)
                ? PlanUpgradeRequest::where('status', 'pending')->count()
                : 0,
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
        ];
    }
}
