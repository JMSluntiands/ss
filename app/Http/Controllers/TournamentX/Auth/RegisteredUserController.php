<?php

namespace App\Http\Controllers\TournamentX\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Support\TournamentXAuth;
use App\Support\TournamentXDomain;
use App\Support\TournamentXMarketing;
use App\Support\UserAccountType;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('Auth/Register', [
            'loginUrl' => route('login'),
            'homeUrl' => route('tournamentx.home'),
            'mainSiteUrl' => TournamentXDomain::mainSiteUrl(),
            ...TournamentXMarketing::inertiaProps(),
        ]);
    }

    /**
     * @throws ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        if (! config('tournamentx.registration_enabled')) {
            throw ValidationException::withMessages([
                'email' => 'Registration is not available during the beta period.',
            ]);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'user',
            'account_type' => UserAccountType::ORGANIZER,
            'can_create_tournaments' => true,
            'can_manage_tournaments' => false,
            'can_manage_events' => false,
            'can_use_judge' => false,
            'can_score_matches' => false,
        ]);

        event(new Registered($user));

        Auth::guard(TournamentXAuth::GUARD)->login($user);

        if (! TournamentXDomain::host()) {
            Auth::guard('web')->login($user);
        }

        $request->session()->regenerate();

        return redirect(route('dashboard', absolute: false));
    }
}
