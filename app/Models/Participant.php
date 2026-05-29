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

            return Storage::disk('public')->url($this->avatar_path);
        });
    }
}
