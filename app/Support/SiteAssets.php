<?php

namespace App\Support;

use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class SiteAssets
{
    /** @var array<string, list<string>> */
    private const SHADOW_SYNDICATE_LOGO = [
        'public' => ['sslogo.png', 'sslogo.jpg', 'sslogo.webp'],
        'local' => ['sslogo.png', 'sslogo.jpg', 'sslogo.webp'],
    ];

    /** @var array<string, list<string>> */
    private const TOURNAMENT_X_LOGO = [
        'public' => ['tournamentx.png', 'tournamentx.jpg', 'tournamentx.webp'],
        'local' => ['tournamentx.png', 'tournamentx.jpg', 'tournamentx.webp'],
    ];

    public static function logoUrl(): string
    {
        return self::resolveUrl(self::SHADOW_SYNDICATE_LOGO, 'site.logo');
    }

    public static function tournamentXLogoUrl(): string
    {
        return self::resolveUrl(self::TOURNAMENT_X_LOGO, 'site.tournamentx-logo');
    }

    public static function logoResponse(): StreamedResponse
    {
        return self::logoResponseFor(self::SHADOW_SYNDICATE_LOGO);
    }

    public static function tournamentXLogoResponse(): StreamedResponse
    {
        return self::logoResponseFor(self::TOURNAMENT_X_LOGO);
    }

    /**
     * @param  array<string, list<string>>  $candidates
     */
    private static function resolveUrl(array $candidates, string $fallbackRoute): string
    {
        foreach ($candidates['public'] as $file) {
            $disk = Storage::disk('public');
            if ($disk->exists($file)) {
                $url = asset('storage/'.$file);
                $mtime = $disk->lastModified($file);

                return $mtime ? $url.'?v='.$mtime : $url;
            }
        }

        return route($fallbackRoute);
    }

    /**
     * @param  array<string, list<string>>  $candidates
     */
    private static function logoResponseFor(array $candidates): StreamedResponse
    {
        foreach ($candidates as $disk => $files) {
            foreach ($files as $file) {
                if (Storage::disk($disk)->exists($file)) {
                    return Storage::disk($disk)->response($file);
                }
            }
        }

        abort(404);
    }
}
