<?php

namespace App\Support;

use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class SiteAssets
{
    /** @var array<string, list<string>> */
    private const LOGO_CANDIDATES = [
        'public' => ['sslogo.png', 'sslogo.jpg'],
        'local' => ['sslogo.png'],
    ];

    public static function logoUrl(): string
    {
        return route('site.logo');
    }

    public static function logoResponse(): StreamedResponse
    {
        foreach (self::LOGO_CANDIDATES as $disk => $files) {
            foreach ($files as $file) {
                if (Storage::disk($disk)->exists($file)) {
                    return Storage::disk($disk)->response($file);
                }
            }
        }

        abort(404);
    }
}
