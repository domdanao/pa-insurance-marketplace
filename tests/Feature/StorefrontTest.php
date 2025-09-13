<?php

use App\Models\Category;
use App\Models\Product;
use App\Models\Store;
use App\Models\User;

it('shows the storefront homepage with published products', function () {
    $category = Category::factory()->create();
    $store = Store::factory()->create(['status' => 'approved']);

    Product::factory()->count(3)->create([
        'store_id' => $store->id,
        'category_id' => $category->id,
        'status' => 'published',
    ]);

    Product::factory()->count(2)->create([
        'store_id' => $store->id,
        'category_id' => $category->id,
        'status' => 'draft', // Should not appear
    ]);

    $this->get('/')
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->component('Storefront/Products/Index')
            ->has('products')
            ->has('products.data', 3)
            ->has('categories')
        );
});

it('allows searching for products', function () {
    $category = Category::factory()->create();
    $store = Store::factory()->create(['status' => 'approved']);

    Product::factory()->create([
        'store_id' => $store->id,
        'category_id' => $category->id,
        'name' => 'iPhone 15 Pro',
        'status' => 'published',
    ]);

    Product::factory()->create([
        'store_id' => $store->id,
        'category_id' => $category->id,
        'name' => 'Samsung Galaxy S24',
        'status' => 'published',
    ]);

    $this->get('/?search=iPhone')
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->component('Storefront/Products/Index')
            ->has('products.data', 1)
            ->where('filters.search', 'iPhone')
        );
});

it('filters products by category', function () {
    $electronicsCategory = Category::factory()->create(['slug' => 'electronics']);
    $booksCategory = Category::factory()->create(['slug' => 'books']);
    $store = Store::factory()->create(['status' => 'approved']);

    Product::factory()->count(2)->create([
        'store_id' => $store->id,
        'category_id' => $electronicsCategory->id,
        'status' => 'published',
    ]);

    Product::factory()->create([
        'store_id' => $store->id,
        'category_id' => $booksCategory->id,
        'status' => 'published',
    ]);

    $this->get('/?category=electronics')
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->component('Storefront/Products/Index')
            ->has('products.data', 2)
            ->where('filters.category', 'electronics')
        );
});

it('filters products by price range', function () {
    $category = Category::factory()->create();
    $store = Store::factory()->create(['status' => 'approved']);

    // Create product with price below filter ($50)
    Product::create([
        'store_id' => $store->id,
        'category_id' => $category->id,
        'name' => 'Cheap Product',
        'slug' => 'cheap-product',
        'description' => 'A cheap product',
        'price' => 50, // $50 (model converts to 5000 cents)
        'quantity' => 10,
        'status' => 'published',
    ]);

    // Create product with price above filter ($150)
    Product::create([
        'store_id' => $store->id,
        'category_id' => $category->id,
        'name' => 'Expensive Product',
        'slug' => 'expensive-product',
        'description' => 'An expensive product',
        'price' => 150, // $150 (model converts to 15000 cents)
        'quantity' => 10,
        'status' => 'published',
    ]);

    // Only the $150 product should be returned for price_min=100
    $this->get('/?price_min=100')
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->component('Storefront/Products/Index')
            ->has('products.data', 1)
        );
});

it('sorts products correctly', function () {
    $category = Category::factory()->create();
    $store = Store::factory()->create(['status' => 'approved']);

    $cheapProduct = Product::factory()->create([
        'store_id' => $store->id,
        'category_id' => $category->id,
        'name' => 'Cheap Product',
        'price' => 1000,
        'status' => 'published',
    ]);

    $expensiveProduct = Product::factory()->create([
        'store_id' => $store->id,
        'category_id' => $category->id,
        'name' => 'Expensive Product',
        'price' => 5000,
        'status' => 'published',
    ]);

    $this->get('/?sort=price_asc')
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->component('Storefront/Products/Index')
            ->has('products.data', 2)
            ->where('products.data.0.name', 'Cheap Product')
        );
});

