<?php

use App\Models\Category;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Store;
use App\Models\User;
use App\Services\AnalyticsService;
use Carbon\Carbon;

beforeEach(function () {
    $this->analyticsService = new AnalyticsService;

    // Create test merchant and store
    $this->merchant = User::factory()->merchant()->create();
    $this->store = Store::factory()->create(['user_id' => $this->merchant->id]);

    // Create test buyers
    $this->buyer1 = User::factory()->create();
    $this->buyer2 = User::factory()->create();

    // Create test category and products
    $this->category = Category::factory()->create();
    $this->product1 = Product::factory()->create([
        'store_id' => $this->store->id,
        'category_id' => $this->category->id,
        'name' => 'Test Product 1',
        'price' => 10000, // ₱100.00
        'quantity' => 50,
        'status' => 'published',
    ]);

    $this->product2 = Product::factory()->create([
        'store_id' => $this->store->id,
        'category_id' => $this->category->id,
        'name' => 'Test Product 2',
        'price' => 20000, // ₱200.00
        'quantity' => 30,
        'status' => 'published',
    ]);
});

describe('Analytics Service Overview Metrics', function () {
    it('calculates overview metrics correctly', function () {
        // Create orders from different time periods
        $currentStart = Carbon::now()->startOfMonth();
        $currentEnd = Carbon::now()->endOfMonth();

        // Current period orders
        $order1 = Order::factory()->create([
            'user_id' => $this->buyer1->id,
            'status' => 'completed',
            'total_amount' => 30000,
            'created_at' => Carbon::now()->subDays(5),
        ]);

        OrderItem::factory()->create([
            'order_id' => $order1->id,
            'product_id' => $this->product1->id,
            'store_id' => $this->store->id,
            'product_name' => $this->product1->name,
            'product_price' => $this->product1->price,
            'quantity' => 2,
            'total_price' => 20000,
        ]);

        OrderItem::factory()->create([
            'order_id' => $order1->id,
            'product_id' => $this->product2->id,
            'store_id' => $this->store->id,
            'product_name' => $this->product2->name,
            'product_price' => $this->product2->price,
            'quantity' => 1,
            'total_price' => 20000,
        ]);

        // Previous period orders
        $previousOrder = Order::factory()->create([
            'user_id' => $this->buyer2->id,
            'status' => 'completed',
            'total_amount' => 20000,
            'created_at' => Carbon::now()->subMonth()->addDays(5),
        ]);

        OrderItem::factory()->create([
            'order_id' => $previousOrder->id,
            'product_id' => $this->product1->id,
            'store_id' => $this->store->id,
            'product_name' => $this->product1->name,
            'product_price' => $this->product1->price,
            'quantity' => 2,
            'total_price' => 20000,
        ]);

        $overview = $this->analyticsService->getOverviewMetrics(
            $this->store->id,
            $currentStart,
            $currentEnd
        );

        expect($overview)->toHaveKey('total_revenue')
            ->and($overview)->toHaveKey('total_orders')
            ->and($overview)->toHaveKey('total_customers')
            ->and($overview['total_revenue']['current'])->toBe(40000)
            ->and($overview['total_orders']['current'])->toBe(1)
            ->and($overview['total_customers']['current'])->toBe(1);
    });
});

describe('Revenue Analytics', function () {
    it('generates daily revenue data correctly', function () {
        $startDate = Carbon::now()->startOfMonth();
        $endDate = Carbon::now()->startOfMonth()->addDays(5);

        // Create orders on different days
        $order1 = Order::factory()->create([
            'user_id' => $this->buyer1->id,
            'status' => 'completed',
            'created_at' => $startDate->copy()->addDays(1)->setTime(10, 0),
        ]);

        OrderItem::factory()->create([
            'order_id' => $order1->id,
            'store_id' => $this->store->id,
            'product_id' => $this->product1->id,
            'product_name' => $this->product1->name,
            'product_price' => 10000,
            'quantity' => 2,
            'total_price' => 20000,
        ]);

        $order2 = Order::factory()->create([
            'user_id' => $this->buyer2->id,
            'status' => 'completed',
            'created_at' => $startDate->copy()->addDays(3)->setTime(14, 0),
        ]);

        OrderItem::factory()->create([
            'order_id' => $order2->id,
            'store_id' => $this->store->id,
            'product_id' => $this->product2->id,
            'product_name' => $this->product2->name,
            'product_price' => 20000,
            'quantity' => 1,
            'total_price' => 20000,
        ]);

        $revenue = $this->analyticsService->getRevenueAnalytics(
            $this->store->id,
            $startDate,
            $endDate
        );

        expect($revenue)->toHaveKey('daily_data')
            ->and($revenue)->toHaveKey('total_revenue')
            ->and($revenue['total_revenue'])->toBe(40000)
            ->and($revenue['daily_data'])->toHaveCount(6); // 6 days in range

        // Check specific days have correct revenue
        $dailyData = collect($revenue['daily_data'])->keyBy('date');
        expect($dailyData[$startDate->copy()->addDays(1)->format('Y-m-d')]['revenue'])->toBe(20000)
            ->and($dailyData[$startDate->copy()->addDays(3)->format('Y-m-d')]['revenue'])->toBe(20000)
            ->and($dailyData[$startDate->copy()->addDays(2)->format('Y-m-d')]['revenue'])->toBe(0); // No orders this day
    });
});

