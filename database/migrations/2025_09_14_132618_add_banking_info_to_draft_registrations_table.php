<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('draft_registrations', function (Blueprint $table) {
            $table->json('banking_info')->nullable()->after('beneficial_owners');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('draft_registrations', function (Blueprint $table) {
            $table->dropColumn('banking_info');
        });
    }
};
