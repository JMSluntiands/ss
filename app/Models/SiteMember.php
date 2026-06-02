<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SiteMember extends Model
{
    protected $fillable = [
        'name', 'role', 'rank', 'wins', 'losses', 'bey', 'joined', 'image_url', 'sort_order', 'user_id',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
