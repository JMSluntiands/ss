<?php

namespace App\Support;

use GdImage;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Throwable;

class ImageOptimizer
{
    public static function isAvailable(): bool
    {
        return extension_loaded('gd');
    }

    public static function storeOptimized(UploadedFile $file, string $directory, int $maxWidth = 1200, int $quality = 82): ?string
    {
        if (! $file->isValid()) {
            return null;
        }

        if (! self::isAvailable()) {
            return $file->store($directory, 'public');
        }

        if (self::isSvg($file)) {
            return $file->store($directory, 'public');
        }

        $path = $file->getRealPath();
        if (! $path || ! is_file($path)) {
            return null;
        }

        $image = self::loadImageFromPath($path, (string) $file->getMimeType(), $file->getClientOriginalExtension());
        if (! $image) {
            return $file->store($directory, 'public');
        }

        return self::saveJpeg($image, $directory, $maxWidth, $quality);
    }

    public static function optimizeBinary(string $binary, string $directory, int $maxWidth = 1200, int $quality = 82): ?string
    {
        if ($binary === '' || ! self::isAvailable()) {
            return null;
        }

        $image = @imagecreatefromstring($binary);
        if (! $image instanceof GdImage) {
            return null;
        }

        return self::saveJpeg($image, $directory, $maxWidth, $quality);
    }

    public static function optimizeStoredFile(string $relativePath, int $maxWidth = 1200, int $quality = 82): bool
    {
        if (! self::isAvailable()) {
            return false;
        }

        if (str_starts_with($relativePath, 'http://') || str_starts_with($relativePath, 'https://')) {
            return false;
        }

        $disk = Storage::disk('public');
        if (! $disk->exists($relativePath)) {
            return false;
        }

        if (str_ends_with(strtolower($relativePath), '.svg')) {
            return false;
        }

        $absolute = $disk->path($relativePath);
        $image = self::loadImageFromPath($absolute, (string) mime_content_type($absolute), pathinfo($absolute, PATHINFO_EXTENSION));
        if (! $image) {
            return false;
        }

        $before = $disk->size($relativePath);
        $saved = self::saveJpegToPath($image, $absolute, $maxWidth, $quality);
        if (! $saved) {
            return false;
        }

        $after = $disk->size($relativePath);

        return $after < $before || ! str_ends_with(strtolower($relativePath), '.jpg');
    }

    private static function isSvg(UploadedFile $file): bool
    {
        $ext = strtolower($file->getClientOriginalExtension());
        if ($ext === 'svg') {
            return true;
        }

        return str_contains(strtolower((string) $file->getMimeType()), 'svg');
    }

    private static function loadImageFromPath(string $path, string $mime, string $extension): ?GdImage
    {
        $ext = strtolower($extension);
        $mime = strtolower($mime);

        try {
            if (str_contains($mime, 'jpeg') || in_array($ext, ['jpg', 'jpeg'], true)) {
                $image = @imagecreatefromjpeg($path);
            } elseif (str_contains($mime, 'png') || $ext === 'png') {
                $image = @imagecreatefrompng($path);
            } elseif ((str_contains($mime, 'webp') || $ext === 'webp') && function_exists('imagecreatefromwebp')) {
                $image = @imagecreatefromwebp($path);
            } elseif (str_contains($mime, 'gif') || $ext === 'gif') {
                $image = @imagecreatefromgif($path);
            } else {
                $image = @imagecreatefromstring((string) file_get_contents($path));
            }

            return $image instanceof GdImage ? $image : null;
        } catch (Throwable) {
            return null;
        }
    }

    private static function saveJpeg(GdImage $image, string $directory, int $maxWidth, int $quality): ?string
    {
        $resized = self::resizeIfNeeded($image, $maxWidth);
        $binary = self::encodeJpeg($resized, $quality);
        if ($resized !== $image) {
            imagedestroy($resized);
        }
        imagedestroy($image);

        if ($binary === null) {
            return null;
        }

        $filename = trim($directory, '/').'/'.Str::uuid().'.jpg';
        Storage::disk('public')->put($filename, $binary);

        return $filename;
    }

    private static function saveJpegToPath(GdImage $image, string $absolutePath, int $maxWidth, int $quality): bool
    {
        $resized = self::resizeIfNeeded($image, $maxWidth);
        $ok = imagejpeg($resized, $absolutePath, $quality);
        if ($resized !== $image) {
            imagedestroy($resized);
        }
        imagedestroy($image);

        return $ok;
    }

    private static function resizeIfNeeded(GdImage $image, int $maxWidth): GdImage
    {
        $width = imagesx($image);
        $height = imagesy($image);

        if ($width <= $maxWidth) {
            return $image;
        }

        $newHeight = (int) round($height * ($maxWidth / $width));
        $resized = imagecreatetruecolor($maxWidth, $newHeight);
        imagecopyresampled($resized, $image, 0, 0, 0, 0, $maxWidth, $newHeight, $width, $height);
        imagedestroy($image);

        return $resized;
    }

    private static function encodeJpeg(GdImage $image, int $quality): ?string
    {
        ob_start();
        $ok = imagejpeg($image, null, $quality);
        $data = ob_get_clean();

        if (! $ok || $data === false || $data === '') {
            return null;
        }

        return $data;
    }
}
