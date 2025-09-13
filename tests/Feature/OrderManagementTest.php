<?php

use App\Models\Cart;
use App\Models\Category;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Store;
use App\Models\User;
use Illuminate\Support\Facades\Http;

it('prevents guests from accessing cart routes', function () {
    $this->get('/cart')->assertRedirect('/login');
    $this->get('/orders/checkout')->assertRedirect('/login');
    $this->get('/orders')->assertRedirect('/login');
});

it('validates billing information during checkout', function () {
    $buyer = User::factory()->buyer()->create();
    $category = Category::factory()->create();
    $store = Store::factory()->create(['status' => 'approved']);
    $product = Product::factory()->create([
        'store_id' => $store->id,
        'category_id' => $category->id,
        'status' => 'published',
    ]);

    Cart::factory()->create([
        'user_id' => $buyer->id,
        'product_id' => $product->id,
    ]);

    $this->actingAs($buyer)
        ->post('/orders/checkout', [])
        ->assertSessionHasErrors([
            'billing_name',
            'billing_email',
            'billing_address',
            'billing_city',
            'billing_postal_code',
            'billing_country',
        ]);
});

it('generates unique order numbers', function () {
    // Mock the MagpieService HTTP calls for both checkout attempts
    Http::fake([
        config('services.magpie.checkout_url') => Http::response([
            'id' => 'cs_test123',
            // No checkout_url key - this causes the controller to use fallback redirect
        ], 200),
    ]);

    $buyer = User::factory()->buyer()->create();
    $category = Category::factory()->create();
    $store = Store::factory()->create(['status' => 'approved']);

    $product1 = Product::factory()->create([
        'store_id' => $store->id,
        'category_id' => $category->id,
        'status' => 'published',
    ]);

    $product2 = Product::factory()->create([
        'store_id' => $store->id,
        'category_id' => $category->id,
        'status' => 'published',
    ]);

    $orderData = [
        'billing_name' => 'Test User',
        'billing_email' => 'test@example.com',
        'billing_address' => '123 Test St',
        'billing_city' => 'Test City',
        'billing_postal_code' => '12345',
        'billing_country' => 'Test Country',
    ];

    // Create first order
    Cart::factory()->create([
        'user_id' => $buyer->id,
        'product_id' => $product1->id,
    ]);

    $this->actingAs($buyer)
        ->post(route('orders.store'), $orderData)
        ->assertRedirect()
        ->assertSessionHas('success');

    // Create second order
    Cart::factory()->create([
        'user_id' => $buyer->id,
        'product_id' => $product2->id,
    ]);

    $this->actingAs($buyer)
        ->post(route('orders.store'), $orderData)
        ->assertRedirect()
        ->assertSessionHas('success');

    $orders = Order::where('user_id', $buyer->id)->get();
    expect($orders)->toHaveCount(2);
    expect($orders[0]->order_number)->not->toBe($orders[1]->order_number);
});

it('prevents checkout with products that went out of stock', function () {
    $buyer = User::factory()->buyer()->create();
    $category = Category::factory()->create();
    $store = Store::factory()->create(['status' => 'approved']);
    $product = Product::factory()->create([
        'store_id' => $store->id,
        'category_id' => $category->id,
        'status' => 'published',
        'quantity' => 1,
        'digital_product' => false,
    ]);

    Cart::factory()->create([
        'user_id' => $buyer->id,
        'product_id' => $product->id,
        'quantity' => 2, // More than available
    ]);

    $orderData = [
        'billing_name' => 'Test User',
        'billing_email' => 'test@example.com',
        'billing_address' => '123 Test St',
        'billing_city' => 'Test City',
        'billing_postal_code' => '12345',
        'billing_country' => 'Test Country',
    ];

    $this->actingAs($buyer)
        ->post('/orders/checkout', $orderData)
        ->assertRedirect()
        ->assertSessionHas('error');

    $this->assertDatabaseMissing('orders', [
        'user_id' => $buyer->id,
    ]);
});

