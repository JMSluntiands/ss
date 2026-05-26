<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tournaments', function (Blueprint $table) {
            $table->string('group_stage_format')->nullable()->after('format');
            $table->string('final_stage_format')->nullable()->after('group_stage_format');
            $table->integer('participants_per_group')->nullable()->after('final_stage_format');
            $table->integer('advance_per_group')->nullable()->after('participants_per_group');
        });
    }

    public function down(): void
    {
        Schema::table('tournaments', function (Blueprint $table) {
            $table->dropColumn([
                'group_stage_format',
                'final_stage_format',
                'participants_per_group',
                'advance_per_group',
            ]);
        });
    }
};
