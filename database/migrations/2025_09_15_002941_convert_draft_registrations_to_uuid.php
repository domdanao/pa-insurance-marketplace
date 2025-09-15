<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (DB::getDriverName() === 'sqlite') {
            // For SQLite, recreate the table with UUID primary key
            $oldData = DB::table('draft_registrations')->get();

            Schema::dropIfExists('draft_registrations');
            Schema::create('draft_registrations', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->string('email')->unique();
                $table->boolean('email_verified')->default(false);
                $table->json('form_data')->nullable();
                $table->json('banking_info')->nullable();
                $table->json('officers')->nullable();
                $table->json('beneficial_owners')->nullable();
                $table->timestamps();
            });

            // Restore data with new UUIDs
            foreach ($oldData as $record) {
                DB::table('draft_registrations')->insert([
                    'id' => \Illuminate\Support\Str::uuid(),
                    'email' => $record->email,
                    'email_verified' => $record->email_verified,
                    'form_data' => $record->form_data,
                    'banking_info' => $record->banking_info,
                    'officers' => $record->officers,
                    'beneficial_owners' => $record->beneficial_owners,
                    'created_at' => $record->created_at,
                    'updated_at' => $record->updated_at,
                ]);
            }
        } else {
            // For PostgreSQL, alter the existing table
            Schema::table('draft_registrations', function (Blueprint $table) {
                $table->uuid('uuid')->nullable()->after('id');
            });

            DB::statement('UPDATE draft_registrations SET uuid = gen_random_uuid() WHERE uuid IS NULL');

            Schema::table('draft_registrations', function (Blueprint $table) {
                $table->uuid('uuid')->nullable(false)->change();
            });

            Schema::table('draft_registrations', function (Blueprint $table) {
                $table->dropPrimary(['id']);
                $table->dropColumn('id');
                $table->renameColumn('uuid', 'id');
                $table->primary('id');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Add back integer ID column
        Schema::table('draft_registrations', function (Blueprint $table) {
            $table->dropPrimary(['id']);
            $table->renameColumn('id', 'uuid');
            $table->bigIncrements('id')->first();
            $table->primary('id');
        });

        // Remove UUID column
        Schema::table('draft_registrations', function (Blueprint $table) {
            $table->dropColumn('uuid');
        });
    }
};
