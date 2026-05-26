<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tournament_matches', function (Blueprint $table) {
            $table->string('stage')->default('group')->after('tournament_id');
            $table->string('bracket')->nullable()->after('stage');
            $table->integer('loser_next_match_id')->nullable()->after('next_match_id');
        });
    }

    public function down(): void
    {
        Schema::table('tournament_matches', function (Blueprint $table) {
            $table->dropColumn(['stage', 'bracket', 'loser_next_match_id']);
        });
    }
};
