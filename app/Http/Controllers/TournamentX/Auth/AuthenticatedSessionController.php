<?php

namespace App\Http\Controllers\TournamentX\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\TournamentX\LoginRequest;
use App\Support\TournamentXAuth;
use App\Support\TournamentXDomain;
use App\Support\TournamentXMarketing;
use App\Support\UserAccountType;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'registerUrl' => route('register'),
            'homeUrl' => route('tournamentx.home'),
            ...TournamentXMarketing::inertiaProps(),
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
            'mainSiteUrl' => TournamentXDomain::mainSiteUrl(),
            'memberLoginUrl' => Route::has('member.login')
                ? rtrim(TournamentXDomain::mainSiteUrl(), '/').route('member.login', [], false)
                : null,
        ]);
    }

    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $request->session()->regenerate();

        $user = TournamentXAuth::user();

        if ($user && ! UserAccountType::isOrganizer($user)) {
            Auth::guard(TournamentXAuth::GUARD)->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return back()->withErrors([
                'email' => UserAccountType::loginDeniedMessage($user, 'tournamentx'),
            ]);
        }

        if ($user && ! TournamentXDomain::host()) {
            Auth::guard('web')->login($user);
        }

        return redirect()->intended(route('dashboard', absolute: false));
    }

    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard(TournamentXAuth::GUARD)->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('tournamentx.home');
    }
}
