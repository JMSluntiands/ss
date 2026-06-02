<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SiteTournamentRoster extends Model
{
    protected $fillable = [
        'name',
        'event_date',
        'location',
        'result',
        'description',
        'image_url',
        'roster',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'event_date' => 'date',
            'roster' => 'array',
        ];
    }
}
