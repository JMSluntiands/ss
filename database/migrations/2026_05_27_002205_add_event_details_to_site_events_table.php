<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('site_events', function (Blueprint $table) {
            $table->string('organizer')->nullable()->after('description');
            $table->string('entry_fee')->nullable()->after('slots');
            $table->json('prizes')->nullable()->after('entry_fee');
            $table->string('map_address')->nullable()->after('location');
            $table->decimal('map_lat', 10, 7)->nullable()->after('map_address');
            $table->decimal('map_lng', 10, 7)->nullable()->after('map_lat');
        });
    }

    public function down(): void
    {
        Schema::table('site_events', function (Blueprint $table) {
            $table->dropColumn(['organizer', 'entry_fee', 'prizes', 'map_address', 'map_lat', 'map_lng']);
        });
    }
};
