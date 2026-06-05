<?php

namespace App\Support;

use App\Models\User;

class UserAccountType
{
    public const ORGANIZER = 'organizer';

    public const MEMBER = 'member';

    public const ADMIN = 'admin';

    public static function forUser(User $user): string
    {
        $type = $user->account_type;

        if (in_array($type, [self::ORGANIZER, self::MEMBER, self::ADMIN], true)) {
            return $type;
        }

        if ($user->isAdmin()) {
            return self::ADMIN;
        }

        if ($user->isSiteMember()) {
            return self::MEMBER;
        }

        return self::ORGANIZER;
    }

    public static function isOrganizer(User $user): bool
    {
        return self::forUser($user) === self::ORGANIZER;
    }

    public static function isMember(User $user): bool
    {
        return self::forUser($user) === self::MEMBER;
    }

    public static function isAdmin(User $user): bool
    {
        return self::forUser($user) === self::ADMIN;
    }

    public static function loginDeniedMessage(User $user, string $portal): string
    {
        $type = self::forUser($user);

        return match ($portal) {
            'tournamentx' => match ($type) {
                self::ADMIN => 'This is a platform admin account. Use the admin login only.',
                self::MEMBER => 'This is a Shadow Syndicate member account. Use Member Login on the main community site.',
                default => 'This account cannot access Tournament X.',
            },
            'member' => match ($type) {
                self::ADMIN => 'This is a platform admin account. Use the admin login only.',
                self::ORGANIZER => 'This is a Tournament X organizer account. Log in at Tournament X instead.',
                default => 'This login is for Shadow Syndicate members only.',
            },
            'admin' => match ($type) {
                self::ORGANIZER => 'This is a Tournament X organizer account. Use Tournament X login instead.',
                self::MEMBER => 'This is a member account. Use Member Login on the main community site.',
                default => 'This account does not have admin access.',
            },
            default => 'You cannot sign in here with this account.',
        };
    }
}
