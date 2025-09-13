<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, HasUuids, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'email_verified_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function merchant()
    {
        return $this->hasOne(Merchant::class);
    }

    public function store()
    {
        return $this->hasOne(Store::class);
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    public function cartItems()
    {
        return $this->hasMany(Cart::class);
    }

    public function getCartTotalAttribute(): int
    {
        return $this->cartItems()->with('product')->get()->sum('total_price');
    }

    public function getCartCountAttribute(): int
    {
        return $this->cartItems()->sum('quantity');
    }

    public function isBuyer(): bool
    {
        return $this->role === 'buyer';
    }

    public function isMerchant(): bool
    {
        return $this->role === 'merchant';
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function hasApprovedMerchant(): bool
    {
        return $this->merchant && $this->merchant->isApproved();
    }

    public function hasPendingMerchant(): bool
    {
        return $this->merchant && $this->merchant->isPending();
    }

    public function hasSuspendedMerchant(): bool
    {
        return $this->merchant && $this->merchant->isSuspended();
    }
}