it('shows individual product page for published products', function () {
    $category = Category::factory()->create();
    $store = Store::factory()->create(['status' => 'approved']);
    $product = Product::factory()->create([
        'store_id' => $store->id,
        'category_id' => $category->id,
        'status' => 'published',
        'slug' => 'test-product',
    ]);

    $this->get("/products/{$product->slug}")
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->component('Storefront/Products/Show')
            ->has('product')
            ->has('relatedProducts')
        );
});

it('shows 404 for draft products', function () {
    $category = Category::factory()->create();
    $store = Store::factory()->create(['status' => 'approved']);
    $product = Product::factory()->create([
        'store_id' => $store->id,
        'category_id' => $category->id,
        'status' => 'draft',
        'slug' => 'draft-product',
    ]);

    $this->get("/products/{$product->slug}")
        ->assertNotFound();
});

it('shows related products on product page', function () {
    $category = Category::factory()->create();
    $store = Store::factory()->create(['status' => 'approved']);

    $product = Product::factory()->create([
        'store_id' => $store->id,
        'category_id' => $category->id,
        'status' => 'published',
        'slug' => 'main-product',
    ]);

    Product::factory()->count(3)->create([
        'store_id' => $store->id,
        'category_id' => $category->id,
        'status' => 'published',
    ]);

    $this->get("/products/{$product->slug}")
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->component('Storefront/Products/Show')
            ->has('relatedProducts', 3)
        );
});

it('shows stores directory', function () {
    Store::factory()->count(3)->create(['status' => 'approved']);
    Store::factory()->create(['status' => 'pending']); // Should not appear

    $this->get('/stores')
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->component('Storefront/Stores/Index')
            ->has('stores')
            ->has('stores.data', 3)
            ->has('categories')
        );
});

it('shows individual store page with products', function () {
    $category = Category::factory()->create();
    $store = Store::factory()->create([
        'status' => 'approved',
        'slug' => 'test-store',
    ]);

    Product::factory()->count(2)->create([
        'store_id' => $store->id,
        'category_id' => $category->id,
        'status' => 'published',
    ]);

    $this->get("/stores/{$store->slug}")
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->component('Storefront/Stores/Show')
            ->has('store')
            ->has('products')
            ->has('products.data', 2)
        );
});

it('shows 404 for unapproved stores', function () {
    $store = Store::factory()->create([
        'status' => 'pending',
        'slug' => 'pending-store',
    ]);

    $this->get("/stores/{$store->slug}")
        ->assertNotFound();
});

it('allows searching stores', function () {
    Store::factory()->create([
        'name' => 'Electronics Paradise',
        'status' => 'approved',
    ]);

    Store::factory()->create([
        'name' => 'Book Haven',
        'status' => 'approved',
    ]);

    $this->get('/stores?search=Electronics')
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->component('Storefront/Stores/Index')
            ->has('stores.data', 1)
            ->where('filters.search', 'Electronics')
        );
});

it('shows buyer dashboard with order stats and featured products', function () {
    $buyer = User::factory()->buyer()->create();

    $category = Category::factory()->create();
    $store = Store::factory()->create(['status' => 'approved']);
    Product::factory()->count(6)->create([
        'store_id' => $store->id,
        'category_id' => $category->id,
        'status' => 'published',
    ]);

    $this->actingAs($buyer)
        ->get('/buyer/dashboard')
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->component('Buyer/Dashboard')
            ->has('user')
            ->has('stats')
            ->has('stats.total_orders')
            ->has('stats.total_spent')
            ->has('recent_orders')
            ->has('featured_products', 6)
        );
});

it('prevents non-buyers from accessing buyer dashboard', function () {
    $merchant = User::factory()->merchant()->create();
    $admin = User::factory()->admin()->create();

    $this->actingAs($merchant)
        ->get('/buyer/dashboard')
        ->assertForbidden();

    $this->actingAs($admin)
        ->get('/buyer/dashboard')
        ->assertForbidden();
});
