<?php

namespace App\Support;

use Illuminate\Http\Request;

class TournamentXDomain
{
    public static function host(): ?string
    {
        $host = config('tournamentx.domain');

        return is_string($host) && $host !== '' ? $host : null;
    }

    public static function baseUrl(): string
    {
        $url = config('tournamentx.url', config('app.url'));

        return rtrim((string) $url, '/');
    }

    public static function isEnabled(): bool
    {
        return self::host() !== null;
    }

    public static function isRequest(?Request $request = null): bool
    {
        $request ??= request();

        if (! $request) {
            return false;
        }

        $host = self::host();
        if ($host) {
            return strcasecmp($request->getHost(), $host) === 0;
        }

        return (bool) $request->attributes->get('tournamentx_context');
    }

    public static function url(string $path = ''): string
    {
        $path = $path === '' ? '' : '/'.ltrim($path, '/');

        return self::baseUrl().$path;
    }

    public static function mainSiteUrl(): string
    {
        return rtrim((string) config('tournamentx.main_url', config('app.url')), '/');
    }
}
