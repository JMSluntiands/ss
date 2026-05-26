<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tournament_matches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tournament_id')->constrained()->cascadeOnDelete();
            $table->integer('round');
            $table->integer('match_number');
            $table->foreignId('player1_id')->nullable()->constrained('participants')->nullOnDelete();
            $table->foreignId('player2_id')->nullable()->constrained('participants')->nullOnDelete();
            $table->foreignId('winner_id')->nullable()->constrained('participants')->nullOnDelete();
            $table->integer('player1_score')->nullable();
            $table->integer('player2_score')->nullable();
            $table->integer('next_match_id')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tournament_matches');
    }
};
