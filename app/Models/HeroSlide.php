<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HeroSlide extends Model
{
    protected $fillable = [
        'title_primary',
        'title_secondary',
        'tagline',
        'tagline_accent',
        'cta_label',
        'cta_url',
        'cta_opens_join_modal',
        'image_url',
        'use_logo_visual',
        'published',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'cta_opens_join_modal' => 'boolean',
            'use_logo_visual' => 'boolean',
            'published' => 'boolean',
        ];
    }
}
