<?php

use App\Models\Category;
use App\Models\Store;
use App\Models\User;

it('redirects merchant to store creation when no store exists', function () {
    $merchant = User::factory()->merchant()->create();

    $this->actingAs($merchant)
        ->get('/merchant/dashboard')
        ->assertRedirect('/merchant/store/create');
});

it('shows store creation form to merchant without store', function () {
    $merchant = User::factory()->merchant()->create();
    Category::factory()->count(3)->create();

    $this->actingAs($merchant)
        ->get('/merchant/store/create')
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->component('Merchant/Store/Create')
            ->has('categories', 3)
        );
});

it('allows merchant to create a new store', function () {
    $merchant = User::factory()->merchant()->create();
    $category = Category::factory()->create();

    $storeData = [
        'name' => 'Test Electronics Store',
        'description' => 'A comprehensive electronics store with latest gadgets and accessories.',
        'category_id' => $category->id,
        'contact_email' => 'contact@teststore.com',
        'contact_phone' => '+1234567890',
        'address' => '123 Tech Street, Silicon Valley, CA 94000',
    ];

    $this->actingAs($merchant)
        ->post('/merchant/store', $storeData)
        ->assertRedirect('/merchant/dashboard')
        ->assertSessionHas('success', 'Your store has been submitted for review.');

    $this->assertDatabaseHas('stores', [
        'user_id' => $merchant->id,
        'name' => 'Test Electronics Store',
        'slug' => 'test-electronics-store',
        'status' => 'pending',
        'contact_email' => 'contact@teststore.com',
    ]);
});

it('prevents merchant from creating multiple stores', function () {
    $merchant = User::factory()->merchant()->create();
    $store = Store::factory()->create(['user_id' => $merchant->id]);
    $category = Category::factory()->create();

    $storeData = [
        'name' => 'Second Store',
        'description' => 'This should not be allowed.',
        'category_id' => $category->id,
        'contact_email' => 'second@teststore.com',
        'address' => '456 Another Street',
    ];

    $this->actingAs($merchant)
        ->post('/merchant/store', $storeData)
        ->assertRedirect('/merchant/dashboard')
        ->assertSessionHas('error', 'You already have a store.');
});

it('validates required fields when creating store', function () {
    $merchant = User::factory()->merchant()->create();

    $this->actingAs($merchant)
        ->post('/merchant/store', [])
        ->assertSessionHasErrors([
            'name',
            'description',
            'category_id',
            'contact_email',
            'address',
        ]);
});

it('validates store name uniqueness', function () {
    $merchant = User::factory()->merchant()->create();
    $existingStore = Store::factory()->create(['name' => 'Unique Store Name']);
    $category = Category::factory()->create();

    $storeData = [
        'name' => 'Unique Store Name',
        'description' => 'This should fail due to name conflict.',
        'category_id' => $category->id,
        'contact_email' => 'contact@teststore.com',
        'address' => '123 Test Street',
    ];

    $this->actingAs($merchant)
        ->post('/merchant/store', $storeData)
        ->assertSessionHasErrors(['name']);
});

it('shows store edit form to merchant with existing store', function () {
    $merchant = User::factory()->merchant()->create();
    $store = Store::factory()->create(['user_id' => $merchant->id]);
    Category::factory()->count(3)->create();

    $this->actingAs($merchant)
        ->get('/merchant/store/edit')
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->component('Merchant/Store/Edit')
            ->has('store')
            ->has('categories', 3)
        );
});

it('allows merchant to update their store', function () {
    $merchant = User::factory()->merchant()->create();
    $store = Store::factory()->create(['user_id' => $merchant->id, 'name' => 'Original Store']);
    $newCategory = Category::factory()->create();

    $updateData = [
        'name' => 'Updated Store Name',
        'description' => 'Updated description for the store.',
        'category_id' => $newCategory->id,
        'contact_email' => 'updated@store.com',
        'contact_phone' => '+9876543210',
        'address' => '789 Updated Street, New City',
    ];

    $this->actingAs($merchant)
        ->put('/merchant/store', $updateData)
        ->assertRedirect('/merchant/dashboard')
        ->assertSessionHas('success', 'Store updated successfully.');

    $this->assertDatabaseHas('stores', [
        'id' => $store->id,
        'name' => 'Updated Store Name',
        'slug' => 'updated-store-name',
        'contact_email' => 'updated@store.com',
    ]);
});

it('redirects to store creation if merchant tries to edit without having a store', function () {
    $merchant = User::factory()->merchant()->create();

    $this->actingAs($merchant)
        ->get('/merchant/store/edit')
        ->assertRedirect('/merchant/store/create');

    $this->actingAs($merchant)
        ->put('/merchant/store', [
            'name' => 'Test Store',
            'description' => 'Test description',
            'category_id' => Category::factory()->create()->id,
            'contact_email' => 'test@store.com',
            'address' => 'Test Address',
        ])
        ->assertRedirect('/merchant/store/create');
});

it('prevents non-merchants from accessing store management', function () {
    $buyer = User::factory()->buyer()->create();
    $admin = User::factory()->admin()->create();

    $this->actingAs($buyer)
        ->get('/merchant/store/create')
        ->assertForbidden();

    $this->actingAs($admin)
        ->get('/merchant/store/create')
        ->assertForbidden();
});

it('shows merchant dashboard with store pending approval', function () {
    $merchant = User::factory()->merchant()->create();
    $store = Store::factory()->create([
        'user_id' => $merchant->id,
        'status' => 'pending',
    ]);

    $this->actingAs($merchant)
        ->get('/merchant/dashboard')
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->component('Merchant/StoreUnderReview')
            ->has('store')
        );
});

it('shows merchant dashboard with suspended store', function () {
    $merchant = User::factory()->merchant()->create();
    $store = Store::factory()->create([
        'user_id' => $merchant->id,
        'status' => 'suspended',
    ]);

    $this->actingAs($merchant)
        ->get('/merchant/dashboard')
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->component('Merchant/StoreSuspended')
            ->has('store')
        );
});

it('shows merchant dashboard with approved store and stats', function () {
    $merchant = User::factory()->merchant()->create();
    $store = Store::factory()->create([
        'user_id' => $merchant->id,
        'status' => 'approved',
    ]);

    $this->actingAs($merchant)
        ->get('/merchant/dashboard')
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->component('Merchant/Dashboard')
            ->has('user')
            ->has('store')
            ->has('stats')
            ->has('stats.recent_orders')
            ->has('stats.products.total')
            ->has('stats.products.published')
            ->has('stats.orders.total')
            ->has('stats.revenue.total')
            ->has('stats.low_stock_products')
        );
});
