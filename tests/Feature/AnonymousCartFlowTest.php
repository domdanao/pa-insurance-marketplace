<?php

use App\Models\Category;
use App\Models\Product;
use App\Models\Store;
use App\Models\User;
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

it('completes the full anonymous user cart flow with OTP login', function () {
    // Step 1: Anonymous user adds product to cart
    $response = $this->post("/cart/add/{$this->product->id}", [
        'quantity' => 2,
    ]);

    // Should redirect to login and store intended URL
    $response->assertRedirect(route('login'));
    $response->assertSessionHas('info', 'Please log in to complete your purchase. Your cart will be saved!');

    // Check that item was added to session cart
    $pendingItems = Session::get('pending_cart_items', []);
    expect($pendingItems)->toHaveCount(1);
    expect($pendingItems[0]['product_id'])->toBe($this->product->id);
    expect($pendingItems[0]['quantity'])->toBe(2);

    // Check that intended URL was stored
    expect(Session::get('url.intended'))->not->toBeNull();

    // Step 2: User requests login OTP
    $email = 'test@example.com';

    $otpResponse = $this->postJson('/api/send-login-otp', [
        'email' => $email,
    ]);

    $otpResponse->assertStatus(200);
    $otpResponse->assertJson(['message' => 'Login code sent successfully']);

    // Step 3: User verifies OTP and logs in
    $otp = Cache::get("login_otp_{$email}");
    expect($otp)->not->toBeNull();

    $loginResponse = $this->postJson('/api/verify-login-otp', [
        'email' => $email,
        'otp' => $otp,
    ]);

    $loginResponse->assertStatus(200);
    $loginResponse->assertJson(['message' => 'Login successful']);

    // Step 4: Verify user was created and logged in
    $user = User::where('email', $email)->first();
    expect($user)->not->toBeNull();
    expect($user->role)->toBe('buyer');
    $this->assertAuthenticatedAs($user);

    // Step 5: Verify cart was transferred and session cart was cleared
    expect($user->cartItems)->toHaveCount(1);
    expect($user->cartItems->first()->product_id)->toBe($this->product->id);
    expect($user->cartItems->first()->quantity)->toBe(2);

    // Session cart should be cleared
    expect(Session::has('pending_cart_items'))->toBeFalse();

    // Step 6: Verify redirect URL includes intended URL (should go back to product page)
    $redirectUrl = $loginResponse->json('redirect');
    expect($redirectUrl)->not->toBe(route('dashboard'));
});

it('redirects to dashboard if no intended URL is set', function () {
    $email = 'nodashboard@example.com';

    // Send OTP
    $this->postJson('/api/send-login-otp', ['email' => $email]);

    // Verify OTP (no intended URL set)
    $otp = Cache::get("login_otp_{$email}");
    $loginResponse = $this->postJson('/api/verify-login-otp', [
        'email' => $email,
        'otp' => $otp,
    ]);

    $loginResponse->assertStatus(200);
    $redirectUrl = $loginResponse->json('redirect');
    expect($redirectUrl)->toBe(route('dashboard'));
});

it('handles existing user login with cart transfer', function () {
    // Create existing user
    $user = User::factory()->create([
        'email' => 'existing@example.com',
        'role' => 'buyer',
    ]);

    // Add item to session cart
    $this->post("/cart/add/{$this->product->id}", ['quantity' => 3]);

    // Send and verify OTP
    $this->postJson('/api/send-login-otp', ['email' => $user->email]);
    $otp = Cache::get("login_otp_{$user->email}");

    $loginResponse = $this->postJson('/api/verify-login-otp', [
        'email' => $user->email,
        'otp' => $otp,
    ]);

    $loginResponse->assertStatus(200);
    $this->assertAuthenticatedAs($user);

    // Verify cart was transferred
    $user->refresh();
    expect($user->cartItems)->toHaveCount(1);
    expect($user->cartItems->first()->quantity)->toBe(3);
});
