<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TournamentMatch extends Model
{
    protected $fillable = [
        'tournament_id',
        'stage',
        'bracket',
        'round',
        'match_number',
        'player1_id',
        'player2_id',
        'winner_id',
        'player1_score',
        'player2_score',
        'player1_battle_points',
        'player2_battle_points',
        'is_bye',
        'is_draw',
        'status',
        'stadium',
        'next_match_id',
        'loser_next_match_id',
        'round_details',
    ];

    protected function casts(): array
    {
        return [
            'is_bye' => 'boolean',
            'is_draw' => 'boolean',
            'round_details' => 'array',
        ];
    }

    public function tournament(): BelongsTo
    {
        return $this->belongsTo(Tournament::class);
    }

    public function player1(): BelongsTo
    {
        return $this->belongsTo(Participant::class, 'player1_id');
    }

    public function player2(): BelongsTo
    {
        return $this->belongsTo(Participant::class, 'player2_id');
    }

    public function winner(): BelongsTo
    {
        return $this->belongsTo(Participant::class, 'winner_id');
    }
}
