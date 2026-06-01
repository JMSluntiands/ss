<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SiteEvent extends Model
{
    protected $fillable = [
        'tournament_id', 'user_id',
        'title', 'description', 'organizer', 'date', 'time', 'location',
        'map_address', 'map_lat', 'map_lng',
        'format', 'slots', 'entry_fee', 'pre_register_fee', 'pre_register_until', 'prizes',
        'status', 'participants', 'winner', 'runner_up', 'is_upcoming',
        'allow_double_entry', 'require_payment', 'payment_method', 'payment_qr',
    ];

    protected function casts(): array
    {
        return [
            'is_upcoming' => 'boolean',
            'allow_double_entry' => 'boolean',
            'require_payment' => 'boolean',
            'prizes' => 'array',
            'map_lat' => 'float',
            'map_lng' => 'float',
            'pre_register_until' => 'date',
        ];
    }

    public function tournament(): BelongsTo
    {
        return $this->belongsTo(Tournament::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function registrations(): HasMany
    {
        return $this->hasMany(EventRegistration::class);
    }
}
