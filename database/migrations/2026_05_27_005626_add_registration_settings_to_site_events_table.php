<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('site_events', function (Blueprint $table) {
            $table->foreignId('tournament_id')->nullable()->constrained('tournaments')->nullOnDelete()->after('id');
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete()->after('tournament_id');
            $table->boolean('allow_double_entry')->default(false)->after('is_upcoming');
            $table->boolean('require_payment')->default(false)->after('allow_double_entry');
            $table->text('payment_method')->nullable()->after('require_payment');
        });
    }

    public function down(): void
    {
        Schema::table('site_events', function (Blueprint $table) {
            $table->dropForeign(['tournament_id']);
            $table->dropForeign(['user_id']);
            $table->dropColumn(['tournament_id', 'user_id', 'allow_double_entry', 'require_payment', 'payment_method']);
        });
    }
};
