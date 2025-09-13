<?php

use App\Models\Store;
use App\Models\User;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->merchant = User::factory()->merchant()->create();
    $this->store = Store::factory()->approved()->create(['user_id' => $this->merchant->id]);
});

test('store uses uuid as primary key', function () {
    expect(Str::isUuid($this->store->id))->toBeTrue();
});

test('store auto generates slug from name', function () {
    $store = Store::factory()->make(['name' => 'Test Store Name']);
    $store->save();
    expect($store->slug)->toBe('test-store-name');
});

test('store belongs to user', function () {
    expect($this->store->user)->toBeInstanceOf(User::class)
        ->and($this->store->user->id)->toBe($this->merchant->id);
});

test('store status helper methods work correctly', function () {
    expect($this->store->isApproved())->toBeTrue()
        ->and($this->store->isPending())->toBeFalse()
        ->and($this->store->isSuspended())->toBeFalse();

    $pendingStore = Store::factory()->create(['status' => 'pending']);
    expect($pendingStore->isPending())->toBeTrue();

    $suspendedStore = Store::factory()->create(['status' => 'suspended']);
    expect($suspendedStore->isSuspended())->toBeTrue();
});
