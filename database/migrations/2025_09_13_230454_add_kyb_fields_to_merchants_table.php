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
        Schema::table('merchants', function (Blueprint $table) {
            // Additional business registration information
            $table->string('sec_registration_number')->nullable()->after('tax_id');
            $table->string('dti_registration_number')->nullable()->after('sec_registration_number');
            $table->date('business_registration_date')->nullable()->after('dti_registration_number');
            $table->string('bir_certificate_number')->nullable()->after('business_registration_date');
            $table->string('mayors_permit_number')->nullable()->after('bir_certificate_number');
            $table->date('mayors_permit_expiry')->nullable()->after('mayors_permit_number');

            // Corporate structure and ownership
            $table->json('officers')->nullable()->after('documents'); // Company officers data
            $table->json('beneficial_owners')->nullable()->after('officers'); // UBO data (25%+ ownership)
            $table->decimal('authorized_capital', 15, 2)->nullable()->after('beneficial_owners');
            $table->decimal('paid_up_capital', 15, 2)->nullable()->after('authorized_capital');

            // Insurance and compliance
            $table->string('insurance_policy_number')->nullable()->after('paid_up_capital');
            $table->string('insurance_provider')->nullable()->after('insurance_policy_number');
            $table->date('insurance_expiry')->nullable()->after('insurance_provider');

            // Document tracking with categories
            $table->json('document_requirements')->nullable()->after('insurance_expiry'); // Required docs checklist
            $table->json('document_status')->nullable()->after('document_requirements'); // Document verification status

            // Review and compliance notes
            $table->text('compliance_notes')->nullable()->after('document_status');
            $table->timestamp('last_reviewed_at')->nullable()->after('compliance_notes');
            $table->foreignUuid('last_reviewed_by')->nullable()->constrained('users')->onDelete('set null')->after('last_reviewed_at');

            // KYB completion status
            $table->boolean('kyb_completed')->default(false)->after('last_reviewed_by');
            $table->timestamp('kyb_completed_at')->nullable()->after('kyb_completed');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('merchants', function (Blueprint $table) {
            $table->dropColumn([
                'sec_registration_number',
                'dti_registration_number',
                'business_registration_date',
                'bir_certificate_number',
                'mayors_permit_number',
                'mayors_permit_expiry',
                'officers',
                'beneficial_owners',
                'authorized_capital',
                'paid_up_capital',
                'insurance_policy_number',
                'insurance_provider',
                'insurance_expiry',
                'document_requirements',
                'document_status',
                'compliance_notes',
                'last_reviewed_at',
                'last_reviewed_by',
                'kyb_completed',
                'kyb_completed_at'
            ]);
        });
    }
};