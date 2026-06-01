<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('jersey_items', function (Blueprint $table) {
            $table->string('facebook_url', 500)->nullable()->after('description');
        });
    }

    public function down(): void
    {
        Schema::table('jersey_items', function (Blueprint $table) {
            $table->dropColumn('facebook_url');
        });
    }
};
