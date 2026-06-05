<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Support\TournamentXAuth;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class PasswordController extends Controller
{
    /**
     * Update the user's password.
     */
    public function update(Request $request): RedirectResponse
    {
        $guard = TournamentXAuth::isTournamentXRequest($request)
            ? TournamentXAuth::GUARD
            : 'web';

        $user = TournamentXAuth::resolveUser($request);

        if (! $user) {
            abort(403);
        }

        $validated = $request->validate([
            'current_password' => ['required', 'current_password:'.$guard],
            'password' => ['required', Password::defaults(), 'confirmed'],
        ]);

        $user->update([
            'password' => Hash::make($validated['password']),
        ]);

        return back();
    }
}
