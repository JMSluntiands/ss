<?php

use App\Models\SiteMember;
use App\Models\User;
use App\Support\UserAccountType;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('account_type', 32)->default(UserAccountType::ORGANIZER)->after('role');
        });

        $memberUserIds = SiteMember::query()
            ->whereNotNull('user_id')
            ->pluck('user_id');

        if ($memberUserIds->isNotEmpty()) {
            User::query()
                ->whereIn('id', $memberUserIds)
                ->where('role', '!=', 'admin')
                ->update(['account_type' => UserAccountType::MEMBER]);
        }

        User::query()->where('role', 'admin')->update(['account_type' => UserAccountType::ADMIN]);
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('account_type');
        });
    }
};
