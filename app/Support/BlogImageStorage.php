<?php

namespace App\Support;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Maestroerror\HeicToJpg;
use Throwable;

class BlogImageStorage
{
    private const HEIC_EXTENSIONS = ['heic', 'heif'];

    public static function store(UploadedFile $file): ?string
    {
        if (! $file->isValid()) {
            return null;
        }

        if (self::isHeic($file)) {
            return self::storeHeicAsJpeg($file);
        }

        return ImageOptimizer::storeOptimized($file, 'blog-images', 1600);
    }

    private static function isHeic(UploadedFile $file): bool
    {
        $ext = strtolower($file->getClientOriginalExtension());
        if (in_array($ext, self::HEIC_EXTENSIONS, true)) {
            return true;
        }

        $mime = strtolower((string) $file->getMimeType());
        if (str_contains($mime, 'heic') || str_contains($mime, 'heif')) {
            return true;
        }

        $path = $file->getRealPath();
        if ($path && is_file($path)) {
            return HeicToJpg::isHeic($path);
        }

        return false;
    }

    private static function storeHeicAsJpeg(UploadedFile $file): ?string
    {
        $path = $file->getRealPath();
        if (! $path || ! is_file($path)) {
            return null;
        }

        try {
            $binary = HeicToJpg::convert($path)->get();

            $optimized = ImageOptimizer::optimizeBinary($binary, 'blog-images', 1600);
            if ($optimized) {
                return $optimized;
            }

            $filename = 'blog-images/'.Str::uuid().'.jpg';
            Storage::disk('public')->put($filename, $binary);

            return $filename;
        } catch (Throwable) {
            return null;
        }
    }
}
