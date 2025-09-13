<?php

use App\Models\Cart;
use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use App\Models\Store;
use App\Models\User;

it('allows authenticated users to view their cart', function () {
    $buyer = User::factory()->buyer()->create();

    $this->actingAs($buyer)
        ->get('/cart')
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->component('Cart/Index')
            ->has('cartItems')
            ->has('cartTotal')
            ->has('cartCount')
        );
});

it('allows adding products to cart', function () {
    $buyer = User::factory()->buyer()->create();
    $category = Category::factory()->create();
    $store = Store::factory()->create(['status' => 'approved']);
    $product = Product::factory()->create([
        'store_id' => $store->id,
        'category_id' => $category->id,
        'status' => 'published',
        'quantity' => 10,
    ]);

    $this->actingAs($buyer)
        ->post("/cart/add/{$product->id}", ['quantity' => 2])
        ->assertRedirect()
        ->assertSessionHas('success', 'Product added to cart!');

    $this->assertDatabaseHas('carts', [
        'user_id' => $buyer->id,
        'product_id' => $product->id,
        'quantity' => 2,
    ]);
});

it('prevents adding out of stock products to cart', function () {
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

    $this->actingAs($buyer)
        ->post("/cart/add/{$product->id}", ['quantity' => 5])
        ->assertRedirect()
        ->assertSessionHas('error', 'Not enough stock available.');

    $this->assertDatabaseMissing('carts', [
        'user_id' => $buyer->id,
        'product_id' => $product->id,
    ]);
});

it('prevents adding unpublished products to cart', function () {
    $buyer = User::factory()->buyer()->create();
    $category = Category::factory()->create();
    $store = Store::factory()->create(['status' => 'approved']);
    $product = Product::factory()->create([
        'store_id' => $store->id,
        'category_id' => $category->id,
        'status' => 'draft',
    ]);

    $this->actingAs($buyer)
        ->post("/cart/add/{$product->id}", ['quantity' => 1])
        ->assertRedirect()
        ->assertSessionHas('error', 'Product is no longer available.');
});

it('updates existing cart item quantity when adding same product', function () {
    $buyer = User::factory()->buyer()->create();
    $category = Category::factory()->create();
    $store = Store::factory()->create(['status' => 'approved']);
    $product = Product::factory()->create([
        'store_id' => $store->id,
        'category_id' => $category->id,
        'status' => 'published',
        'quantity' => 10,
    ]);

    Cart::factory()->create([
        'user_id' => $buyer->id,
        'product_id' => $product->id,
        'quantity' => 2,
    ]);

    $this->actingAs($buyer)
        ->post("/cart/add/{$product->id}", ['quantity' => 3])
        ->assertRedirect()
        ->assertSessionHas('success', 'Product added to cart!');

    $this->assertDatabaseHas('carts', [
        'user_id' => $buyer->id,
        'product_id' => $product->id,
        'quantity' => 5,
    ]);
});

it('allows updating cart item quantity', function () {
    $buyer = User::factory()->buyer()->create();
    $category = Category::factory()->create();
    $store = Store::factory()->create(['status' => 'approved']);
    $product = Product::factory()->create([
        'store_id' => $store->id,
        'category_id' => $category->id,
        'quantity' => 10,
    ]);

    $cartItem = Cart::factory()->create([
        'user_id' => $buyer->id,
        'product_id' => $product->id,
        'quantity' => 2,
    ]);

    $this->actingAs($buyer)
        ->put("/cart/{$cartItem->id}", ['quantity' => 4])
        ->assertRedirect()
        ->assertSessionHas('success', 'Cart updated!');

    $this->assertDatabaseHas('carts', [
        'id' => $cartItem->id,
        'quantity' => 4,
    ]);
});

it('allows removing items from cart', function () {
    $buyer = User::factory()->buyer()->create();
    $category = Category::factory()->create();
    $store = Store::factory()->create(['status' => 'approved']);
    $product = Product::factory()->create([
        'store_id' => $store->id,
        'category_id' => $category->id,
    ]);

    $cartItem = Cart::factory()->create([
        'user_id' => $buyer->id,
        'product_id' => $product->id,
        'quantity' => 2,
    ]);

    $this->actingAs($buyer)
        ->delete("/cart/{$cartItem->id}")
        ->assertRedirect()
        ->assertSessionHas('success', 'Item removed from cart!');

    $this->assertDatabaseMissing('carts', [
        'id' => $cartItem->id,
    ]);
});

it('prevents users from modifying other users cart items', function () {
    $buyer = User::factory()->buyer()->create();
    $otherBuyer = User::factory()->buyer()->create();

    $category = Category::factory()->create();
    $store = Store::factory()->create(['status' => 'approved']);
    $product = Product::factory()->create([
        'store_id' => $store->id,
        'category_id' => $category->id,
    ]);

    $cartItem = Cart::factory()->create([
        'user_id' => $otherBuyer->id,
        'product_id' => $product->id,
        'quantity' => 2,
    ]);

    $this->actingAs($buyer)
        ->delete("/cart/{$cartItem->id}")
        ->assertForbidden();
});

it('allows clearing entire cart', function () {
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
        ]);
    }

    $this->actingAs($buyer)
        ->delete('/cart')
        ->assertRedirect()
        ->assertSessionHas('success', 'Cart cleared!');

    $this->assertDatabaseMissing('carts', [
        'user_id' => $buyer->id,
    ]);
});

