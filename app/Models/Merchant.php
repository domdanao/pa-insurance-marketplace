<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Merchant extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'user_id',
        'business_name',
        'business_type',
        'tax_id',
        'business_description',
        'phone',
        'website',
        'address_line_1',
        'address_line_2',
        'city',
        'state',
        'postal_code',
        'country',
        'bank_account_holder',
        'bank_account_number',
        'bank_routing_number',
        'bank_name',
        'status',
        'rejection_reason',
        'approved_at',
        'approved_by',
        'documents',
    ];

    protected function casts(): array
    {
        return [
            'documents' => 'array',
            'approved_at' => 'datetime',
        ];
    }

    // Relationships
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function store(): HasOne
    {
        return $this->hasOne(Store::class);
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
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

    public function isSuspended(): bool
    {
        return $this->status === 'suspended';
    }

    public function isRejected(): bool
    {
        return $this->status === 'rejected';
    }

    // Approve merchant
    public function approve(User $approver): bool
    {
        return $this->update([
            'status' => 'approved',
            'approved_at' => now(),
            'approved_by' => $approver->id,
            'rejection_reason' => null,
        ]);
    }

    // Suspend merchant
    public function suspend(?string $reason = null): bool
    {
        return $this->update([
            'status' => 'suspended',
            'rejection_reason' => $reason,
        ]);
    }

    // Reject merchant
    public function reject(string $reason): bool
    {
        return $this->update([
            'status' => 'rejected',
            'rejection_reason' => $reason,
        ]);
    }

    // Reactivate merchant
    public function reactivate(): bool
    {
        return $this->update([
            'status' => 'approved',
            'rejection_reason' => null,
        ]);
    }
}
