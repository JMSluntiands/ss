<?php

namespace App\Support;

use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class SiteAssets
{
    public const LOGO_FILENAME = 'sslogo.png';

    public static function logoUrl(): string
    {
        if (Storage::disk('local')->exists(self::LOGO_FILENAME)) {
            return route('site.logo');
        }

        if (Storage::disk('public')->exists(self::LOGO_FILENAME)) {
            return asset('storage/'.self::LOGO_FILENAME);
        }

        return route('site.logo');
    }

    public static function logoResponse(): StreamedResponse
    {
        if (Storage::disk('local')->exists(self::LOGO_FILENAME)) {
            return Storage::disk('local')->response(self::LOGO_FILENAME);
        }

        if (Storage::disk('public')->exists(self::LOGO_FILENAME)) {
            return Storage::disk('public')->response(self::LOGO_FILENAME);
        }

        abort(404);
    }
}
