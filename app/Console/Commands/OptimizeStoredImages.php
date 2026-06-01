<?php

namespace App\Console\Commands;

use App\Support\ImageOptimizer;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class OptimizeStoredImages extends Command
{
    protected $signature = 'images:optimize {--blog : Optimize blog images only} {--members : Optimize member images only}';

    protected $description = 'Compress and resize existing images in public storage';

    public function handle(): int
    {
        if (! extension_loaded('gd')) {
            $this->error('PHP GD extension is required.');

            return self::FAILURE;
        }

        $onlyBlog = (bool) $this->option('blog');
        $onlyMembers = (bool) $this->option('members');
        $runAll = ! $onlyBlog && ! $onlyMembers;

        $folders = [];
        if ($runAll || $onlyBlog) {
            $folders['blog-images'] = ['max' => 1200, 'thumb' => 640];
        }
        if ($runAll || $onlyMembers) {
            $folders['member-images'] = ['max' => 800, 'thumb' => 400];
        }

        $disk = Storage::disk('public');
        $optimized = 0;
        $thumbs = 0;
        $skipped = 0;

        foreach ($folders as $folder => $sizes) {
            if (! $disk->exists($folder)) {
                continue;
            }

            foreach ($disk->allFiles($folder) as $path) {
                if (str_ends_with(strtolower($path), '.svg') || str_ends_with(strtolower($path), '_thumb.jpg')) {
                    $skipped++;

                    continue;
                }

                $before = $disk->size($path);
                if (ImageOptimizer::optimizeStoredFile($path, $sizes['max'], 82, $sizes['thumb'])) {
                    $after = $disk->size($path);
                    $optimized++;
                    $saved = max(0, $before - $after);
                    $this->line(sprintf(
                        '  %s (%s → %s, saved %s)',
                        $path,
                        $this->formatBytes($before),
                        $this->formatBytes($after),
                        $this->formatBytes($saved)
                    ));
                } elseif (ImageOptimizer::ensureThumb($path, $sizes['thumb'])) {
                    $thumbs++;
                    $this->line("  thumb: {$path}");
                } else {
                    $skipped++;
                }
            }
        }

        $this->info("Done. Optimized: {$optimized}, thumbs created: {$thumbs}, skipped: {$skipped}.");

        return self::SUCCESS;
    }

    private function formatBytes(int $bytes): string
    {
        if ($bytes < 1024) {
            return "{$bytes} B";
        }
        if ($bytes < 1024 * 1024) {
            return round($bytes / 1024, 1).' KB';
        }

        return round($bytes / (1024 * 1024), 2).' MB';
    }
}
