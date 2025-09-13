<?php

use App\Models\Category;
use App\Models\Product;
use App\Models\Store;
use App\Models\User;

it('shows products list for merchant with approved store', function () {
    $merchant = User::factory()->merchant()->create();
    $store = Store::factory()->create(['user_id' => $merchant->id, 'status' => 'approved']);
    $category = Category::factory()->create();

    Product::factory()->count(5)->create([
        'store_id' => $store->id,
        'category_id' => $category->id,
    ]);

    $this->actingAs($merchant)
        ->get('/merchant/products')
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->component('Merchant/Products/Index')
            ->has('products')
            ->has('products.data', 5)
            ->has('filters')
        );
});

it('redirects merchant without store to store creation', function () {
    $merchant = User::factory()->merchant()->create();

    $this->actingAs($merchant)
        ->get('/merchant/products')
        ->assertRedirect('/merchant/store/create');
});

it('shows product creation form only to merchants with approved store', function () {
    $merchant = User::factory()->merchant()->create();
    $store = Store::factory()->create(['user_id' => $merchant->id, 'status' => 'approved']);
    Category::factory()->count(3)->create();

    $this->actingAs($merchant)
        ->get('/merchant/products/create')
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->component('Merchant/Products/Create')
            ->has('categories', 3)
        );
});

it('prevents merchants with pending store from creating products', function () {
    $merchant = User::factory()->merchant()->create();
    $store = Store::factory()->create(['user_id' => $merchant->id, 'status' => 'pending']);

    $this->actingAs($merchant)
        ->get('/merchant/products/create')
        ->assertRedirect('/merchant/dashboard')
        ->assertSessionHas('error', 'Your store must be approved before you can add products.');
});

it('allows merchant to create a physical product', function () {
    $merchant = User::factory()->merchant()->create();
    $store = Store::factory()->create(['user_id' => $merchant->id, 'status' => 'approved']);
    $category = Category::factory()->create();

    $productData = [
        'name' => 'Test Physical Product',
        'description' => 'This is a detailed description of the physical product.',
        'category_id' => $category->id,
        'price' => 29.99,
        'quantity' => 100,
        'digital_product' => false,
    ];

    $this->actingAs($merchant)
        ->post('/merchant/products', $productData)
        ->assertRedirect()
        ->assertSessionHas('success', 'Product created successfully.');

    $this->assertDatabaseHas('products', [
        'store_id' => $store->id,
        'name' => 'Test Physical Product',
        'slug' => 'test-physical-product',
        'price' => 2999,
        'quantity' => 100,
        'digital_product' => false,
        'status' => 'draft',
    ]);
});

it('allows merchant to create a digital product', function () {
    $merchant = User::factory()->merchant()->create();
    $store = Store::factory()->create(['user_id' => $merchant->id, 'status' => 'approved']);
    $category = Category::factory()->create();

    $productData = [
        'name' => 'Test Digital Product',
        'description' => 'This is a detailed description of the digital product.',
        'category_id' => $category->id,
        'price' => 19.99,
        'digital_product' => true,
        'download_url' => 'https://example.com/download/file.zip',
    ];

    $this->actingAs($merchant)
        ->post('/merchant/products', $productData)
        ->assertRedirect()
        ->assertSessionHas('success', 'Product created successfully.');

    $this->assertDatabaseHas('products', [
        'store_id' => $store->id,
        'name' => 'Test Digital Product',
        'slug' => 'test-digital-product',
        'price' => 1999,
        'digital_product' => true,
        'download_url' => 'https://example.com/download/file.zip',
        'status' => 'draft',
    ]);
});

it('validates required fields when creating product', function () {
    $merchant = User::factory()->merchant()->create();
    Store::factory()->create(['user_id' => $merchant->id, 'status' => 'approved']);

    $this->actingAs($merchant)
        ->post('/merchant/products', [])
        ->assertSessionHasErrors([
            'name',
            'description',
            'category_id',
            'price',
        ]);
});

it('validates digital product requires download url', function () {
    $merchant = User::factory()->merchant()->create();
    Store::factory()->create(['user_id' => $merchant->id, 'status' => 'approved']);
    $category = Category::factory()->create();

    $productData = [
        'name' => 'Digital Product',
        'description' => 'This digital product is missing download URL.',
        'category_id' => $category->id,
        'price' => 19.99,
        'digital_product' => true,
    ];

    $this->actingAs($merchant)
        ->post('/merchant/products', $productData)
        ->assertSessionHasErrors(['download_url']);
});

