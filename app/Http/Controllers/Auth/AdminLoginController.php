<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Support\UserAccountType;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class AdminLoginController extends Controller
{
    public const GUARD = 'platform_admin';

    public function create(): Response|RedirectResponse
    {
        if (Auth::guard(self::GUARD)->check() && Auth::guard(self::GUARD)->user()?->isAdminAccount()) {
            return redirect()->route('admin.dashboard');
        }

        return Inertia::render('Admin/Login', [
            'status' => session('status'),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (Auth::guard(self::GUARD)->attempt($credentials, $request->boolean('remember'))) {
            $user = Auth::guard(self::GUARD)->user();

            if (! $user || ! UserAccountType::isAdmin($user)) {
                Auth::guard(self::GUARD)->logout();
                $request->session()->invalidate();
                $request->session()->regenerateToken();

                return back()->withErrors([
                    'email' => $user
                        ? UserAccountType::loginDeniedMessage($user, 'admin')
                        : 'This account does not have admin access.',
                ]);
            }

            $request->session()->regenerate();

            return redirect()->intended(route('admin.dashboard'));
        }

        return back()->withErrors([
            'email' => 'The provided credentials do not match our records.',
        ]);
    }

    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard(self::GUARD)->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('admin.login');
    }
}
