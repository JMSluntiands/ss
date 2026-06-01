<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('jersey_items', function (Blueprint $table) {
            $table->string('category', 32)->default('jersey')->after('name');
        });

        Schema::table('jersey_items', function (Blueprint $table) {
            $table->decimal('price_amount', 10, 2)->default(0)->after('category');
        });

        foreach (DB::table('jersey_items')->get() as $row) {
            DB::table('jersey_items')->where('id', $row->id)->update([
                'price_amount' => self::parseLegacyPrice($row->price),
            ]);
        }

        Schema::table('jersey_items', function (Blueprint $table) {
            $table->dropColumn('price');
        });

        Schema::table('jersey_items', function (Blueprint $table) {
            $table->renameColumn('price_amount', 'price');
        });
    }

    public function down(): void
    {
        Schema::table('jersey_items', function (Blueprint $table) {
            $table->string('price_legacy')->nullable()->after('category');
        });

        foreach (DB::table('jersey_items')->get() as $row) {
            DB::table('jersey_items')->where('id', $row->id)->update([
                'price_legacy' => '₱'.number_format((float) $row->price, 2),
            ]);
        }

        Schema::table('jersey_items', function (Blueprint $table) {
            $table->dropColumn(['price', 'category']);
        });

        Schema::table('jersey_items', function (Blueprint $table) {
            $table->renameColumn('price_legacy', 'price');
        });
    }

    private static function parseLegacyPrice(mixed $value): float
    {
        if (is_numeric($value)) {
            return round((float) $value, 2);
        }

        $numeric = preg_replace('/[^\d.]/', '', (string) $value);

        return round((float) ($numeric !== '' ? $numeric : 0), 2);
    }
};
