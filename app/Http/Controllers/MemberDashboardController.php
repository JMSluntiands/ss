<?php

namespace App\Http\Controllers;

use App\Services\MemberDashboardStatsService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class MemberDashboardController extends Controller
{
    public function __construct(
        private MemberDashboardStatsService $stats,
    ) {}

    public function index(Request $request): Response
    {
        $user = $request->user();
        $user->loadMissing('siteMember');

        $memberStats = $this->stats->forUser($user);

        return Inertia::render('Member/Dashboard', [
            'profile' => [
                'name' => $memberStats['name'] ?? $user->name,
                'role' => $memberStats['role'] ?? '',
                'rank' => $memberStats['rank'] ?? '',
                'bey' => $memberStats['bey'] ?? null,
                'joined' => $memberStats['joined'] ?? null,
                'image_url' => $user->siteMember?->image_url,
                'email' => $user->email,
            ],
            'win_rate' => $memberStats['win_rate'] ?? 0,
            'wins' => $memberStats['wins'] ?? 0,
            'losses' => $memberStats['losses'] ?? 0,
            'finish_stats' => $this->stats->aggregateFinishStats($user),
        ]);
    }

    public function updatePassword(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', Password::defaults(), 'confirmed'],
        ]);

        $request->user()->update([
            'password' => Hash::make($validated['password']),
        ]);

        return back()->with('success', 'Password updated.');
    }
}
