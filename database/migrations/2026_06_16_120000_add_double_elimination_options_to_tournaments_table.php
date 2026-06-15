<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tournaments', function (Blueprint $table) {
            $table->boolean('de_split_participants')->default(false)->after('placement_matches_fifth_seventh');
            $table->string('de_grand_finals')->default('reset')->after('de_split_participants');
        });
    }

    public function down(): void
    {
        Schema::table('tournaments', function (Blueprint $table) {
            $table->dropColumn(['de_split_participants', 'de_grand_finals']);
        });
    }
};
