<?php

namespace App\Http\Controllers;

use App\Models\PlanUpgradeRequest;
use App\Services\SiteSettingsService;
use App\Support\TournamentXAuth;
use App\Support\TournamentXPlan;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class PlanUpgradeRequestController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $user = TournamentXAuth::resolveUser($request);

        if (! $user) {
            abort(403);
        }

        if (! TournamentXPlan::showUpgrade($user)) {
            return back()->with('error', 'Your account is not eligible for a plan upgrade request.');
        }

        $validated = $request->validate([
            'requested_plan' => ['required', 'in:'.TournamentXPlan::COMMUNITY],
            'message' => ['nullable', 'string', 'max:1000'],
            'payment_proof' => ['required', 'image', 'max:5120'],
        ]);

        $hasPending = PlanUpgradeRequest::query()
            ->where('user_id', $user->id)
            ->where('status', 'pending')
            ->exists();

        if ($hasPending) {
            return back()->with('error', 'You already have a pending upgrade request.');
        }

        $payment = app(SiteSettingsService::class)->planUpgradePayment();
        $amountDue = trim($payment['amount'].' '.($payment['period'] ?? ''));

        PlanUpgradeRequest::create([
            'user_id' => $user->id,
            'requested_plan' => $validated['requested_plan'],
            'amount_due' => $amountDue,
            'status' => 'pending',
            'user_message' => $validated['message'] ?? null,
            'payment_proof' => $request->file('payment_proof')->store('plan-upgrade-proofs'),
        ]);

        return back()->with('success', 'Upgrade request sent with payment proof. An admin will verify payment and activate your plan.');
    }
}
