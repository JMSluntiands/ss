<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('plan_upgrade_requests', function (Blueprint $table) {
            $table->string('amount_due')->nullable()->after('requested_plan');
            $table->string('payment_proof')->nullable()->after('user_message');
        });
    }

    public function down(): void
    {
        Schema::table('plan_upgrade_requests', function (Blueprint $table) {
            $table->dropColumn(['amount_due', 'payment_proof']);
        });
    }
};
