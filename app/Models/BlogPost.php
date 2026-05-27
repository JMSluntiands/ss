<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BlogPost extends Model
{
    protected $fillable = [
        'title', 'excerpt', 'content', 'images', 'category', 'author', 'read_time', 'published',
    ];

    protected function casts(): array
    {
        return [
            'published' => 'boolean',
            'images' => 'array',
        ];
    }
}
