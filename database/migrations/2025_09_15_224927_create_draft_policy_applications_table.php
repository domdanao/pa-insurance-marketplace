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
        Schema::create('draft_policy_applications', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id');
            $table->string('email'); // Allow resume by email for guest users
            $table->integer('current_step')->default(1);
            $table->json('form_data'); // Store all form data as JSON
            $table->json('cart_data')->nullable(); // Store cart items at time of draft
            $table->boolean('is_completed')->default(false);
            $table->timestamp('last_accessed_at')->useCurrent();
            $table->timestamps();

            // Indexes
            $table->index(['user_id', 'is_completed']);
            $table->index(['email', 'is_completed']);
            $table->index('last_accessed_at');

            // Foreign keys
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('draft_policy_applications');
    }
};
