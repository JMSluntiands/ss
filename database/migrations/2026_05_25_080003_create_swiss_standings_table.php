<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('swiss_standings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tournament_id')->constrained()->cascadeOnDelete();
            $table->foreignId('participant_id')->constrained()->cascadeOnDelete();
            $table->decimal('tournament_points', 6, 1)->default(0);
            $table->integer('battle_points')->default(0);
            $table->decimal('opponent_strength', 8, 2)->default(0);
            $table->integer('wins')->default(0);
            $table->integer('losses')->default(0);
            $table->integer('draws')->default(0);
            $table->boolean('bye_received')->default(false);
            $table->integer('rank')->default(0);
            $table->timestamps();

            $table->unique(['tournament_id', 'participant_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('swiss_standings');
    }
};
