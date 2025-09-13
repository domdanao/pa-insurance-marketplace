<?php

use App\Models\Store;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('unauthenticated user cannot access protected routes', function () {
    $response = $this->get('/buyer/dashboard');
    $response->assertRedirect('/login');

    $response = $this->get('/merchant/dashboard');
    $response->assertRedirect('/login');

    $response = $this->get('/admin/dashboard');
    $response->assertRedirect('/login');
});

test('buyer can only access buyer routes', function () {
    $buyer = User::factory()->create(['role' => 'buyer']);

    $this->actingAs($buyer);

    // Can access buyer routes
    $response = $this->get('/buyer/dashboard');
    $response->assertStatus(200);

    // Cannot access merchant routes
    $response = $this->get('/merchant/dashboard');
    $response->assertStatus(403);

    // Cannot access admin routes
    $response = $this->get('/admin/dashboard');
    $response->assertStatus(403);
});

test('merchant can only access merchant routes', function () {
    $merchant = User::factory()->merchant()->create();
    $store = Store::factory()->create(['user_id' => $merchant->id, 'status' => 'approved']);

    $this->actingAs($merchant);

    // Can access merchant routes
    $response = $this->get('/merchant/dashboard');
    $response->assertStatus(200);

    // Cannot access buyer routes
    $response = $this->get('/buyer/dashboard');
    $response->assertStatus(403);

    // Cannot access admin routes
    $response = $this->get('/admin/dashboard');
    $response->assertStatus(403);
});

test('admin can only access admin routes', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin);

    // Can access admin routes
    $response = $this->get('/admin/dashboard');
    $response->assertStatus(200);

    // Cannot access buyer routes
    $response = $this->get('/buyer/dashboard');
    $response->assertStatus(403);

    // Cannot access merchant routes
    $response = $this->get('/merchant/dashboard');
    $response->assertStatus(403);
});

test('dashboard redirects to appropriate role dashboard', function () {
    $buyer = User::factory()->create(['role' => 'buyer']);
    $merchant = User::factory()->merchant()->create();
    $admin = User::factory()->admin()->create();

    $this->actingAs($buyer);
    $response = $this->get('/dashboard');
    $response->assertRedirect('/buyer/dashboard');

    $this->actingAs($merchant);
    $response = $this->get('/dashboard');
    $response->assertRedirect('/merchant/dashboard');

    $this->actingAs($admin);
    $response = $this->get('/dashboard');
    $response->assertRedirect('/admin/dashboard');
});
