<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class MerchantDocument extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'merchant_id',
        'document_type',
        'document_name',
        'file_name',
        'file_path',
        'file_type',
        'file_size',
        'file_hash',
        'status',
        'rejection_reason',
        'expiry_date',
        'is_required',
        'reviewed_at',
        'reviewed_by',
        'review_notes',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'metadata' => 'array',
            'expiry_date' => 'date',
            'reviewed_at' => 'datetime',
            'is_required' => 'boolean',
        ];
    }

    // Relationships
    public function merchant(): BelongsTo
    {
        return $this->belongsTo(Merchant::class);
    }

    public function reviewedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    // Status helper methods
    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    public function isApproved(): bool
    {
        return $this->status === 'approved';
    }

    public function isRejected(): bool
    {
        return $this->status === 'rejected';
    }

    public function isExpired(): bool
    {
        return $this->status === 'expired' ||
               ($this->expiry_date && $this->expiry_date->isPast());
    }

    // Document management methods
    public function getFileUrl(): string
    {
        return Storage::url($this->file_path);
    }

    public function getFileSizeFormatted(): string
    {
        $bytes = $this->file_size;
        $units = ['B', 'KB', 'MB', 'GB'];

        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }

        return round($bytes, 2) . ' ' . $units[$i];
    }

    public function approve(User $reviewer, ?string $notes = null): bool
    {
        return $this->update([
            'status' => 'approved',
            'reviewed_at' => now(),
            'reviewed_by' => $reviewer->id,
            'review_notes' => $notes,
            'rejection_reason' => null,
        ]);
    }

    public function reject(User $reviewer, string $reason, ?string $notes = null): bool
    {
        return $this->update([
            'status' => 'rejected',
            'reviewed_at' => now(),
            'reviewed_by' => $reviewer->id,
            'rejection_reason' => $reason,
            'review_notes' => $notes,
        ]);
    }

    // Document type configurations
    public static function getDocumentTypes(): array
    {
        return [
            'sec_registration' => [
                'name' => 'SEC Registration Certificate',
                'description' => 'Securities and Exchange Commission registration document',
                'required_for' => ['corporation', 'partnership'],
                'expires' => false,
            ],
            'dti_registration' => [
                'name' => 'DTI Registration Certificate',
                'description' => 'Department of Trade and Industry registration',
                'required_for' => ['sole_proprietorship'],
                'expires' => false,
            ],
            'bir_certificate' => [
                'name' => 'BIR Certificate of Registration',
                'description' => 'Bureau of Internal Revenue tax registration',
                'required_for' => ['all'],
                'expires' => false,
            ],
            'mayors_permit' => [
                'name' => "Mayor's Permit / Business Permit",
                'description' => 'Local government business permit',
                'required_for' => ['all'],
                'expires' => true,
            ],
            'barangay_permit' => [
                'name' => 'Barangay Business Permit',
                'description' => 'Barangay clearance for business operation',
                'required_for' => ['all'],
                'expires' => true,
            ],
            'owners_id' => [
                'name' => 'Owner Valid ID',
                'description' => 'Government-issued ID of business owner',
                'required_for' => ['all'],
                'expires' => true,
            ],
            'officers_id' => [
                'name' => 'Officers Valid IDs',
                'description' => 'Government-issued IDs of corporate officers',
                'required_for' => ['corporation', 'partnership'],
                'expires' => true,
            ],
            'bank_certificate' => [
                'name' => 'Bank Certificate',
                'description' => 'Bank certification of account',
                'required_for' => ['all'],
                'expires' => false,
            ],
            'articles_of_incorporation' => [
                'name' => 'Articles of Incorporation',
                'description' => 'Corporate formation documents',
                'required_for' => ['corporation'],
                'expires' => false,
            ],
            'general_information_sheet' => [
                'name' => 'General Information Sheet (GIS)',
                'description' => 'Annual corporate information filing',
                'required_for' => ['corporation'],
                'expires' => true,
            ],
            'audited_financial_statements' => [
                'name' => 'Audited Financial Statements',
                'description' => 'Audited financial statements (if required)',
                'required_for' => [],
                'expires' => true,
            ],
            'insurance_certificate' => [
                'name' => 'Insurance Certificate',
                'description' => 'Business insurance coverage certificate',
                'required_for' => ['all'],
                'expires' => true,
            ],
            'beneficial_ownership_declaration' => [
                'name' => 'Beneficial Ownership Declaration',
                'description' => 'Declaration of ultimate beneficial owners',
                'required_for' => ['corporation', 'partnership'],
                'expires' => false,
            ],
            'other' => [
                'name' => 'Other Document',
                'description' => 'Additional supporting documents',
                'required_for' => [],
                'expires' => false,
            ],
        ];
    }

    public static function getRequiredDocumentsForBusinessType(string $businessType): array
    {
        $allTypes = self::getDocumentTypes();
        $required = [];

        foreach ($allTypes as $type => $config) {
            if (in_array('all', $config['required_for']) ||
                in_array($businessType, $config['required_for'])) {
                $required[$type] = $config;
            }
        }

        return $required;
    }
}