it('shows checkout page when cart has items', function () {
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
        'quantity' => 1,
    ]);

    $this->actingAs($buyer)
        ->get('/orders/checkout')
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->component('Checkout/Index')
            ->has('cartItems')
            ->has('totalAmount')
        );
});

it('redirects to cart when checkout with empty cart', function () {
    $buyer = User::factory()->buyer()->create();

    $this->actingAs($buyer)
        ->get('/orders/checkout')
        ->assertRedirect('/cart')
        ->assertSessionHas('error', 'Your cart is empty.');
});

it('allows placing an order', function () {
    $buyer = User::factory()->buyer()->create();
    $category = Category::factory()->create();
    $store = Store::factory()->create(['status' => 'approved']);
    $product = Product::factory()->create([
        'store_id' => $store->id,
        'category_id' => $category->id,
        'status' => 'published',
        'quantity' => 10,
        'price' => 2000, // $20.00
    ]);

    Cart::factory()->create([
        'user_id' => $buyer->id,
        'product_id' => $product->id,
        'quantity' => 2,
    ]);

    $orderData = [
        'billing_name' => 'John Doe',
        'billing_email' => 'john@example.com',
        'billing_address' => '123 Main St',
        'billing_city' => 'New York',
        'billing_postal_code' => '10001',
        'billing_country' => 'United States',
    ];

    $response = $this->actingAs($buyer)
        ->post('/orders/checkout', $orderData);

    $response->assertRedirect();

    // Verify order was created
    $order = Order::where('user_id', $buyer->id)->first();

    expect($order)->not->toBeNull()
        ->and($order->total_amount)->toBe('4000.00') // Total in cents, cast as decimal string
        ->and($order->billing_info['name'])->toBe('John Doe')
        ->and($order->status)->toBe('pending');

    // Verify order item was created
    $this->assertDatabaseHas('order_items', [
        'product_id' => $product->id,
        'store_id' => $store->id,
        'quantity' => 2,
        'product_price' => 2000,
        'total_price' => 4000,
    ]);

    // Verify stock was updated for physical product
    $this->assertDatabaseHas('products', [
        'id' => $product->id,
        'quantity' => 8, // 10 - 2
    ]);
});

it('does not update stock for digital products', function () {
    $buyer = User::factory()->buyer()->create();
    $category = Category::factory()->create();
    $store = Store::factory()->create(['status' => 'approved']);
    $product = Product::factory()->create([
        'store_id' => $store->id,
        'category_id' => $category->id,
        'status' => 'published',
        'digital_product' => true,
        'quantity' => 0, // Digital products don't need stock
        'price' => 1500,
    ]);

    Cart::factory()->create([
        'user_id' => $buyer->id,
        'product_id' => $product->id,
        'quantity' => 1,
    ]);

    $orderData = [
        'billing_name' => 'Jane Doe',
        'billing_email' => 'jane@example.com',
        'billing_address' => '456 Oak St',
        'billing_city' => 'Los Angeles',
        'billing_postal_code' => '90210',
        'billing_country' => 'United States',
    ];

    $this->actingAs($buyer)
        ->post('/orders/checkout', $orderData)
        ->assertRedirect();

    // Verify digital product quantity unchanged
    $this->assertDatabaseHas('products', [
        'id' => $product->id,
        'quantity' => 0, // Should remain 0
    ]);
});

it('allows buyers to view their orders', function () {
    $buyer = User::factory()->buyer()->create();

    Order::factory()->count(3)->create(['user_id' => $buyer->id]);

    $this->actingAs($buyer)
        ->get('/buyer/orders')
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->component('Orders/Index')
            ->has('orders')
            ->has('orders.data', 3)
        );
});

it('allows buyers to cancel pending orders', function () {
    $buyer = User::factory()->buyer()->create();
    $category = Category::factory()->create();
    $store = Store::factory()->create(['status' => 'approved']);
    $product = Product::factory()->create([
        'store_id' => $store->id,
        'category_id' => $category->id,
        'quantity' => 5,
        'digital_product' => false,
    ]);

    $order = Order::factory()->create([
        'user_id' => $buyer->id,
        'status' => 'pending',
    ]);

    $orderItem = $order->orderItems()->create([
        'product_id' => $product->id,
        'store_id' => $store->id,
        'product_name' => $product->name,
        'product_price' => $product->price,
        'quantity' => 2,
        'total_price' => $product->price * 2,
    ]);

    $this->actingAs($buyer)
        ->patch("/orders/{$order->id}/cancel")
        ->assertRedirect()
        ->assertSessionHas('success', 'Order cancelled successfully.');

    // Verify order status updated
    $this->assertDatabaseHas('orders', [
        'id' => $order->id,
        'status' => 'cancelled',
    ]);

    // Verify stock was restored
    $this->assertDatabaseHas('products', [
        'id' => $product->id,
        'quantity' => 7, // 5 + 2 restored
    ]);
});

it('prevents cancelling non-pending orders', function () {
    $buyer = User::factory()->buyer()->create();
    $order = Order::factory()->create([
        'user_id' => $buyer->id,
        'status' => 'completed',
    ]);

    $this->actingAs($buyer)
        ->patch("/orders/{$order->id}/cancel")
        ->assertRedirect()
        ->assertSessionHas('error', 'Only pending orders can be cancelled.');
});
