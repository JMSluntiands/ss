<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SiteMember extends Model
{
    protected $fillable = [
        'name', 'role', 'rank', 'wins', 'losses', 'bey', 'joined', 'image_url', 'sort_order',
    ];
}
