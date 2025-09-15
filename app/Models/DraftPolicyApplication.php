<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DraftPolicyApplication extends Model
{
    use HasUuids;

    protected $fillable = [
        'user_id',
        'email',
        'current_step',
        'form_data',
        'cart_data',
        'is_completed',
        'last_accessed_at',
    ];

    protected function casts(): array
    {
        return [
            'form_data' => 'array',
            'cart_data' => 'array',
            'is_completed' => 'boolean',
            'last_accessed_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function scopeIncomplete($query)
    {
        return $query->where('is_completed', false);
    }

    public function scopeForUser($query, User $user)
    {
        return $query->where('user_id', $user->id);
    }

    public function scopeForEmail($query, string $email)
    {
        return $query->where('email', $email);
    }

    public function scopeRecent($query)
    {
        return $query->orderBy('last_accessed_at', 'desc');
    }

    public function updateLastAccessed(): void
    {
        $this->update(['last_accessed_at' => now()]);
    }

    public function markAsCompleted(): void
    {
        $this->update(['is_completed' => true]);
    }

    public function isExpired(): bool
    {
        // Consider draft expired after 30 days of inactivity
        return $this->last_accessed_at->lt(now()->subDays(30));
    }
}
