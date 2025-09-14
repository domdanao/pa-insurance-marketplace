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
        Schema::create('merchant_documents', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('merchant_id')->constrained()->onDelete('cascade');

            // Document information
            $table->enum('document_type', [
                'sec_registration',
                'dti_registration',
                'bir_certificate',
                'mayors_permit',
                'barangay_permit',
                'owners_id',
                'officers_id',
                'bank_certificate',
                'articles_of_incorporation',
                'general_information_sheet',
                'audited_financial_statements',
                'insurance_certificate',
                'beneficial_ownership_declaration',
                'other'
            ]);

            $table->string('document_name'); // User-friendly name
            $table->string('file_name'); // Original filename
            $table->string('file_path'); // Storage path
            $table->string('file_type'); // MIME type
            $table->integer('file_size'); // File size in bytes
            $table->string('file_hash')->nullable(); // For integrity verification

            // Document status and verification
            $table->enum('status', ['pending', 'approved', 'rejected', 'expired'])->default('pending');
            $table->text('rejection_reason')->nullable();
            $table->date('expiry_date')->nullable(); // For permits/licenses
            $table->boolean('is_required')->default(true);

            // Review tracking
            $table->timestamp('reviewed_at')->nullable();
            $table->foreignUuid('reviewed_by')->nullable()->constrained('users')->onDelete('set null');
            $table->text('review_notes')->nullable();

            // Metadata
            $table->json('metadata')->nullable(); // Additional document-specific data

            $table->timestamps();

            // Indexes
            $table->index(['merchant_id', 'document_type']);
            $table->index(['merchant_id', 'status']);
            $table->index('expiry_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('merchant_documents');
    }
};