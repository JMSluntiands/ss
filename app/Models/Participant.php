<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class Participant extends Model
{
    protected $fillable = [
        'tournament_id',
        'name',
        'avatar_path',
        'seed',
        'judge',
    ];

    protected $appends = [
        'avatar_url',
    ];

    public function tournament(): BelongsTo
    {
        return $this->belongsTo(Tournament::class);
    }

    protected function avatarUrl(): Attribute
    {
        return Attribute::get(function (): ?string {
            if (! $this->avatar_path) {
                return null;
            }

            $path = $this->avatar_path;

            if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
                return $path;
            }

            // Relative URL works on any host (avoids wrong APP_URL in Storage::url()).
            return '/storage/'.ltrim($path, '/');
        });
    }
}
