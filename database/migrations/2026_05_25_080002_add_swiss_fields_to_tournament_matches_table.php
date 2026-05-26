<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tournament_matches', function (Blueprint $table) {
            $table->integer('player1_battle_points')->default(0)->after('player2_score');
            $table->integer('player2_battle_points')->default(0)->after('player1_battle_points');
            $table->boolean('is_bye')->default(false)->after('player2_battle_points');
            $table->boolean('is_draw')->default(false)->after('is_bye');
            $table->string('status')->default('pending')->after('is_draw');
        });
    }

    public function down(): void
    {
        Schema::table('tournament_matches', function (Blueprint $table) {
            $table->dropColumn([
                'player1_battle_points',
                'player2_battle_points',
                'is_bye',
                'is_draw',
                'status',
            ]);
        });
    }
};
