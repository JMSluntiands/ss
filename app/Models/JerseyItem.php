<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class JerseyItem extends Model
{
    public const CATEGORY_JERSEY = 'jersey';

    public const CATEGORY_BEYBLADE_PART = 'beyblade_part';

    protected $fillable = [
        'name',
        'category',
        'price',
        'sizes',
        'color',
        'material',
        'description',
        'facebook_url',
        'image_url',
        'available',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'sizes' => 'array',
            'available' => 'boolean',
        ];
    }

    public static function categories(): array
    {
        return [
            self::CATEGORY_JERSEY => 'Jersey / Apparel',
            self::CATEGORY_BEYBLADE_PART => 'Beyblade Part',
        ];
    }
}
