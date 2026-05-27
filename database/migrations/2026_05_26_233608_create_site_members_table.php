<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('site_members', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('role')->default('Member');
            $table->string('rank')->default('C');
            $table->integer('wins')->default(0);
            $table->integer('losses')->default(0);
            $table->string('bey')->nullable();
            $table->string('joined')->nullable();
            $table->string('image_url')->nullable();
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('site_members');
    }
};
