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
        // Since this table likely contains data referencing users with UUIDs,
        // and we can't directly convert integers to UUIDs,
        // we'll clear the notifications table first
        DB::table('notifications')->truncate();

        // Handle database-specific type conversion
        if (DB::getDriverName() === 'sqlite') {
            // For SQLite, recreate the table with proper UUID column
            Schema::dropIfExists('notifications');
            Schema::create('notifications', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->string('type');
                $table->uuidMorphs('notifiable');
                $table->text('data');
                $table->timestamp('read_at')->nullable();
                $table->timestamps();
            });
        } else {
            // For PostgreSQL, convert column type
            DB::statement('ALTER TABLE notifications ALTER COLUMN notifiable_id TYPE uuid USING notifiable_id::text::uuid');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('notifications', function (Blueprint $table) {
            // Change back to bigint
            $table->bigInteger('notifiable_id')->change();
        });
    }
};
