<?php

namespace App\Services;

use Illuminate\Support\Facades\File;

class SiteSettingsService
{
    private const FILE = 'platform_settings.json';

    /**
     * @return array<string, mixed>
     */
    public function all(): array
    {
        $path = $this->storagePath();

        if (! File::exists($path)) {
            return $this->defaults();
        }

        $decoded = json_decode(File::get($path), true);

        return is_array($decoded) ? array_replace_recursive($this->defaults(), $decoded) : $this->defaults();
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function pricing(): array
    {
        return $this->all()['pricing'] ?? config('tournamentx.pricing', []);
    }

    /**
     * @return array<string, mixed>
     */
    public function promo(): array
    {
        return $this->all()['promo'] ?? config('tournamentx.promo', []);
    }

    /**
     * @return array{amount: string, period: string, payment_method: string, instructions: string, payment_qr: string|null}
     */
    public function planUpgradePayment(): array
    {
        $defaults = config('tournamentx.plan_upgrade', []);
        $stored = $this->all()['plan_upgrade'] ?? [];

        return [
            'amount' => (string) ($stored['amount'] ?? $defaults['amount'] ?? '₱499'),
            'period' => (string) ($stored['period'] ?? $defaults['period'] ?? '/ month'),
            'payment_method' => (string) ($stored['payment_method'] ?? $defaults['payment_method'] ?? ''),
            'instructions' => (string) ($stored['instructions'] ?? $defaults['instructions'] ?? ''),
            'payment_qr' => $stored['payment_qr'] ?? $defaults['payment_qr'] ?? null,
        ];
    }

    /**
     * @param  array<string, mixed>  $payment
     */
    public function savePlanUpgradePayment(array $payment): void
    {
        $data = $this->all();
        $data['plan_upgrade'] = array_merge($this->planUpgradePayment(), $payment);
        $this->write($data);
    }

    /**
     * @param  array<int, array<string, mixed>>  $plans
     */
    public function savePricing(array $plans): void
    {
        $data = $this->all();
        $data['pricing'] = $plans;
        $this->write($data);
    }

    /**
     * @param  array<string, mixed>  $promo
     */
    public function savePromo(array $promo): void
    {
        $data = $this->all();
        $data['promo'] = $promo;
        $this->write($data);
    }

    public function resetPricing(): void
    {
        $data = $this->all();
        unset($data['pricing']);
        $this->write($data);
    }

    public function resetPromo(): void
    {
        $data = $this->all();
        unset($data['promo']);
        $this->write($data);
    }

    /**
     * @return array<string, mixed>
     */
    private function defaults(): array
    {
        return [
            'pricing' => config('tournamentx.pricing', []),
            'promo' => config('tournamentx.promo', []),
            'plan_upgrade' => config('tournamentx.plan_upgrade', []),
        ];
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function write(array $data): void
    {
        File::ensureDirectoryExists(storage_path('app'));
        File::put(
            $this->storagePath(),
            json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)."\n",
        );
    }

    private function storagePath(): string
    {
        return storage_path('app/'.self::FILE);
    }
}