it('validates physical product requires quantity', function () {
    $merchant = User::factory()->merchant()->create();
    Store::factory()->create(['user_id' => $merchant->id, 'status' => 'approved']);
    $category = Category::factory()->create();

    $productData = [
        'name' => 'Physical Product',
        'description' => 'This physical product is missing quantity.',
        'category_id' => $category->id,
        'price' => 29.99,
        'digital_product' => false,
    ];

    $this->actingAs($merchant)
        ->post('/merchant/products', $productData)
        ->assertSessionHasErrors(['quantity']);
});

it('allows merchant to view their own product', function () {
    $merchant = User::factory()->merchant()->create();
    $store = Store::factory()->create(['user_id' => $merchant->id]);
    $product = Product::factory()->create(['store_id' => $store->id]);

    $this->actingAs($merchant)
        ->get("/merchant/products/{$product->id}")
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->component('Merchant/Products/Show')
            ->has('product')
        );
});

it('prevents merchant from viewing other merchants products', function () {
    $merchant = User::factory()->merchant()->create();
    Store::factory()->create(['user_id' => $merchant->id]);

    $otherMerchant = User::factory()->merchant()->create();
    $otherStore = Store::factory()->create(['user_id' => $otherMerchant->id]);
    $otherProduct = Product::factory()->create(['store_id' => $otherStore->id]);

    $this->actingAs($merchant)
        ->get("/merchant/products/{$otherProduct->id}")
        ->assertForbidden();
});

it('allows merchant to edit their own product', function () {
    $merchant = User::factory()->merchant()->create();
    $store = Store::factory()->create(['user_id' => $merchant->id]);
    $product = Product::factory()->create(['store_id' => $store->id]);
    Category::factory()->count(3)->create();

    $this->actingAs($merchant)
        ->get("/merchant/products/{$product->id}/edit")
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->component('Merchant/Products/Edit')
            ->has('product')
            ->has('categories', 4)
        );
});

it('allows merchant to update their own product', function () {
    $merchant = User::factory()->merchant()->create();
    $store = Store::factory()->create(['user_id' => $merchant->id]);
    $product = Product::factory()->create(['store_id' => $store->id, 'name' => 'Original Name']);
    $newCategory = Category::factory()->create();

    $updateData = [
        'name' => 'Updated Product Name',
        'description' => 'Updated description for the product.',
        'category_id' => $newCategory->id,
        'price' => 39.99,
        'quantity' => 50,
        'digital_product' => false,
    ];

    $this->actingAs($merchant)
        ->put("/merchant/products/{$product->id}", $updateData)
        ->assertRedirect("/merchant/products/{$product->id}")
        ->assertSessionHas('success', 'Product updated successfully.');

    $this->assertDatabaseHas('products', [
        'id' => $product->id,
        'name' => 'Updated Product Name',
        'slug' => 'updated-product-name',
        'price' => 3999,
    ]);
});

it('allows merchant to publish their product', function () {
    $merchant = User::factory()->merchant()->create();
    $store = Store::factory()->create(['user_id' => $merchant->id]);
    $product = Product::factory()->create(['store_id' => $store->id, 'status' => 'draft']);

    $this->actingAs($merchant)
        ->post("/merchant/products/{$product->id}/publish")
        ->assertRedirect()
        ->assertSessionHas('success', 'Product published successfully.');

    $this->assertDatabaseHas('products', [
        'id' => $product->id,
        'status' => 'published',
    ]);
});

it('allows merchant to unpublish their product', function () {
    $merchant = User::factory()->merchant()->create();
    $store = Store::factory()->create(['user_id' => $merchant->id]);
    $product = Product::factory()->create(['store_id' => $store->id, 'status' => 'published']);

    $this->actingAs($merchant)
        ->post("/merchant/products/{$product->id}/unpublish")
        ->assertRedirect()
        ->assertSessionHas('success', 'Product unpublished successfully.');

    $this->assertDatabaseHas('products', [
        'id' => $product->id,
        'status' => 'draft',
    ]);
});

it('allows merchant to delete their own product', function () {
    $merchant = User::factory()->merchant()->create();
    $store = Store::factory()->create(['user_id' => $merchant->id]);
    $product = Product::factory()->create(['store_id' => $store->id]);

    $this->actingAs($merchant)
        ->delete("/merchant/products/{$product->id}")
        ->assertRedirect('/merchant/products')
        ->assertSessionHas('success', 'Product deleted successfully.');

    $this->assertDatabaseMissing('products', [
        'id' => $product->id,
    ]);
});

it('prevents non-merchants from accessing product management', function () {
    $buyer = User::factory()->buyer()->create();
    $admin = User::factory()->admin()->create();
    $product = Product::factory()->create();

    $this->actingAs($buyer)
        ->get('/merchant/products')
        ->assertForbidden();

    $this->actingAs($admin)
        ->get('/merchant/products')
        ->assertForbidden();
});
