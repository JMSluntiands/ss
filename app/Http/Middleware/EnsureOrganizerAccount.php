<?php

namespace App\Http\Middleware;

use App\Support\TournamentXAuth;
use App\Support\UserAccountType;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureOrganizerAccount
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = TournamentXAuth::resolveUser($request);

        if (! $user || ! UserAccountType::isOrganizer($user)) {
            Auth::guard(TournamentXAuth::GUARD)->logout();
            Auth::guard('web')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            $message = $user
                ? UserAccountType::loginDeniedMessage($user, 'tournamentx')
                : 'Please sign in with a Tournament X organizer account.';

            return redirect()->route('login')->withErrors(['email' => $message]);
        }

        return $next($request);
    }
}
