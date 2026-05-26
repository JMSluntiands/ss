<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tournaments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('game')->nullable();
            $table->string('tournament_type')->default('single_elimination');
            $table->string('format')->default('single_elimination');
            $table->boolean('break_ties')->default(false);
            $table->string('registration_type')->default('manual');
            $table->string('registration_fee')->default('free');
            $table->boolean('require_team')->default(false);
            $table->integer('max_participants')->nullable();
            $table->datetime('start_time')->nullable();
            $table->boolean('tentative')->default(false);
            $table->boolean('enable_voting')->default(false);
            $table->boolean('enable_predictions')->default(false);
            $table->boolean('third_place_match')->default(false);
            $table->boolean('notify_participants')->default(true);
            $table->string('status')->default('pending');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tournaments');
    }
};
