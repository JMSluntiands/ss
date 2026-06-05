<?php

namespace App\Support;

use App\Models\User;
use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TournamentXAuth
{
    public const GUARD = 'tournamentx';

    public static function guard(): \Illuminate\Contracts\Auth\Guard|\Illuminate\Contracts\Auth\StatefulGuard
    {
        return Auth::guard(self::GUARD);
    }

    public static function user(): ?User
    {
        $user = self::guard()->user();

        return $user instanceof User ? $user : null;
    }

    public static function check(): bool
    {
        return self::guard()->check();
    }

    public static function isTournamentXRequest(?Request $request = null): bool
    {
        return TournamentXDomain::isRequest($request);
    }

    public static function activeGuard(?Request $request = null): string
    {
        return self::isTournamentXRequest($request) ? self::GUARD : 'web';
    }

    public static function activeUser(?Request $request = null): ?Authenticatable
    {
        return Auth::guard(self::activeGuard($request))->user();
    }

    public static function resolveUser(?Request $request = null): ?User
    {
        $request ??= request();

        $user = self::isTournamentXRequest($request)
            ? (self::user() ?? $request?->user())
            : ($request?->user() ?? self::user());

        if (! $user instanceof User) {
            return null;
        }

        if (self::isTournamentXRequest($request) && ! UserAccountType::isOrganizer($user)) {
            return null;
        }

        return $user;
    }
}
