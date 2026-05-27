<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EventRegistration extends Model
{
    protected $fillable = [
        'site_event_id',
        'user_id',
        'full_name',
        'entry_type',
        'blader_name_1',
        'blader_name_2',
        'payment_proof',
        'status',
    ];

    public function event(): BelongsTo
    {
        return $this->belongsTo(SiteEvent::class, 'site_event_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
