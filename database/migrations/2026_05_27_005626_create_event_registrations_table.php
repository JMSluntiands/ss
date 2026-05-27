<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('event_registrations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('site_event_id')->constrained('site_events')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('full_name');
            $table->enum('entry_type', ['single', 'double'])->default('single');
            $table->string('blader_name_1');
            $table->string('blader_name_2')->nullable();
            $table->string('payment_proof')->nullable();
            $table->enum('status', ['tentative', 'confirmed', 'rejected'])->default('tentative');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('event_registrations');
    }
};
