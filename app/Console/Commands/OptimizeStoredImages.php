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
            $folders['blog-images'] = 1600;
        }
        if ($runAll || $onlyMembers) {
            $folders['member-images'] = 800;
        }

        $disk = Storage::disk('public');
        $optimized = 0;
        $skipped = 0;

        foreach ($folders as $folder => $maxWidth) {
            if (! $disk->exists($folder)) {
                continue;
            }

            foreach ($disk->allFiles($folder) as $path) {
                if (str_ends_with(strtolower($path), '.svg')) {
                    $skipped++;

                    continue;
                }

                $before = $disk->size($path);
                if (ImageOptimizer::optimizeStoredFile($path, $maxWidth)) {
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
                } else {
                    $skipped++;
                }
            }
        }

        $this->info("Done. Optimized: {$optimized}, skipped: {$skipped}.");

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
