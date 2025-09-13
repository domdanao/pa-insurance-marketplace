<?php

use App\Models\User;
use App\Models\Store;
use App\Models\Order;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create(['role' => 'merchant']);
    $this->buyer = User::factory()->create(['role' => 'buyer']);
});

test('user uses uuid as primary key', function () {
    expect(Str::isUuid($this->user->id))->toBeTrue();
});

test('user has correct fillable attributes', function () {
    $user = new User();
    expect($user->getFillable())->toContain('name', 'email', 'password', 'role');
});

test('user defaults to buyer role', function () {
    $user = User::factory()->create();
    expect($user->role)->toBe('buyer');
});

test('user role helper methods work correctly', function () {
    expect($this->user->isMerchant())->toBeTrue()
        ->and($this->user->isBuyer())->toBeFalse()
        ->and($this->user->isAdmin())->toBeFalse();

    expect($this->buyer->isBuyer())->toBeTrue()
        ->and($this->buyer->isMerchant())->toBeFalse()
        ->and($this->buyer->isAdmin())->toBeFalse();
});

test('user can have one store', function () {
    $store = Store::factory()->create(['user_id' => $this->user->id]);
    
    expect($this->user->store)->toBeInstanceOf(Store::class)
        ->and($this->user->store->id)->toBe($store->id);
});

test('user can have many orders', function () {
    Order::factory()->count(2)->create(['user_id' => $this->buyer->id]);
    
    expect($this->buyer->fresh()->orders)->toHaveCount(2)
        ->and($this->buyer->orders->first())->toBeInstanceOf(Order::class);
});

test('user password is hashed', function () {
    $user = User::factory()->create(['password' => 'password123']);
    expect($user->password)->not->toBe('password123');
});
