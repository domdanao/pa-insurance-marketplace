<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('draft_registrations', function (Blueprint $table) {
            $table->id();
            $table->string('email')->unique();
            $table->enum('role', ['merchant', 'buyer'])->default('merchant');
            $table->integer('current_step')->default(1);
            $table->boolean('email_verified')->default(false);
            $table->json('form_data')->nullable(); // Store all form fields
            $table->json('officers')->nullable(); // Store officers array
            $table->json('beneficial_owners')->nullable(); // Store beneficial owners array
            $table->timestamp('last_activity')->useCurrent();
            $table->timestamps();

            $table->index('email');
            $table->index('last_activity');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('draft_registrations');
    }
};