it('prevents checkout when product becomes unpublished', function () {
    $buyer = User::factory()->buyer()->create();
    $category = Category::factory()->create();
    $store = Store::factory()->create(['status' => 'approved']);
    $product = Product::factory()->create([
        'store_id' => $store->id,
        'category_id' => $category->id,
        'status' => 'published',
    ]);

    Cart::factory()->create([
        'user_id' => $buyer->id,
        'product_id' => $product->id,
    ]);

    // Product becomes unpublished after adding to cart
    $product->update(['status' => 'draft']);

    $orderData = [
        'billing_name' => 'Test User',
        'billing_email' => 'test@example.com',
        'billing_address' => '123 Test St',
        'billing_city' => 'Test City',
        'billing_postal_code' => '12345',
        'billing_country' => 'Test Country',
    ];

    $this->actingAs($buyer)
        ->post('/orders/checkout', $orderData)
        ->assertRedirect()
        ->assertSessionHas('error', "Product '{$product->name}' is no longer available.");
});

it('handles mixed cart with physical and digital products', function () {
    // Mock the MagpieService HTTP calls to return a response without checkout_url
    // This will cause the controller to use the fallback path with success message
    Http::fake([
        config('services.magpie.checkout_url') => Http::response([
            'id' => 'cs_test123',
            // No checkout_url key - this causes the controller to use fallback redirect
        ], 200),
    ]);

    $buyer = User::factory()->buyer()->create();
    $category = Category::factory()->create();
    $store = Store::factory()->create(['status' => 'approved']);

    $physicalProduct = Product::factory()->create([
        'store_id' => $store->id,
        'category_id' => $category->id,
        'status' => 'published',
        'quantity' => 5,
        'digital_product' => false,
        'price' => 1000,
    ]);

    $digitalProduct = Product::factory()->create([
        'store_id' => $store->id,
        'category_id' => $category->id,
        'status' => 'published',
        'digital_product' => true,
        'quantity' => 0,
        'price' => 2000,
    ]);

    Cart::factory()->create([
        'user_id' => $buyer->id,
        'product_id' => $physicalProduct->id,
        'quantity' => 2,
    ]);

    Cart::factory()->create([
        'user_id' => $buyer->id,
        'product_id' => $digitalProduct->id,
        'quantity' => 1,
    ]);

    $orderData = [
        'billing_name' => 'Test User',
        'billing_email' => 'test@example.com',
        'billing_address' => '123 Test St',
        'billing_city' => 'Test City',
        'billing_postal_code' => '12345',
        'billing_country' => 'Test Country',
    ];

    $this->actingAs($buyer)
        ->post('/orders/checkout', $orderData)
        ->assertRedirect()
        ->assertSessionHas('success');

    // Verify physical product stock was reduced
    $this->assertDatabaseHas('products', [
        'id' => $physicalProduct->id,
        'quantity' => 3, // 5 - 2
    ]);

    // Verify digital product stock unchanged
    $this->assertDatabaseHas('products', [
        'id' => $digitalProduct->id,
        'quantity' => 0, // Should remain 0
    ]);

    // Verify order total is correct
    $this->assertDatabaseHas('orders', [
        'user_id' => $buyer->id,
        'total_amount' => 4000, // (2 * 1000) + (1 * 2000)
    ]);
});

it('creates separate order items for products from different stores', function () {
    // Mock the MagpieService HTTP calls
    Http::fake([
        config('services.magpie.checkout_url') => Http::response([
            'id' => 'cs_test123',
            // No checkout_url key - this causes the controller to use fallback redirect
        ], 200),
    ]);

    $buyer = User::factory()->buyer()->create();
    $category = Category::factory()->create();

    $store1 = Store::factory()->create(['status' => 'approved']);
    $store2 = Store::factory()->create(['status' => 'approved']);

    $product1 = Product::factory()->create([
        'store_id' => $store1->id,
        'category_id' => $category->id,
        'status' => 'published',
    ]);

    $product2 = Product::factory()->create([
        'store_id' => $store2->id,
        'category_id' => $category->id,
        'status' => 'published',
    ]);

    Cart::factory()->create([
        'user_id' => $buyer->id,
        'product_id' => $product1->id,
    ]);

    Cart::factory()->create([
        'user_id' => $buyer->id,
        'product_id' => $product2->id,
    ]);

    $orderData = [
        'billing_name' => 'Test User',
        'billing_email' => 'test@example.com',
        'billing_address' => '123 Test St',
        'billing_city' => 'Test City',
        'billing_postal_code' => '12345',
        'billing_country' => 'Test Country',
    ];

    $response = $this->actingAs($buyer)
        ->post('/orders/checkout', $orderData);

    $response->assertRedirect();

    $order = Order::where('user_id', $buyer->id)->first();

    // Make sure order was created
    expect($order)->not->toBeNull();

    // Verify order items were created for both stores
    $this->assertDatabaseHas('order_items', [
        'order_id' => $order->id,
        'product_id' => $product1->id,
        'store_id' => $store1->id,
    ]);

    $this->assertDatabaseHas('order_items', [
        'order_id' => $order->id,
        'product_id' => $product2->id,
        'store_id' => $store2->id,
    ]);
});

