<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('site_events', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('date');
            $table->string('time')->nullable();
            $table->string('location');
            $table->string('format')->nullable();
            $table->string('slots')->nullable();
            $table->string('status')->default('upcoming');
            $table->integer('participants')->nullable();
            $table->string('winner')->nullable();
            $table->string('runner_up')->nullable();
            $table->boolean('is_upcoming')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('site_events');
    }
};
