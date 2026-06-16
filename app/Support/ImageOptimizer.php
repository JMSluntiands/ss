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

    public static function thumbPathFor(string $relativePath): string
    {
        $dir = pathinfo($relativePath, PATHINFO_DIRNAME);
        $name = pathinfo($relativePath, PATHINFO_FILENAME);
        $ext = strtolower(pathinfo($relativePath, PATHINFO_EXTENSION));
        $thumbExt = $ext === 'png' ? 'png' : 'jpg';

        return ($dir !== '.' ? $dir.'/' : '').$name.'_thumb.'.$thumbExt;
    }

    public static function deleteStored(string $relativePath): void
    {
        if ($relativePath === '' || str_starts_with($relativePath, 'http://') || str_starts_with($relativePath, 'https://')) {
            return;
        }

        $disk = Storage::disk('public');
        $disk->delete($relativePath);
        $disk->delete(self::thumbPathFor($relativePath));
    }

    public static function storeOptimized(
        UploadedFile $file,
        string $directory,
        int $maxWidth = 1200,
        int $quality = 82,
        ?int $thumbMaxWidth = null,
    ): ?string {
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

        $thumbMaxWidth ??= self::defaultThumbWidth($maxWidth);

        if (self::hasTransparency($image)) {
            return self::savePng($image, $directory, $maxWidth, $thumbMaxWidth);
        }

        return self::saveJpeg($image, $directory, $maxWidth, $quality, $thumbMaxWidth);
    }

    public static function optimizeBinary(
        string $binary,
        string $directory,
        int $maxWidth = 1200,
        int $quality = 82,
        ?int $thumbMaxWidth = null,
    ): ?string {
        if ($binary === '' || ! self::isAvailable()) {
            return null;
        }

        $image = @imagecreatefromstring($binary);
        if (! $image instanceof GdImage) {
            return null;
        }

        $thumbMaxWidth ??= self::defaultThumbWidth($maxWidth);

        if (self::hasTransparency($image)) {
            return self::savePng($image, $directory, $maxWidth, $thumbMaxWidth);
        }

        return self::saveJpeg($image, $directory, $maxWidth, $quality, $thumbMaxWidth);
    }

    public static function optimizeStoredFile(string $relativePath, int $maxWidth = 1200, int $quality = 82, ?int $thumbMaxWidth = null): bool
    {
        if (! self::isAvailable()) {
            return false;
        }

        if (str_starts_with($relativePath, 'http://') || str_starts_with($relativePath, 'https://')) {
            return false;
        }

        if (str_ends_with(strtolower($relativePath), '_thumb.jpg') || str_ends_with(strtolower($relativePath), '_thumb.png')) {
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

        $thumbMaxWidth ??= self::defaultThumbWidth($maxWidth);

        $before = $disk->size($relativePath);
        $saved = self::saveJpegToPath($image, $absolute, $maxWidth, $quality);
        if (! $saved) {
            return false;
        }

        self::ensureThumb($relativePath, $thumbMaxWidth);

        $after = $disk->size($relativePath);

        return $after < $before || ! str_ends_with(strtolower($relativePath), '.jpg');
    }

    public static function ensureThumb(string $relativePath, ?int $thumbMaxWidth = null): bool
    {
        if (! self::isAvailable()) {
            return false;
        }

        if (str_starts_with($relativePath, 'http://') || str_starts_with($relativePath, 'https://')) {
            return false;
        }

        if (str_ends_with(strtolower($relativePath), '_thumb.jpg') || str_ends_with(strtolower($relativePath), '_thumb.png')) {
            return false;
        }

        $disk = Storage::disk('public');
        if (! $disk->exists($relativePath)) {
            return false;
        }

        $thumbPath = self::thumbPathFor($relativePath);
        if ($disk->exists($thumbPath)) {
            return true;
        }

        $absolute = $disk->path($relativePath);
        $image = self::loadImageFromPath($absolute, (string) mime_content_type($absolute), pathinfo($absolute, PATHINFO_EXTENSION));
        if (! $image) {
            return false;
        }

        $thumbMaxWidth ??= self::defaultThumbWidth(imagesx($image));

        return self::writeThumb($image, $thumbPath, $thumbMaxWidth);
    }

    private static function defaultThumbWidth(int $maxWidth): int
    {
        return (int) min(640, max(320, round($maxWidth * 0.5)));
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
                if ($image instanceof GdImage) {
                    imagealphablending($image, true);
                    imagesavealpha($image, true);
                }
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

    private static function hasTransparency(GdImage $image): bool
    {
        $width = imagesx($image);
        $height = imagesy($image);
        $stepX = max(1, (int) ($width / 40));
        $stepY = max(1, (int) ($height / 40));

        for ($y = 0; $y < $height; $y += $stepY) {
            for ($x = 0; $x < $width; $x += $stepX) {
                $rgba = imagecolorat($image, $x, $y);
                $alpha = ($rgba >> 24) & 0x7F;

                if ($alpha > 0) {
                    return true;
                }
            }
        }

        return false;
    }

    private static function savePng(GdImage $image, string $directory, int $maxWidth, int $thumbMaxWidth): ?string
    {
        $resized = self::resizeIfNeeded($image, $maxWidth, preserveAlpha: true);
        $binary = self::encodePng($resized);

        if ($binary === null) {
            if ($resized !== $image) {
                imagedestroy($resized);
            }
            imagedestroy($image);

            return null;
        }

        $filename = trim($directory, '/').'/'.Str::uuid().'.png';
        Storage::disk('public')->put($filename, $binary);
        self::writeThumbPng($resized, $filename, $thumbMaxWidth);

        if ($resized !== $image) {
            imagedestroy($resized);
        }
        imagedestroy($image);

        return $filename;
    }

    private static function saveJpeg(GdImage $image, string $directory, int $maxWidth, int $quality, int $thumbMaxWidth): ?string
    {
        $resized = self::resizeIfNeeded($image, $maxWidth);
        $binary = self::encodeJpeg($resized, $quality);

        if ($binary === null) {
            if ($resized !== $image) {
                imagedestroy($resized);
            }
            imagedestroy($image);

            return null;
        }

        $filename = trim($directory, '/').'/'.Str::uuid().'.jpg';
        Storage::disk('public')->put($filename, $binary);
        self::writeThumb($resized, $filename, $thumbMaxWidth);

        if ($resized !== $image) {
            imagedestroy($resized);
        }
        imagedestroy($image);

        return $filename;
    }

    private static function writeThumb(GdImage $source, string $mainRelativePath, int $thumbMaxWidth): bool
    {
        $thumbPath = self::thumbPathFor($mainRelativePath);
        $absolute = Storage::disk('public')->path($thumbPath);
        $dir = dirname($absolute);
        if (! is_dir($dir)) {
            mkdir($dir, 0755, true);
        }

        $width = imagesx($source);
        $height = imagesy($source);
        $targetWidth = min($width, $thumbMaxWidth);
        $targetHeight = (int) round($height * ($targetWidth / $width));

        $thumb = imagecreatetruecolor($targetWidth, $targetHeight);
        imagecopyresampled($thumb, $source, 0, 0, 0, 0, $targetWidth, $targetHeight, $width, $height);

        $ok = imagejpeg($thumb, $absolute, 80);
        imagedestroy($thumb);

        return $ok;
    }

    private static function writeThumbPng(GdImage $source, string $mainRelativePath, int $thumbMaxWidth): bool
    {
        $thumbPath = self::thumbPathFor($mainRelativePath);
        $absolute = Storage::disk('public')->path($thumbPath);
        $dir = dirname($absolute);
        if (! is_dir($dir)) {
            mkdir($dir, 0755, true);
        }

        $width = imagesx($source);
        $height = imagesy($source);
        $targetWidth = min($width, $thumbMaxWidth);
        $targetHeight = (int) round($height * ($targetWidth / $width));

        $thumb = imagecreatetruecolor($targetWidth, $targetHeight);
        imagealphablending($thumb, false);
        imagesavealpha($thumb, true);
        $transparent = imagecolorallocatealpha($thumb, 0, 0, 0, 127);
        imagefill($thumb, 0, 0, $transparent);
        imagealphablending($thumb, true);
        imagecopyresampled($thumb, $source, 0, 0, 0, 0, $targetWidth, $targetHeight, $width, $height);
        imagesavealpha($thumb, true);

        $ok = imagepng($thumb, $absolute, 6);
        imagedestroy($thumb);

        return $ok;
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

    private static function resizeIfNeeded(GdImage $image, int $maxWidth, bool $preserveAlpha = false): GdImage
    {
        $width = imagesx($image);
        $height = imagesy($image);

        if ($width <= $maxWidth) {
            return $image;
        }

        $newHeight = (int) round($height * ($maxWidth / $width));
        $resized = imagecreatetruecolor($maxWidth, $newHeight);

        if ($preserveAlpha) {
            imagealphablending($resized, false);
            imagesavealpha($resized, true);
            $transparent = imagecolorallocatealpha($resized, 0, 0, 0, 127);
            imagefill($resized, 0, 0, $transparent);
            imagealphablending($resized, true);
        }

        imagecopyresampled($resized, $image, 0, 0, 0, 0, $maxWidth, $newHeight, $width, $height);

        if ($preserveAlpha) {
            imagesavealpha($resized, true);
        }

        imagedestroy($image);

        return $resized;
    }

    private static function encodePng(GdImage $image): ?string
    {
        imagesavealpha($image, true);

        ob_start();
        $ok = imagepng($image, null, 6);
        $data = ob_get_clean();

        if (! $ok || $data === false || $data === '') {
            return null;
        }

        return $data;
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
