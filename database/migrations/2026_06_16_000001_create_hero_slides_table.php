<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('hero_slides', function (Blueprint $table) {
            $table->id();
            $table->string('title_primary');
            $table->string('title_secondary');
            $table->string('tagline')->nullable();
            $table->string('tagline_accent')->nullable();
            $table->string('cta_label')->nullable();
            $table->string('cta_url', 500)->nullable();
            $table->boolean('cta_opens_join_modal')->default(false);
            $table->string('image_url')->nullable();
            $table->boolean('use_logo_visual')->default(false);
            $table->boolean('published')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        DB::table('hero_slides')->insert([
            'title_primary' => 'SHADOW',
            'title_secondary' => 'SYNDICATE',
            'tagline' => 'Stay sharp. Stay ready.',
            'tagline_accent' => 'Feel the Shadow',
            'cta_label' => 'Join Us',
            'cta_url' => null,
            'cta_opens_join_modal' => true,
            'image_url' => null,
            'use_logo_visual' => true,
            'published' => true,
            'sort_order' => 0,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('hero_slides');
    }
};