it('prevents buyers from viewing other buyers orders', function () {
    $buyer1 = User::factory()->buyer()->create();
    $buyer2 = User::factory()->buyer()->create();

    $order = Order::factory()->create(['user_id' => $buyer2->id]);

    $this->actingAs($buyer1)
        ->get("/orders/{$order->id}")
        ->assertForbidden();
});

it('allows merchants to view orders containing their products', function () {
    $buyer = User::factory()->buyer()->create();
    $merchant = User::factory()->merchant()->create();
    $store = Store::factory()->create(['user_id' => $merchant->id]);
    $category = Category::factory()->create();
    $product = Product::factory()->create([
        'store_id' => $store->id,
        'category_id' => $category->id,
    ]);

    $order = Order::factory()->create(['user_id' => $buyer->id]);
    OrderItem::factory()->create([
        'order_id' => $order->id,
        'product_id' => $product->id,
        'store_id' => $store->id,
    ]);

    $this->actingAs($merchant)
        ->get("/orders/{$order->id}")
        ->assertSuccessful();
});

it('prevents merchants from viewing orders without their products', function () {
    $buyer = User::factory()->buyer()->create();
    $merchant = User::factory()->merchant()->create();
    $otherMerchant = User::factory()->merchant()->create();

    $store = Store::factory()->create(['user_id' => $merchant->id]);
    $otherStore = Store::factory()->create(['user_id' => $otherMerchant->id]);

    $category = Category::factory()->create();
    $product = Product::factory()->create([
        'store_id' => $otherStore->id,
        'category_id' => $category->id,
    ]);

    $order = Order::factory()->create(['user_id' => $buyer->id]);
    OrderItem::factory()->create([
        'order_id' => $order->id,
        'product_id' => $product->id,
        'store_id' => $otherStore->id,
    ]);

    $this->actingAs($merchant)
        ->get("/orders/{$order->id}")
        ->assertForbidden();
});

it('calculates cart totals correctly', function () {
    $buyer = User::factory()->buyer()->create();
    $category = Category::factory()->create();
    $store = Store::factory()->create(['status' => 'approved']);

    $product1 = Product::factory()->create([
        'store_id' => $store->id,
        'category_id' => $category->id,
        'price' => 1500, // $15.00
    ]);

    $product2 = Product::factory()->create([
        'store_id' => $store->id,
        'category_id' => $category->id,
        'price' => 2500, // $25.00
    ]);

    Cart::factory()->create([
        'user_id' => $buyer->id,
        'product_id' => $product1->id,
        'quantity' => 2, // 2 * $15.00 = $30.00
    ]);

    Cart::factory()->create([
        'user_id' => $buyer->id,
        'product_id' => $product2->id,
        'quantity' => 1, // 1 * $25.00 = $25.00
    ]);

    $this->actingAs($buyer)
        ->get('/cart')
        ->assertInertia(fn ($page) => $page
            ->where('cartTotal', 5500) // $55.00 in cents
            ->where('cartCount', 3) // 2 + 1
            ->where('formattedTotal', '$55.00')
        );
});

it('validates cart quantity limits against product stock', function () {
    $buyer = User::factory()->buyer()->create();
    $category = Category::factory()->create();
    $store = Store::factory()->create(['status' => 'approved']);
    $product = Product::factory()->create([
        'store_id' => $store->id,
        'category_id' => $category->id,
        'status' => 'published',
        'quantity' => 3,
        'digital_product' => false,
    ]);

    $this->actingAs($buyer)
        ->post("/cart/add/{$product->id}", ['quantity' => 5])
        ->assertRedirect()
        ->assertSessionHas('error', 'Not enough stock available.');
});

