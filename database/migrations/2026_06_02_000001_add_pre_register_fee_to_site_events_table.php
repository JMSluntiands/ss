<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('site_events', function (Blueprint $table) {
            $table->string('pre_register_fee')->nullable()->after('entry_fee');
            $table->date('pre_register_until')->nullable()->after('pre_register_fee');
        });
    }

    public function down(): void
    {
        Schema::table('site_events', function (Blueprint $table) {
            $table->dropColumn(['pre_register_fee', 'pre_register_until']);
        });
    }
};