describe('Product Analytics', function () {
    it('identifies top performing products', function () {
        $startDate = Carbon::now()->startOfMonth();
        $endDate = Carbon::now()->endOfMonth();

        // Create orders with different products and quantities
        $order1 = Order::factory()->create([
            'user_id' => $this->buyer1->id,
            'status' => 'completed',
            'created_at' => Carbon::now()->subDays(5),
        ]);

        // Product 1: 3 units sold, ₱300 revenue
        OrderItem::factory()->create([
            'order_id' => $order1->id,
            'store_id' => $this->store->id,
            'product_id' => $this->product1->id,
            'product_name' => $this->product1->name,
            'product_price' => 10000,
            'quantity' => 3,
            'total_price' => 30000,
        ]);

        $order2 = Order::factory()->create([
            'user_id' => $this->buyer2->id,
            'status' => 'completed',
            'created_at' => Carbon::now()->subDays(3),
        ]);

        // Product 2: 1 unit sold, ₱200 revenue
        OrderItem::factory()->create([
            'order_id' => $order2->id,
            'store_id' => $this->store->id,
            'product_id' => $this->product2->id,
            'product_name' => $this->product2->name,
            'product_price' => 20000,
            'quantity' => 1,
            'total_price' => 20000,
        ]);

        $products = $this->analyticsService->getProductAnalytics(
            $this->store->id,
            $startDate,
            $endDate
        );

        expect($products)->toHaveKey('top_products')
            ->and($products['top_products'])->toHaveCount(2);

        // Top product should be product1 with higher revenue
        $topProduct = $products['top_products']->first();
        expect($topProduct->product_name)->toBe('Test Product 1')
            ->and($topProduct->units_sold)->toBe(3)
            ->and($topProduct->revenue)->toBe(30000);
    });
});

describe('Customer Analytics', function () {
    it('identifies top customers by spending', function () {
        $startDate = Carbon::now()->subDays(15);
        $endDate = Carbon::now();

        // Buyer 1: 2 orders, ₱500 total
        $order1 = Order::factory()->create([
            'user_id' => $this->buyer1->id,
            'status' => 'completed',
            'created_at' => Carbon::now()->subDays(10),
        ]);

        OrderItem::factory()->create([
            'order_id' => $order1->id,
            'store_id' => $this->store->id,
            'product_id' => $this->product1->id,
            'product_name' => $this->product1->name,
            'product_price' => 10000,
            'quantity' => 3,
            'total_price' => 30000,
        ]);

        $order2 = Order::factory()->create([
            'user_id' => $this->buyer1->id,
            'status' => 'completed',
            'created_at' => Carbon::now()->subDays(5),
        ]);

        OrderItem::factory()->create([
            'order_id' => $order2->id,
            'store_id' => $this->store->id,
            'product_id' => $this->product2->id,
            'product_name' => $this->product2->name,
            'product_price' => 20000,
            'quantity' => 1,
            'total_price' => 20000,
        ]);

        $customers = $this->analyticsService->getCustomerAnalytics(
            $this->store->id,
            $startDate,
            $endDate
        );

        expect($customers)->toHaveKey('top_customers')
            ->and($customers)->toHaveKey('total_customers')
            ->and($customers['total_customers'])->toBe(1) // Only buyer1 has orders
            ->and($customers['top_customers'])->toHaveCount(1);

        // Top customer should be buyer1 with 2 orders
        $topCustomer = $customers['top_customers']->first();
        expect($topCustomer->order_count)->toBe(2)
            ->and($topCustomer->total_spent)->toBe(50000);
    });

    it('counts repeat customers correctly', function () {
        $startDate = Carbon::now()->subDays(15);
        $endDate = Carbon::now();

        // Create customer with multiple orders
        $order1 = Order::factory()->create([
            'user_id' => $this->buyer1->id,
            'status' => 'completed',
            'created_at' => Carbon::now()->subDays(10),
        ]);

        OrderItem::factory()->create([
            'order_id' => $order1->id,
            'store_id' => $this->store->id,
            'product_id' => $this->product1->id,
            'product_name' => $this->product1->name,
            'product_price' => 10000,
            'quantity' => 1,
            'total_price' => 10000,
        ]);

        $order2 = Order::factory()->create([
            'user_id' => $this->buyer1->id,
            'status' => 'completed',
            'created_at' => Carbon::now()->subDays(5),
        ]);

        OrderItem::factory()->create([
            'order_id' => $order2->id,
            'store_id' => $this->store->id,
            'product_id' => $this->product1->id,
            'product_name' => $this->product1->name,
            'product_price' => 10000,
            'quantity' => 1,
            'total_price' => 10000,
        ]);

        // Create customer with single order
        $order3 = Order::factory()->create([
            'user_id' => $this->buyer2->id,
            'status' => 'completed',
            'created_at' => Carbon::now()->subDays(3),
        ]);

        OrderItem::factory()->create([
            'order_id' => $order3->id,
            'store_id' => $this->store->id,
            'product_id' => $this->product1->id,
            'product_name' => $this->product1->name,
            'product_price' => 10000,
            'quantity' => 1,
            'total_price' => 10000,
        ]);

        $customers = $this->analyticsService->getCustomerAnalytics(
            $this->store->id,
            $startDate,
            $endDate
        );

        expect($customers['total_customers'])->toBe(2)
            ->and($customers['repeat_customers'])->toBe(1); // buyer1 has 2 orders
    });
});
