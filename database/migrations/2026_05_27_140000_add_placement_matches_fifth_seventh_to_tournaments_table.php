<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tournaments', function (Blueprint $table) {
            $table->boolean('placement_matches_fifth_seventh')->default(false)->after('third_place_match');
        });

        // Preserve previous behaviour: the old single checkbox also turned on the QF-loser mini-bracket.
        DB::table('tournaments')->where('third_place_match', true)->update(['placement_matches_fifth_seventh' => true]);
    }

    public function down(): void
    {
        Schema::table('tournaments', function (Blueprint $table) {
            $table->dropColumn('placement_matches_fifth_seventh');
        });
    }
};
