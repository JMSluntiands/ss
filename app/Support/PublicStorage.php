<?php

namespace App\Support;

class PublicStorage
{
    /**
     * Root for public images. On Hostinger Git deploy, use PUBLIC_STORAGE_PATH
     * outside the repo (e.g. ~/domains/yourdomain.com/uploads) so redeploys
     * do not wipe files. Do not commit upload files to Git.
     */
    public static function root(): string
    {
        $path = env('PUBLIC_STORAGE_PATH');

        if (is_string($path) && $path !== '') {
            return rtrim($path, DIRECTORY_SEPARATOR.'\\/');
        }

        return storage_path('app/public');
    }
}
