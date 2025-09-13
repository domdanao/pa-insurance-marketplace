<?php

use App\Models\Category;
use App\Models\Merchant;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\Product;
use App\Models\Store;
use App\Models\User;
use Carbon\Carbon;

beforeEach(function () {
    // Create admin user
    $this->admin = User::factory()->create(['role' => 'admin']);

    // Create merchant and store
    $this->merchant = User::factory()->create(['role' => 'merchant']);
    $this->store = Store::factory()->create([
        'user_id' => $this->merchant->id,
        'status' => 'pending',
    ]);

    // Create buyer
    $this->buyer = User::factory()->create(['role' => 'buyer']);

    // Create category and products
    $this->category = Category::factory()->create();
    $this->product = Product::factory()->create([
        'store_id' => $this->store->id,
        'category_id' => $this->category->id,
        'status' => 'published',
        'price' => 10000,
        'quantity' => 50,
    ]);

    // Create orders for testing
    $this->order = Order::factory()->create([
        'user_id' => $this->buyer->id,
        'status' => 'completed',
        'total_amount' => 10000,
        'created_at' => Carbon::now()->subDays(5),
    ]);

    OrderItem::factory()->create([
        'order_id' => $this->order->id,
        'product_id' => $this->product->id,
        'store_id' => $this->store->id,
        'product_name' => $this->product->name,
        'product_price' => 10000,
        'quantity' => 1,
        'total_price' => 10000,
    ]);

    // Create payment
    $this->payment = Payment::factory()->create([
        'order_id' => $this->order->id,
        'amount' => 10000,
        'status' => 'completed',
    ]);
});

describe('Admin Dashboard Authentication', function () {
    it('redirects non-admin users from dashboard', function () {
        $this->actingAs($this->merchant)
            ->get('/admin/dashboard')
            ->assertForbidden();
    });

    it('allows admin users to access dashboard', function () {
        $response = $this->actingAs($this->admin)
            ->get('/admin/dashboard');

        $response->assertSuccessful()
            ->assertInertia(fn ($page) => $page->component('Admin/Dashboard')
                ->has('stats')
            );
    });
});

describe('Admin Dashboard Stats', function () {
    it('displays correct platform statistics', function () {
        $response = $this->actingAs($this->admin)
            ->get('/admin/dashboard');

        $response->assertInertia(fn ($page) => $page->component('Admin/Dashboard')
            ->has('stats')
            ->has('stats.users')
            ->has('stats.stores')
            ->has('stats.products')
            ->has('stats.orders')
            ->has('stats.revenue')
            ->has('stats.payments')
            ->where('stats.users.total', 3) // admin, merchant, buyer
            ->where('stats.users.merchants', 1)
            ->where('stats.users.buyers', 1)
            ->where('stats.stores.total', 1)
            ->where('stats.stores.pending', 1)
            ->where('stats.products.total', 1)
            ->where('stats.products.published', 1)
            ->where('stats.orders.total', 1)
            ->where('stats.revenue.total', 10000)
            ->where('stats.payments.completed', 1)
        );
    });
});

describe('Admin User Management', function () {
    it('lists all users with filters', function () {
        $response = $this->actingAs($this->admin)
            ->get('/admin/users');

        $response->assertSuccessful()
            ->assertInertia(fn ($page) => $page->component('Admin/Users/Index')
                ->has('users')
                ->has('users.data', 3) // admin, merchant, buyer
                ->has('filters')
            );
    });

    it('filters users by role', function () {
        $response = $this->actingAs($this->admin)
            ->get('/admin/users?role=merchant');

        $response->assertSuccessful()
            ->assertInertia(fn ($page) => $page->component('Admin/Users/Index')
                ->has('users')
                ->has('users.data', 1) // only merchant
                ->where('filters.role', 'merchant')
            );
    });

    it('searches users by name or email', function () {
        $response = $this->actingAs($this->admin)
            ->get('/admin/users?search='.$this->merchant->name);

        $response->assertSuccessful()
            ->assertInertia(fn ($page) => $page->component('Admin/Users/Index')
                ->has('users')
                ->where('filters.search', $this->merchant->name)
            );
    });
});

