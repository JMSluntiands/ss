<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('site_tournament_rosters', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->date('event_date')->nullable();
            $table->string('location')->nullable();
            $table->string('result')->nullable();
            $table->text('description')->nullable();
            $table->string('image_url')->nullable();
            $table->json('roster');
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('site_tournament_rosters');
    }
};