it('allows unlimited quantities for digital products', function () {
    $buyer = User::factory()->buyer()->create();
    $category = Category::factory()->create();
    $store = Store::factory()->create(['status' => 'approved']);
    $product = Product::factory()->create([
        'store_id' => $store->id,
        'category_id' => $category->id,
        'status' => 'published',
        'digital_product' => true,
        'quantity' => 0,
    ]);

    $this->actingAs($buyer)
        ->post("/cart/add/{$product->id}", ['quantity' => 100])
        ->assertRedirect()
        ->assertSessionHas('success', 'Product added to cart!');

    $this->assertDatabaseHas('carts', [
        'user_id' => $buyer->id,
        'product_id' => $product->id,
        'quantity' => 100,
    ]);
});

it('restores stock correctly when cancelling orders with multiple items', function () {
    $buyer = User::factory()->buyer()->create();
    $category = Category::factory()->create();
    $store = Store::factory()->create(['status' => 'approved']);

    $product1 = Product::factory()->create([
        'store_id' => $store->id,
        'category_id' => $category->id,
        'quantity' => 10,
        'digital_product' => false,
    ]);

    $product2 = Product::factory()->create([
        'store_id' => $store->id,
        'category_id' => $category->id,
        'quantity' => 5,
        'digital_product' => false,
    ]);

    $order = Order::factory()->create([
        'user_id' => $buyer->id,
        'status' => 'pending',
    ]);

    OrderItem::factory()->create([
        'order_id' => $order->id,
        'product_id' => $product1->id,
        'store_id' => $store->id,
        'quantity' => 3,
    ]);

    OrderItem::factory()->create([
        'order_id' => $order->id,
        'product_id' => $product2->id,
        'store_id' => $store->id,
        'quantity' => 2,
    ]);

    $this->actingAs($buyer)
        ->patch("/orders/{$order->id}/cancel")
        ->assertRedirect()
        ->assertSessionHas('success', 'Order cancelled successfully.');

    // Verify both products had stock restored
    $this->assertDatabaseHas('products', [
        'id' => $product1->id,
        'quantity' => 13, // 10 + 3
    ]);

    $this->assertDatabaseHas('products', [
        'id' => $product2->id,
        'quantity' => 7, // 5 + 2
    ]);
});

it('does not restore stock for digital products when cancelling', function () {
    $buyer = User::factory()->buyer()->create();
    $category = Category::factory()->create();
    $store = Store::factory()->create(['status' => 'approved']);

    $digitalProduct = Product::factory()->create([
        'store_id' => $store->id,
        'category_id' => $category->id,
        'digital_product' => true,
        'quantity' => 0,
    ]);

    $order = Order::factory()->create([
        'user_id' => $buyer->id,
        'status' => 'pending',
    ]);

    OrderItem::factory()->create([
        'order_id' => $order->id,
        'product_id' => $digitalProduct->id,
        'store_id' => $store->id,
        'quantity' => 5,
    ]);

    $this->actingAs($buyer)
        ->patch("/orders/{$order->id}/cancel")
        ->assertRedirect()
        ->assertSessionHas('success', 'Order cancelled successfully.');

    // Verify digital product quantity unchanged
    $this->assertDatabaseHas('products', [
        'id' => $digitalProduct->id,
        'quantity' => 0, // Should remain 0
    ]);
});

it('returns cart count via API endpoint', function () {
    $buyer = User::factory()->buyer()->create();
    $category = Category::factory()->create();
    $store = Store::factory()->create(['status' => 'approved']);

    // Create 3 different products for the cart items
    $products = Product::factory()->count(3)->create([
        'store_id' => $store->id,
        'category_id' => $category->id,
    ]);

    foreach ($products as $product) {
        Cart::factory()->create([
            'user_id' => $buyer->id,
            'product_id' => $product->id,
            'quantity' => 2,
        ]);
    }

    $this->actingAs($buyer)
        ->get('/cart/count')
        ->assertSuccessful()
        ->assertJson(['count' => 6]); // 3 items * 2 quantity each
});
