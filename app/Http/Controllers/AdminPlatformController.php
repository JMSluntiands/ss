<?php

namespace App\Http\Controllers;

use App\Services\SiteSettingsService;
use App\Support\TournamentXDomain;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\Response as HttpResponse;

class AdminPlatformController extends Controller
{
    public function __construct(
        private SiteSettingsService $settings,
    ) {}

    public function sites(): Response
    {
        return Inertia::render('Admin/Platform/Sites', [
            'sites' => [
                'main_site_url' => TournamentXDomain::mainSiteUrl(),
                'main_site_domain' => config('tournamentx.main_domain'),
                'tournamentx_url' => TournamentXDomain::baseUrl(),
                'tournamentx_domain' => config('tournamentx.domain'),
                'tournamentx_home' => route('tournamentx.home', absolute: true),
                'app_url' => config('app.url'),
            ],
            'promo' => $this->settings->promo(),
            'promoDefaults' => config('tournamentx.promo', []),
        ]);
    }

    public function pricing(): Response
    {
        $planUpgrade = $this->settings->planUpgradePayment();

        return Inertia::render('Admin/Platform/Pricing', [
            'pricing' => $this->settings->pricing(),
            'defaults' => config('tournamentx.pricing', []),
            'usesOverride' => $this->usesPricingOverride(),
            'planUpgradePayment' => [
                ...$planUpgrade,
                'payment_qr_url' => $planUpgrade['payment_qr']
                    ? route('admin.platform.plan-upgrade-payment.qr', absolute: true)
                    : null,
            ],
        ]);
    }

    public function planUpgradePaymentQr(): HttpResponse
    {
        $payment = $this->settings->planUpgradePayment();
        if (! $payment['payment_qr'] || ! Storage::exists($payment['payment_qr'])) {
            abort(404);
        }

        return Storage::response($payment['payment_qr']);
    }

    public function updatePlanUpgradePayment(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'amount' => ['required', 'string', 'max:64'],
            'period' => ['nullable', 'string', 'max:64'],
            'payment_method' => ['nullable', 'string', 'max:500'],
            'instructions' => ['nullable', 'string', 'max:1000'],
            'payment_qr' => ['nullable', 'image', 'max:5120'],
            'remove_payment_qr' => ['boolean'],
        ]);

        $current = $this->settings->planUpgradePayment();
        $data = [
            'amount' => $validated['amount'],
            'period' => $validated['period'] ?? '',
            'payment_method' => $validated['payment_method'] ?? '',
            'instructions' => $validated['instructions'] ?? '',
        ];

        if ($request->boolean('remove_payment_qr')) {
            if ($current['payment_qr']) {
                Storage::delete($current['payment_qr']);
            }
            $data['payment_qr'] = null;
        } elseif ($request->hasFile('payment_qr')) {
            if ($current['payment_qr']) {
                Storage::delete($current['payment_qr']);
            }
            $data['payment_qr'] = $request->file('payment_qr')->store('payment-qr');
        } else {
            $data['payment_qr'] = $current['payment_qr'];
        }

        $this->settings->savePlanUpgradePayment($data);

        return back()->with('success', 'Community plan payment settings updated.');
    }

    public function updatePricing(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'plans' => ['required', 'array', 'min:1'],
            'plans.*.id' => ['required', 'string', 'max:64'],
            'plans.*.name' => ['required', 'string', 'max:255'],
            'plans.*.price' => ['required', 'string', 'max:64'],
            'plans.*.period' => ['nullable', 'string', 'max:64'],
            'plans.*.description' => ['required', 'string', 'max:500'],
            'plans.*.featured' => ['boolean'],
            'plans.*.coming_soon' => ['boolean'],
            'plans.*.cta_label' => ['nullable', 'string', 'max:64'],
            'plans.*.features' => ['required', 'array'],
            'plans.*.features.*' => ['required', 'string', 'max:255'],
        ]);

        $this->settings->savePricing($validated['plans']);

        return back()->with('success', 'Tournament X pricing updated.');
    }

    public function resetPricing(): RedirectResponse
    {
        $this->settings->resetPricing();

        return back()->with('success', 'Pricing reset to config defaults.');
    }

    public function updatePromo(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'enabled' => ['boolean'],
            'badge' => ['nullable', 'string', 'max:64'],
            'title' => ['required', 'string', 'max:255'],
            'subtitle' => ['required', 'string', 'max:500'],
            'cta_label' => ['nullable', 'string', 'max:64'],
        ]);

        $this->settings->savePromo([
            'enabled' => (bool) ($validated['enabled'] ?? false),
            'badge' => $validated['badge'] ?? '',
            'title' => $validated['title'],
            'subtitle' => $validated['subtitle'],
            'cta_label' => $validated['cta_label'] ?? 'Create free account',
        ]);

        return back()->with('success', 'Tournament X promo banner updated.');
    }

    public function resetPromo(): RedirectResponse
    {
        $this->settings->resetPromo();

        return back()->with('success', 'Promo reset to config defaults.');
    }

    private function usesPricingOverride(): bool
    {
        $path = storage_path('app/platform_settings.json');

        if (! is_readable($path)) {
            return false;
        }

        $decoded = json_decode((string) file_get_contents($path), true);

        return is_array($decoded) && isset($decoded['pricing']);
    }
}
