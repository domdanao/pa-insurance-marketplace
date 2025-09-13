<?php

namespace App\Http\Controllers\Merchant;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Services\AnalyticsService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    private AnalyticsService $analyticsService;

    public function __construct(AnalyticsService $analyticsService)
    {
        $this->analyticsService = $analyticsService;
    }

    public function index(Request $request)
    {
        $user = $request->user();

        // Check if user has a merchant account
        if (! $user->merchant) {
            return Inertia::render('Merchant/NoMerchantAccount', [
                'user' => $user,
            ]);
        }

        // Check merchant account status
        if ($user->merchant->isPending()) {
            return Inertia::render('Merchant/MerchantUnderReview', [
                'merchant' => $user->merchant,
            ]);
        }

        if ($user->merchant->isSuspended()) {
            return Inertia::render('Merchant/MerchantSuspended', [
                'merchant' => $user->merchant,
            ]);
        }

        if ($user->merchant->isRejected()) {
            return Inertia::render('Merchant/MerchantRejected', [
                'merchant' => $user->merchant,
            ]);
        }

        $store = $user->merchant->store;

        // If merchant doesn't have a store yet, redirect to onboarding
        if (! $store) {
            return redirect()->route('merchant.store.create');
        }

        // Check if store needs approval
        if ($store->isPending()) {
            return Inertia::render('Merchant/StoreUnderReview', [
                'store' => $store,
            ]);
        }

        if ($store->isSuspended()) {
            return Inertia::render('Merchant/StoreSuspended', [
                'store' => $store,
            ]);
        }

        // Get date range from request or default to current month
        $dateRange = $this->getDateRange($request);

        // Get comprehensive analytics data
        $analytics = $this->analyticsService->getMerchantDashboardData(
            $store->id,
            $dateRange
        );

        // Get basic store stats for quick overview
        $basicStats = $this->getBasicStats($store);

        // Get recent orders for the store
        $recentOrders = \App\Models\Order::whereHas('orderItems', function ($query) use ($store) {
            $query->where('store_id', $store->id);
        })
            ->with(['user', 'orderItems' => function ($query) use ($store) {
                $query->where('store_id', $store->id);
            }])
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($order) {
                $storeItems = $order->orderItems;

                return [
                    'id' => $order->id,
                    'order_number' => $order->order_number,
                    'user' => $order->user ? ['name' => $order->user->name] : null,
                    'total_amount' => $storeItems->sum('total_price') / 100, // Convert from cents
                    'status' => $order->status,
                    'created_at' => $order->created_at,
                ];
            });

        // Get low stock products
        $lowStockProducts = Product::where('store_id', $store->id)
            ->where('quantity', '<=', 5)
            ->where('quantity', '>', 0)
            ->where('digital_product', false)
            ->published()
            ->take(5)
            ->get()
            ->map(function ($product) {
                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'quantity' => $product->quantity,
                ];
            });

        // Combine stats into the expected structure
        $stats = [
            'store' => [
                'name' => $store->name,
                'status' => $store->status,
                'products_count' => $basicStats['total_products'],
                'published_products' => $basicStats['published_products'],
            ],
            'orders' => [
                'total' => $analytics['overview']['total_orders']['current'] ?? 0,
                'pending' => 0, // TODO: Calculate pending orders
                'processing' => 0, // TODO: Calculate processing orders
                'completed' => 0, // TODO: Calculate completed orders
                'this_month' => $analytics['overview']['total_orders']['current'] ?? 0,
                'growth_percentage' => $analytics['overview']['total_orders']['growth_percentage'] ?? 0,
            ],
            'revenue' => [
                'total' => $analytics['overview']['total_revenue']['current'] ?? 0,
                'this_month' => $analytics['overview']['total_revenue']['current'] ?? 0,
                'last_month' => $analytics['overview']['total_revenue']['previous'] ?? 0,
                'growth_percentage' => $analytics['overview']['total_revenue']['growth_percentage'] ?? 0,
            ],
            'products' => [
                'total' => $basicStats['total_products'],
                'published' => $basicStats['published_products'],
                'draft' => $basicStats['draft_products'],
                'low_stock' => $basicStats['low_stock_products'],
            ],
            'recent_orders' => $recentOrders,
            'low_stock_products' => $lowStockProducts,
        ];

        return Inertia::render('Merchant/Dashboard', [
            'user' => $user,
            'store' => $store,
            'stats' => $stats,
            'analytics' => $analytics,
            'basicStats' => $basicStats,
            'dateRange' => [
                'start' => $dateRange['start']->format('Y-m-d'),
                'end' => $dateRange['end']->format('Y-m-d'),
            ],
        ]);
    }

    public function getAnalytics(Request $request)
    {
        $user = $request->user();

        if (! $user->hasApprovedMerchant()) {
            return redirect()->route('merchant.dashboard')
                ->with('error', 'Merchant account not approved');
        }

        $store = $user->merchant->store;

        if (! $store) {
            return redirect()->route('merchant.store.create');
        }

        $dateRange = $this->getDateRange($request);
        $analytics = $this->analyticsService->getMerchantDashboardData(
            $store->id,
            $dateRange
        );

        // Convert analytics data from cents to decimals for consistency
        $analytics = $this->convertAnalyticsFromCents($analytics);

        return Inertia::render('Merchant/Analytics/Index', [
            'analytics' => $analytics,
            'dateRange' => [
                'start' => $dateRange['start']->format('Y-m-d'),
                'end' => $dateRange['end']->format('Y-m-d'),
            ],
            'store' => $store,
        ]);
    }

    private function getDateRange(Request $request): array
    {
        $start = $request->input('start_date')
            ? Carbon::parse($request->input('start_date'))->startOfDay()
            : Carbon::now()->startOfMonth();

        $end = $request->input('end_date')
            ? Carbon::parse($request->input('end_date'))->endOfDay()
            : Carbon::now()->endOfMonth();

        return [
            'start' => $start,
            'end' => $end,
        ];
    }

    private function getBasicStats($store): array
    {
        $totalProducts = Product::where('store_id', $store->id)->count();
        $publishedProducts = Product::where('store_id', $store->id)->published()->count();
        $draftProducts = Product::where('store_id', $store->id)->draft()->count();

        $lowStockProducts = Product::where('store_id', $store->id)
            ->where('quantity', '<=', 5)
            ->where('quantity', '>', 0)
            ->where('digital_product', false)
            ->published()
            ->count();

        $outOfStockProducts = Product::where('store_id', $store->id)
            ->where('quantity', 0)
            ->where('digital_product', false)
            ->published()
            ->count();

        return [
            'total_products' => $totalProducts,
            'published_products' => $publishedProducts,
            'draft_products' => $draftProducts,
            'low_stock_products' => $lowStockProducts,
            'out_of_stock_products' => $outOfStockProducts,
        ];
    }

    private function convertAnalyticsFromCents(array $analytics): array
    {
        // Convert revenue amounts from cents to decimal for consistent frontend display
        if (isset($analytics['overview']['total_revenue'])) {
            $analytics['overview']['total_revenue']['current'] = ($analytics['overview']['total_revenue']['current'] ?? 0) / 100;
            $analytics['overview']['total_revenue']['previous'] = ($analytics['overview']['total_revenue']['previous'] ?? 0) / 100;
        }

        if (isset($analytics['overview']['average_order_value'])) {
            $analytics['overview']['average_order_value']['current'] = ($analytics['overview']['average_order_value']['current'] ?? 0) / 100;
            $analytics['overview']['average_order_value']['previous'] = ($analytics['overview']['average_order_value']['previous'] ?? 0) / 100;
        }

        if (isset($analytics['revenue'])) {
            $analytics['revenue']['total_revenue'] = ($analytics['revenue']['total_revenue'] ?? 0) / 100;
            $analytics['revenue']['average_daily_revenue'] = ($analytics['revenue']['average_daily_revenue'] ?? 0) / 100;
            
            if (isset($analytics['revenue']['highest_day']['revenue'])) {
                $analytics['revenue']['highest_day']['revenue'] = ($analytics['revenue']['highest_day']['revenue'] ?? 0) / 100;
            }

            // Convert daily revenue data if present
            if (isset($analytics['revenue']['daily_data'])) {
                foreach ($analytics['revenue']['daily_data'] as &$day) {
                    if (isset($day['revenue'])) {
                        $day['revenue'] = ($day['revenue'] ?? 0) / 100;
                    }
                }
            }
        }

        if (isset($analytics['products'])) {
            // Convert products array if it exists
            foreach ($analytics['products'] as &$product) {
                // Don't convert price - it's already converted by Product model accessor
                if (isset($product['total_revenue'])) {
                    $product['total_revenue'] = ($product['total_revenue'] ?? 0) / 100;
                }
            }
            
            // Convert product_performance array if it exists
            if (isset($analytics['products']['product_performance'])) {
                foreach ($analytics['products']['product_performance'] as &$product) {
                    // Don't convert price - it's already converted by Product model accessor
                    if (isset($product['total_revenue'])) {
                        $product['total_revenue'] = ($product['total_revenue'] ?? 0) / 100;
                    }
                }
            }
        }

        if (isset($analytics['customers']['customer_lifetime_value'])) {
            $analytics['customers']['customer_lifetime_value'] = ($analytics['customers']['customer_lifetime_value'] ?? 0) / 100;
        }

        return $analytics;
    }
}
