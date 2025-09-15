<?php

use App\Models\Category;
use App\Models\Product;
use App\Models\Store;
use App\Models\User;
use App\Services\CartTransferService;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Session;

beforeEach(function () {
    // Create test data
    $this->category = Category::factory()->create();
    $this->store = Store::factory()->create();
    $this->product = Product::factory()->for($this->store)->for($this->category)->create([
        'quantity' => 10,
        'digital_product' => false,
    ]);
});

it('allows anonymous users to add items to session cart', function () {
    // Add item to session cart
    $response = $this->post("/cart/add/{$this->product->id}", [
        'quantity' => 2,
    ]);

    // Should redirect to login
    $response->assertRedirect(route('login'));
    $response->assertSessionHas('info', 'Please log in to complete your purchase. Your cart will be saved!');

    // Check that item was added to session
    $pendingItems = Session::get('pending_cart_items', []);
    expect($pendingItems)->toHaveCount(1);
    expect($pendingItems[0]['product_id'])->toBe($this->product->id);
    expect($pendingItems[0]['quantity'])->toBe(2);
});

it('transfers session cart to user cart on passwordless login', function () {
    // Add item to session cart first
    CartTransferService::addToSessionCart($this->product->id, 3);

    // Verify item is in session
    expect(CartTransferService::getPendingCartCount())->toBe(3);

    // Set up OTP for login
    $email = 'test@example.com';
    $otp = '123456';
    Cache::put("login_otp_{$email}", $otp, now()->addMinutes(10));

    // Attempt passwordless login
    $response = $this->post(route('login'), [
        'email' => $email,
        'otp' => $otp,
        'passwordless_login' => true,
    ]);

    // Should be redirected to dashboard (default for authenticated users)
    $response->assertRedirect('/dashboard');

    // Check that user was created and logged in
    $user = User::where('email', $email)->first();
    expect($user)->not->toBeNull();
    expect($user->role)->toBe('buyer');
    $this->assertAuthenticatedAs($user);

    // Check that cart item was transferred
    expect($user->cartItems)->toHaveCount(1);
    expect($user->cartItems->first()->product_id)->toBe($this->product->id);
    expect($user->cartItems->first()->quantity)->toBe(3);

    // Check that session cart was cleared
    expect(Session::has('pending_cart_items'))->toBeFalse();
});

it('transfers session cart to existing user cart on login', function () {
    // Create an existing user
    $user = User::factory()->create([
        'email' => 'existing@example.com',
        'role' => 'buyer',
    ]);

    // Add item to session cart first
    CartTransferService::addToSessionCart($this->product->id, 2);

    // Set up OTP for login
    $otp = '654321';
    Cache::put("login_otp_{$user->email}", $otp, now()->addMinutes(10));

    // Attempt passwordless login with existing user
    $response = $this->post(route('login'), [
        'email' => $user->email,
        'otp' => $otp,
        'passwordless_login' => true,
    ]);

    $response->assertRedirect('/dashboard');
    $this->assertAuthenticatedAs($user);

    // Check that cart item was transferred
    $user->refresh();
    expect($user->cartItems)->toHaveCount(1);
    expect($user->cartItems->first()->product_id)->toBe($this->product->id);
    expect($user->cartItems->first()->quantity)->toBe(2);

    // Check that session cart was cleared
    expect(Session::has('pending_cart_items'))->toBeFalse();
});

it('merges session cart with existing user cart items', function () {
    // Create user with existing cart item
    $user = User::factory()->create([
        'email' => 'user@example.com',
        'role' => 'buyer',
    ]);

    // Add item to user's existing cart
    $user->cartItems()->create([
        'product_id' => $this->product->id,
        'quantity' => 1,
    ]);

    // Add same item to session cart
    CartTransferService::addToSessionCart($this->product->id, 2);

    // Set up OTP for login
    $otp = '111111';
    Cache::put("login_otp_{$user->email}", $otp, now()->addMinutes(10));

    // Login
    $this->post(route('login'), [
        'email' => $user->email,
        'otp' => $otp,
        'passwordless_login' => true,
    ]);

    // Check that quantities were merged
    $user->refresh();
    expect($user->cartItems)->toHaveCount(1);
    expect($user->cartItems->first()->quantity)->toBe(3); // 1 + 2
});

it('returns session cart count for anonymous users', function () {
    // Add items to session cart
    CartTransferService::addToSessionCart($this->product->id, 3);

    // Get cart count as anonymous user
    $response = $this->get('/cart/count');

    $response->assertOk();
    $response->assertJson(['count' => 3]);
});

it('skips invalid products during cart transfer', function () {
    // Create an unpublished product
    $unpublishedProduct = Product::factory()
        ->for($this->store)
        ->for($this->category)
        ->create(['status' => 'draft']);

    // Add both products to session cart
    CartTransferService::addToSessionCart($this->product->id, 2);
    CartTransferService::addToSessionCart($unpublishedProduct->id, 1);

    // Create user and login
    $user = User::factory()->create(['role' => 'buyer']);
    $this->actingAs($user);

    // Transfer cart
    CartTransferService::transferPendingCart($user);

    // Only published product should be transferred
    expect($user->cartItems)->toHaveCount(1);
    expect($user->cartItems->first()->product_id)->toBe($this->product->id);
});

it('caps quantity at available stock during transfer', function () {
    // Product with limited stock
    $this->product->update(['quantity' => 5]);

    // Add more items to session than available
    CartTransferService::addToSessionCart($this->product->id, 10);

    // Create user and login
    $user = User::factory()->create(['role' => 'buyer']);
    $this->actingAs($user);

    // Transfer cart
    CartTransferService::transferPendingCart($user);

    // Quantity should be capped at available stock
    expect($user->cartItems)->toHaveCount(1);
    expect($user->cartItems->first()->quantity)->toBe(5);
});
