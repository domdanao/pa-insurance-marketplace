<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('guests are redirected to the login page', function () {
    $this->get(route('dashboard'))->assertRedirect(route('login'));
});

test('authenticated users are redirected to their role dashboard', function () {
    $buyer = User::factory()->create(['role' => 'buyer']);
    $this->actingAs($buyer);
    $this->get(route('dashboard'))->assertRedirect(route('buyer.dashboard'));

    $merchant = User::factory()->merchant()->create();
    $this->actingAs($merchant);
    $this->get(route('dashboard'))->assertRedirect(route('merchant.dashboard'));

    $admin = User::factory()->admin()->create();
    $this->actingAs($admin);
    $this->get(route('dashboard'))->assertRedirect(route('admin.dashboard'));
});