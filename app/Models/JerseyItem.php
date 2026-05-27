<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class JerseyItem extends Model
{
    protected $fillable = [
        'name', 'price', 'sizes', 'color', 'material', 'description', 'image_url', 'available', 'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'sizes' => 'array',
            'available' => 'boolean',
        ];
    }
}
