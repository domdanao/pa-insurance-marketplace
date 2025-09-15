<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DraftRegistration extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'email',
        'role',
        'current_step',
        'email_verified',
        'form_data',
        'officers',
        'beneficial_owners',
        'banking_info',
        'last_activity',
    ];

    protected $casts = [
        'email_verified' => 'boolean',
        'form_data' => 'array',
        'officers' => 'array',
        'beneficial_owners' => 'array',
        'banking_info' => 'array',
        'last_activity' => 'datetime',
    ];

    public function touchActivity(): void
    {
        $this->update(['last_activity' => now()]);
    }

    public static function findByEmail(string $email): ?self
    {
        return self::where('email', $email)->first();
    }

    public static function createOrUpdateDraft(string $email, array $data): self
    {
        return self::updateOrCreate(
            ['email' => $email],
            array_merge($data, ['last_activity' => now()])
        );
    }
}
