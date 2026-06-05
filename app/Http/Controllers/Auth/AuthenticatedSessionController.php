<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Support\TournamentXDomain;
use App\Support\UserAccountType;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
            'mainSiteUrl' => TournamentXDomain::mainSiteUrl(),
            'memberLoginUrl' => Route::has('member.login')
                ? rtrim(TournamentXDomain::mainSiteUrl(), '/').route('member.login', [], false)
                : null,
            'registerUrl' => route('register'),
            'homeUrl' => route('tournamentx.home'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $request->session()->regenerate();

        $redirect = $request->input('redirect');
        if (is_string($redirect) && $redirect !== '' && filter_var($redirect, FILTER_VALIDATE_URL)) {
            return redirect()->away($redirect);
        }

        $user = $request->user();

        if (TournamentXDomain::isRequest($request) && ! UserAccountType::isOrganizer($user)) {
            Auth::guard('web')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return back()->withErrors([
                'email' => UserAccountType::loginDeniedMessage($user, 'tournamentx'),
            ]);
        }

        if (UserAccountType::isMember($user) && Route::has('member.dashboard')) {
            return redirect()->intended(route('member.dashboard', absolute: false));
        }

        return redirect()->intended(route('dashboard', absolute: false));
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        if (Route::has('tournamentx.home')) {
            return redirect()->route('tournamentx.home');
        }

        return redirect('/');
    }
}