describe('Admin Store Management', function () {
    it('lists all stores with details', function () {
        $response = $this->actingAs($this->admin)
            ->get('/admin/stores');

        $response->assertSuccessful()
            ->assertInertia(fn ($page) => $page->component('Admin/Stores/Index')
                ->has('stores')
                ->has('stores.data', 1)
                ->has('filters')
            );
    });

    it('filters stores by status', function () {
        $response = $this->actingAs($this->admin)
            ->get('/admin/stores?status=pending');

        $response->assertSuccessful()
            ->assertInertia(fn ($page) => $page->component('Admin/Stores/Index')
                ->has('stores')
                ->where('filters.status', 'pending')
            );
    });

    it('approves a pending store', function () {
        $this->actingAs($this->admin)
            ->patch("/admin/stores/{$this->store->id}/approve")
            ->assertRedirect()
            ->assertSessionHas('success', 'Store approved successfully.');

        $this->store->refresh();
        expect($this->store->status)->toBe('approved');
    });

    it('suspends an active store', function () {
        $this->store->update(['status' => 'approved']);

        $this->actingAs($this->admin)
            ->patch("/admin/stores/{$this->store->id}/suspend")
            ->assertRedirect()
            ->assertSessionHas('success', 'Store suspended successfully.');

        $this->store->refresh();
        expect($this->store->status)->toBe('suspended');
    });
});

describe('Admin Order Management', function () {
    it('lists all orders with filters', function () {
        $response = $this->actingAs($this->admin)
            ->get('/admin/orders');

        $response->assertSuccessful()
            ->assertInertia(fn ($page) => $page->component('Admin/Orders/Index')
                ->has('orders')
                ->has('orders.data', 1)
                ->has('filters')
            );
    });

    it('filters orders by status', function () {
        $response = $this->actingAs($this->admin)
            ->get('/admin/orders?status=completed');

        $response->assertSuccessful()
            ->assertInertia(fn ($page) => $page->component('Admin/Orders/Index')
                ->has('orders')
                ->where('filters.status', 'completed')
            );
    });

    it('filters orders by date range', function () {
        $startDate = Carbon::now()->subDays(10)->format('Y-m-d');
        $endDate = Carbon::now()->format('Y-m-d');

        $response = $this->actingAs($this->admin)
            ->get("/admin/orders?start_date={$startDate}&end_date={$endDate}");

        $response->assertSuccessful()
            ->assertInertia(fn ($page) => $page->component('Admin/Orders/Index')
                ->has('orders')
                ->where('filters.start_date', $startDate)
                ->where('filters.end_date', $endDate)
            );
    });
});

describe('Admin Payment Management', function () {
    it('lists all payments with statistics', function () {
        $response = $this->actingAs($this->admin)
            ->get('/admin/payments');

        $response->assertSuccessful()
            ->assertInertia(fn ($page) => $page->component('Admin/Payments/Index')
                ->has('payments')
                ->has('payments.data', 1)
                ->has('paymentStats')
                ->where('paymentStats.total_payments', 1)
                ->where('paymentStats.completed_payments', 1)
                ->where('paymentStats.total_revenue', 10000)
                ->has('filters')
            );
    });

    it('filters payments by status', function () {
        $response = $this->actingAs($this->admin)
            ->get('/admin/payments?status=completed');

        $response->assertSuccessful()
            ->assertInertia(fn ($page) => $page->component('Admin/Payments/Index')
                ->has('payments')
                ->where('filters.status', 'completed')
            );
    });
});

describe('Admin Categories Management', function () {
    it('lists all categories with product counts', function () {
        $response = $this->actingAs($this->admin)
            ->get('/admin/categories');

        $response->assertSuccessful()
            ->assertInertia(fn ($page) => $page->component('Admin/Categories/Index')
                ->has('categories')
                ->has('categories.data', 1)
            );
    });
});

