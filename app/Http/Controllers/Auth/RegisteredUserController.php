<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
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
    /**
     * Display the registration view.
     */
    public function create(Request $request): Response
    {
        if (! TournamentXDomain::isRequest($request)) {
            abort(403, 'Registration is only available on the Tournament X site.');
        }

        return Inertia::render('Auth/Register', [
            ...TournamentXMarketing::inertiaProps(),
        ]);
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        if (! TournamentXDomain::isRequest($request)) {
            abort(403, 'Registration is only available on the Tournament X site.');
        }

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

        Auth::login($user);

        return redirect(route('dashboard', absolute: false));
    }
}
