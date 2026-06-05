<?php

namespace App\Http\Controllers;

use App\Http\Requests\Auth\LoginRequest;
use App\Support\TournamentXDomain;
use App\Support\UserAccountType;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class MemberAuthController extends Controller
{
    public function create(Request $request): Response|RedirectResponse
    {
        if ($request->user()) {
            if (UserAccountType::isMember($request->user())) {
                return redirect()->route('member.dashboard');
            }

            if (UserAccountType::isAdmin($request->user())) {
                return redirect()->route('admin.login');
            }

            return redirect()->to(TournamentXDomain::url('/dashboard'));
        }

        return Inertia::render('Member/Login', [
            'status' => session('status'),
        ]);
    }

    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $request->session()->regenerate();

        $user = $request->user();

        if (! UserAccountType::isMember($user)) {
            Auth::guard('web')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return back()->withErrors([
                'email' => UserAccountType::loginDeniedMessage($user, 'member'),
            ]);
        }

        return redirect()->intended(route('member.dashboard', absolute: false));
    }

    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('member.login');
    }
}