describe('Admin Analytics', function () {
    it('displays platform analytics with date filtering', function () {
        $response = $this->actingAs($this->admin)
            ->get('/admin/analytics');

        $response->assertSuccessful()
            ->assertInertia(fn ($page) => $page->component('Admin/Analytics')
                ->has('analytics')
                ->has('analytics.daily_data')
                ->has('analytics.top_stores')
                ->has('analytics.category_performance')
                ->has('analytics.summary')
                ->has('dateRange')
                ->has('dateRange.start')
                ->has('dateRange.end')
            );
    });

    it('filters analytics by custom date range', function () {
        $startDate = Carbon::now()->startOfMonth()->format('Y-m-d');
        $endDate = Carbon::now()->endOfMonth()->format('Y-m-d');

        $response = $this->actingAs($this->admin)
            ->get("/admin/analytics?start_date={$startDate}&end_date={$endDate}");

        $response->assertSuccessful()
            ->assertInertia(fn ($page) => $page->component('Admin/Analytics')
                ->where('dateRange.start', $startDate)
                ->where('dateRange.end', $endDate)
            );
    });
});

describe('Admin Merchant Creation', function () {
    it('shows merchant creation form to admin users', function () {
        $response = $this->actingAs($this->admin)
            ->get('/admin/merchants/create');

        $response->assertSuccessful()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Merchants/Create')
            );
    });

    it('prevents non-admin users from accessing merchant creation form', function () {
        $this->actingAs($this->merchant)
            ->get('/admin/merchants/create')
            ->assertForbidden();

        $this->actingAs($this->buyer)
            ->get('/admin/merchants/create')
            ->assertForbidden();
    });

    it('allows admin to create merchant account with user profile', function () {
        $merchantData = [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'business_name' => 'Johns Electronics',
            'business_type' => 'llc',
            'phone' => '+1234567890',
            'business_address' => '123 Business St, City, State 12345',
            'tax_id' => 'TAX123456',
            'bank_name' => 'First National Bank',
            'account_holder_name' => 'John Doe',
            'account_number' => '1234567890',
            'routing_number' => '021000021',
            'status' => 'approved',
        ];

        $response = $this->actingAs($this->admin)
            ->post('/admin/merchants', $merchantData);

        // Check user was created
        $user = User::where('email', 'john@example.com')->first();
        expect($user)->not->toBeNull();
        expect($user->role)->toBe('merchant');
        expect($user->email_verified_at)->not->toBeNull();

        // Check merchant profile was created
        $merchant = Merchant::where('user_id', $user->id)->first();
        expect($merchant)->not->toBeNull();
        expect($merchant->business_name)->toBe('Johns Electronics');
        expect($merchant->business_type)->toBe('llc');
        expect($merchant->status)->toBe('approved');
        expect($merchant->approved_at)->not->toBeNull();
        expect($merchant->approved_by)->toBe($this->admin->id);

        $response->assertRedirect()
            ->assertSessionHas('success', 'Merchant account created successfully.');
    });

    it('creates merchant with pending status when specified', function () {
        $merchantData = [
            'name' => 'Jane Smith',
            'email' => 'jane@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'business_name' => 'Janes Books',
            'business_type' => 'sole_proprietorship',
            'phone' => '+1987654321',
            'business_address' => '456 Store Ave, City, State 67890',
            'status' => 'pending',
        ];

        $this->actingAs($this->admin)
            ->post('/admin/merchants', $merchantData);

        $user = User::where('email', 'jane@example.com')->first();
        $merchant = Merchant::where('user_id', $user->id)->first();

        expect($merchant->status)->toBe('pending');
        expect($merchant->approved_at)->toBeNull();
        expect($merchant->approved_by)->toBeNull();
    });

    it('validates required fields when creating merchant', function () {
        $response = $this->actingAs($this->admin)
            ->post('/admin/merchants', []);

        $response->assertSessionHasErrors([
            'name',
            'email',
            'password',
            'business_name',
            'business_type',
            'phone',
            'business_address',
            'status',
        ]);
    });

    it('validates email uniqueness when creating merchant', function () {
        $existingUser = User::factory()->create(['email' => 'existing@example.com']);

        $merchantData = [
            'name' => 'Test User',
            'email' => 'existing@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'business_name' => 'Test Business',
            'business_type' => 'llc',
            'phone' => '+1234567890',
            'business_address' => '123 Test St',
            'status' => 'pending',
        ];

        $response = $this->actingAs($this->admin)
            ->post('/admin/merchants', $merchantData);

        $response->assertSessionHasErrors(['email']);
    });

    it('validates password confirmation when creating merchant', function () {
        $merchantData = [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password123',
            'password_confirmation' => 'different_password',
            'business_name' => 'Test Business',
            'business_type' => 'llc',
            'phone' => '+1234567890',
            'business_address' => '123 Test St',
            'status' => 'pending',
        ];

        $response = $this->actingAs($this->admin)
            ->post('/admin/merchants', $merchantData);

        $response->assertSessionHasErrors(['password']);
    });

    it('validates business type enum values', function () {
        $merchantData = [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'business_name' => 'Test Business',
            'business_type' => 'invalid_type',
            'phone' => '+1234567890',
            'business_address' => '123 Test St',
            'status' => 'pending',
        ];

        $response = $this->actingAs($this->admin)
            ->post('/admin/merchants', $merchantData);

        $response->assertSessionHasErrors(['business_type']);
    });

    it('validates status enum values', function () {
        $merchantData = [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'business_name' => 'Test Business',
            'business_type' => 'llc',
            'phone' => '+1234567890',
            'business_address' => '123 Test St',
            'status' => 'invalid_status',
        ];

        $response = $this->actingAs($this->admin)
            ->post('/admin/merchants', $merchantData);

        $response->assertSessionHasErrors(['status']);
    });

    it('creates merchant without banking information when not provided', function () {
        $merchantData = [
            'name' => 'Basic Merchant',
            'email' => 'basic@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'business_name' => 'Basic Business',
            'business_type' => 'sole_proprietorship',
            'phone' => '+1111111111',
            'business_address' => '789 Basic St',
            'status' => 'pending',
        ];

        $this->actingAs($this->admin)
            ->post('/admin/merchants', $merchantData);

        $user = User::where('email', 'basic@example.com')->first();
        $merchant = Merchant::where('user_id', $user->id)->first();

        expect($merchant->bank_name)->toBeNull();
        expect($merchant->account_holder_name)->toBeNull();
        expect($merchant->account_number)->toBeNull();
        expect($merchant->routing_number)->toBeNull();
    });

    it('prevents non-admin users from creating merchants', function () {
        $merchantData = [
            'name' => 'Unauthorized User',
            'email' => 'unauthorized@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'business_name' => 'Unauthorized Business',
            'business_type' => 'llc',
            'phone' => '+1234567890',
            'business_address' => '123 Unauthorized St',
            'status' => 'pending',
        ];

        $this->actingAs($this->merchant)
            ->post('/admin/merchants', $merchantData)
            ->assertForbidden();

        $this->actingAs($this->buyer)
            ->post('/admin/merchants', $merchantData)
            ->assertForbidden();

        // Ensure no merchant was created
        expect(User::where('email', 'unauthorized@example.com')->exists())->toBeFalse();
    });
});

describe('Admin Authorization', function () {
    it('prevents non-admin users from accessing admin routes', function ($route) {
        $this->actingAs($this->merchant)
            ->get($route)
            ->assertForbidden();

        $this->actingAs($this->buyer)
            ->get($route)
            ->assertForbidden();
    })->with([
        '/admin/dashboard',
        '/admin/users',
        '/admin/merchants',
        '/admin/merchants/create',
        '/admin/stores',
        '/admin/orders',
        '/admin/payments',
        '/admin/categories',
        '/admin/analytics',
    ]);

    it('prevents non-admin users from store management actions', function () {
        $this->actingAs($this->merchant)
            ->patch("/admin/stores/{$this->store->id}/approve")
            ->assertForbidden();

        $this->actingAs($this->buyer)
            ->patch("/admin/stores/{$this->store->id}/suspend")
            ->assertForbidden();
    });
});
