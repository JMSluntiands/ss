<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->boolean('can_use_judge')->default(true)->after('can_manage_tournaments');
            $table->boolean('can_score_matches')->default(true)->after('can_use_judge');
            $table->boolean('can_create_tournaments')->default(true)->after('can_score_matches');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['can_use_judge', 'can_score_matches', 'can_create_tournaments']);
        });
    }
};
