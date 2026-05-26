<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SwissStanding extends Model
{
    protected $fillable = [
        'tournament_id',
        'participant_id',
        'tournament_points',
        'battle_points',
        'opponent_strength',
        'wins',
        'losses',
        'draws',
        'bye_received',
        'rank',
    ];

    protected function casts(): array
    {
        return [
            'tournament_points' => 'decimal:1',
            'opponent_strength' => 'decimal:2',
            'bye_received' => 'boolean',
        ];
    }

    public function tournament(): BelongsTo
    {
        return $this->belongsTo(Tournament::class);
    }

    public function participant(): BelongsTo
    {
        return $this->belongsTo(Participant::class);
    }
}
