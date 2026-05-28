<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('site_visitor_stats', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('total_visits')->default(0);
            $table->timestamps();
        });

        DB::table('site_visitor_stats')->insert([
            'id' => 1,
            'total_visits' => 0,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('site_visitor_stats');
    }
};
