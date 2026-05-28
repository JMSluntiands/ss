<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SiteVisitorStat extends Model
{
    protected $table = 'site_visitor_stats';

    protected $fillable = [
        'total_visits',
    ];

    /**
     * Increment the global page-visit counter and return the new total.
     */
    public static function incrementAndGetTotal(): int
    {
        try {
            if (! static::query()->whereKey(1)->exists()) {
                static::query()->insert([
                    'id' => 1,
                    'total_visits' => 0,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
            static::query()->whereKey(1)->increment('total_visits');

            return (int) static::query()->whereKey(1)->value('total_visits');
        } catch (\Throwable) {
            return 0;
        }
    }

    public static function currentTotal(): int
    {
        try {
            return (int) (static::query()->whereKey(1)->value('total_visits') ?? 0);
        } catch (\Throwable) {
            return 0;
        }
    }
}
