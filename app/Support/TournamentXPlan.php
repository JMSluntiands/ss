<?php

namespace App\Support;

use App\Models\PlanUpgradeRequest;
use App\Models\User;
use App\Services\MemberDashboardStatsService;
use App\Services\SiteSettingsService;
use Illuminate\Support\Facades\Route;

class TournamentXPlan
{
    public const STARTER = 'starter';

    public const COMMUNITY = 'community';

    public const PRO = 'pro';

    public static function forUser(?User $user): string
    {
        if (! $user) {
            return self::STARTER;
        }

        if ($user->isAdmin()) {
            return self::COMMUNITY;
        }

        $plan = $user->tournamentx_plan ?? self::STARTER;

        if (! in_array($plan, [self::STARTER, self::COMMUNITY, self::PRO], true)) {
            $plan = self::STARTER;
        }

        return $plan;
    }

    public static function label(string $plan): string
    {
        return match ($plan) {
            self::COMMUNITY => 'Community',
            self::PRO => 'Pro',
            default => 'Starter',
        };
    }

    public static function showUpgrade(?User $user): bool
    {
        if (! $user || $user->isAdmin()) {
            return false;
        }

        if (app(MemberDashboardStatsService::class)->isMemberDashboardUser($user)) {
            return false;
        }

        if (self::hasPendingUpgradeRequest($user)) {
            return false;
        }

        return self::forUser($user) === self::STARTER;
    }

    public static function hasPendingUpgradeRequest(?User $user): bool
    {
        if (! $user) {
            return false;
        }

        return PlanUpgradeRequest::query()
            ->where('user_id', $user->id)
            ->where('status', 'pending')
            ->exists();
    }

    public static function applyEntitlements(User $user, string $plan): void
    {
        $entitlements = match ($plan) {
            self::COMMUNITY, self::PRO => [
                'tournamentx_plan' => $plan,
                'can_use_judge' => true,
                'can_score_matches' => true,
            ],
            default => [
                'tournamentx_plan' => self::STARTER,
                'can_use_judge' => false,
                'can_score_matches' => false,
            ],
        };

        $user->update($entitlements);
    }

    /**
     * @return array{amount: string, period: string, payment_method: string, instructions: string, payment_qr_url: string|null}
     */
    public static function upgradePaymentInfo(): array
    {
        $payment = app(SiteSettingsService::class)->planUpgradePayment();
        $qrPath = $payment['payment_qr'] ?? null;

        return [
            'amount' => $payment['amount'],
            'period' => $payment['period'],
            'payment_method' => $payment['payment_method'],
            'instructions' => $payment['instructions'],
            'payment_qr_url' => $qrPath && Route::has('plan-upgrade.payment-qr')
                ? route('plan-upgrade.payment-qr', absolute: true)
                : null,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public static function upgradeDetails(?User $user): array
    {
        $settings = app(SiteSettingsService::class);
        $pricing = collect($settings->pricing());
        $defaults = collect(config('tournamentx.pricing', []));

        $community = $pricing->firstWhere('id', 'community')
            ?? $defaults->firstWhere('id', 'community')
            ?? [];
        $starter = $pricing->firstWhere('id', 'free')
            ?? $defaults->firstWhere('id', 'free')
            ?? [];

        $payment = self::upgradePaymentInfo();

        return [
            'current_plan' => [
                'name' => $user ? self::label(self::forUser($user)) : 'Starter',
                'description' => (string) ($starter['description'] ?? 'Free plan for small events.'),
                'features' => array_values($starter['features'] ?? [
                    '1 active tournament',
                    'Up to 50 players',
                    'No judge panel or live scoring',
                ]),
            ],
            'target_plan' => [
                'name' => (string) ($community['name'] ?? 'Community'),
                'description' => (string) ($community['description'] ?? 'For regular community organizers.'),
                'price' => (string) ($community['price'] ?? $payment['amount']),
                'period' => (string) ($community['period'] ?? $payment['period']),
                'features' => array_values($community['features'] ?? []),
            ],
            'payment' => $payment,
            'steps' => [
                'Review the Community plan features below.',
                'Send '.$payment['amount'].($payment['period'] ? ' '.$payment['period'] : '').' via '.$payment['payment_method'].'.',
                'Upload a clear screenshot of your payment receipt.',
                'An admin will verify your payment and activate your plan.',
            ],
        ];
    }

    public static function pricingUrl(): string
    {
        if (Route::has('tournamentx.home')) {
            return route('tournamentx.home', absolute: true).'#pricing';
        }

        $path = TournamentXDomain::host() ? '' : '/tournamentx';

        return TournamentXDomain::url($path).'#pricing';
    }

    public static function maxParticipantsForTournament(\App\Models\Tournament $tournament): ?int
    {
        $tournament->loadMissing('user');
        $planMax = self::limitsForUser($tournament->user)['max_players'];
        $cap = $tournament->max_participants;

        if ($planMax !== null && $cap !== null) {
            return min($planMax, $cap);
        }

        return $planMax ?? $cap;
    }

    /**
     * @return array{max_players: int|null, judge_panel: bool, live_scoring: bool}
     */
    public static function limitsForUser(?User $user): array
    {
        $plan = self::forUser($user);

        return match ($plan) {
            self::COMMUNITY, self::PRO => [
                'max_players' => null,
                'judge_panel' => true,
                'live_scoring' => true,
            ],
            default => [
                'max_players' => (int) config('tournamentx.plans.starter.max_players', 50),
                'judge_panel' => false,
                'live_scoring' => false,
            ],
        };
    }
}
