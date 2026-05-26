<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tournaments', function (Blueprint $table) {
            $table->integer('swiss_rounds')->nullable()->after('format');
            $table->integer('current_round')->default(0)->after('swiss_rounds');
            $table->decimal('pts_for_match_win', 4, 1)->default(3.0)->after('current_round');
            $table->decimal('pts_for_match_tie', 4, 1)->default(1.0)->after('pts_for_match_win');
            $table->decimal('pts_for_game_win', 4, 1)->default(0.0)->after('pts_for_match_tie');
            $table->decimal('pts_for_game_tie', 4, 1)->default(0.0)->after('pts_for_game_win');
            $table->decimal('pts_for_bye', 4, 1)->default(3.0)->after('pts_for_game_tie');
        });
    }

    public function down(): void
    {
        Schema::table('tournaments', function (Blueprint $table) {
            $table->dropColumn([
                'swiss_rounds',
                'current_round',
                'pts_for_match_win',
                'pts_for_match_tie',
                'pts_for_game_win',
                'pts_for_game_tie',
                'pts_for_bye',
            ]);
        });
    }
};
