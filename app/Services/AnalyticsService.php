<?php

namespace App\Services;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class AnalyticsService
{
    public function getMerchantDashboardData(string $storeId, ?array $dateRange = null): array
    {
        $startDate = $dateRange['start'] ?? Carbon::now()->startOfMonth();
        $endDate = $dateRange['end'] ?? Carbon::now()->endOfMonth();

        return [
            'overview' => $this->getOverviewMetrics($storeId, $startDate, $endDate),
            'revenue' => $this->getRevenueAnalytics($storeId, $startDate, $endDate),
            'orders' => $this->getOrderAnalytics($storeId, $startDate, $endDate),
            'products' => $this->getProductAnalytics($storeId, $startDate, $endDate),
            'customers' => $this->getCustomerAnalytics($storeId, $startDate, $endDate),
        ];
    }

    public function getOverviewMetrics(string $storeId, Carbon $startDate, Carbon $endDate): array
    {
        $currentPeriod = $this->calculatePeriodMetrics($storeId, $startDate, $endDate);
        $previousStart = $startDate->copy()->subDays($endDate->diffInDays($startDate) + 1);
        $previousEnd = $startDate->copy()->subDay();
        $previousPeriod = $this->calculatePeriodMetrics($storeId, $previousStart, $previousEnd);

        return [
            'total_revenue' => [
                'current' => $currentPeriod['revenue'],
                'previous' => $previousPeriod['revenue'],
                'change_percentage' => $this->calculateChangePercentage(
                    $currentPeriod['revenue'],
                    $previousPeriod['revenue']
                ),
            ],
            'total_orders' => [
                'current' => $currentPeriod['orders'],
                'previous' => $previousPeriod['orders'],
                'change_percentage' => $this->calculateChangePercentage(
                    $currentPeriod['orders'],
                    $previousPeriod['orders']
                ),
            ],
            'average_order_value' => [
                'current' => $currentPeriod['orders'] > 0
                    ? $currentPeriod['revenue'] / $currentPeriod['orders']
                    : 0,
                'previous' => $previousPeriod['orders'] > 0
                    ? $previousPeriod['revenue'] / $previousPeriod['orders']
                    : 0,
            ],
            'total_customers' => [
                'current' => $currentPeriod['customers'],
                'previous' => $previousPeriod['customers'],
                'change_percentage' => $this->calculateChangePercentage(
                    $currentPeriod['customers'],
                    $previousPeriod['customers']
                ),
            ],
        ];
    }

    public function getRevenueAnalytics(string $storeId, Carbon $startDate, Carbon $endDate): array
    {
        $dailyRevenue = OrderItem::join('orders', 'order_items.order_id', '=', 'orders.id')
            ->where('order_items.store_id', $storeId)
            ->whereBetween('orders.created_at', [$startDate, $endDate])
            ->whereIn('orders.status', ['processing', 'completed'])
            ->select(
                DB::raw('DATE(orders.created_at) as date'),
                DB::raw('SUM(order_items.total_price) as revenue'),
                DB::raw('COUNT(DISTINCT orders.id) as orders_count')
            )
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->keyBy('date');

        // Fill missing dates with zero values
        $period = collect();
        $current = $startDate->copy();
        while ($current->lte($endDate)) {
            $dateKey = $current->format('Y-m-d');
            $period->put($dateKey, [
                'date' => $dateKey,
                'revenue' => $dailyRevenue->get($dateKey)?->revenue ?? 0,
                'orders_count' => $dailyRevenue->get($dateKey)?->orders_count ?? 0,
            ]);
            $current->addDay();
        }

        return [
            'daily_data' => $period->values(),
            'total_revenue' => $period->sum('revenue'),
            'average_daily_revenue' => $period->avg('revenue'),
            'highest_day' => $period->sortByDesc('revenue')->first(),
            'growth_trend' => $this->calculateGrowthTrend($period->pluck('revenue')),
        ];
    }

    public function getOrderAnalytics(string $storeId, Carbon $startDate, Carbon $endDate): array
    {
        $orderStats = OrderItem::join('orders', 'order_items.order_id', '=', 'orders.id')
            ->where('order_items.store_id', $storeId)
            ->whereBetween('orders.created_at', [$startDate, $endDate])
            ->select(
                'orders.status',
                DB::raw('COUNT(DISTINCT orders.id) as count'),
                DB::raw('SUM(order_items.total_price) as revenue')
            )
            ->groupBy('orders.status')
            ->get()
            ->keyBy('status');

        $statusBreakdown = [
            'pending' => $orderStats->get('pending')?->count ?? 0,
            'processing' => $orderStats->get('processing')?->count ?? 0,
            'completed' => $orderStats->get('completed')?->count ?? 0,
            'cancelled' => $orderStats->get('cancelled')?->count ?? 0,
            'refunded' => $orderStats->get('refunded')?->count ?? 0,
        ];

        $totalOrders = array_sum($statusBreakdown);
        $successfulOrders = $statusBreakdown['processing'] + $statusBreakdown['completed'];

        return [
            'status_breakdown' => $statusBreakdown,
            'total_orders' => $totalOrders,
            'successful_orders' => $successfulOrders,
            'success_rate' => $totalOrders > 0 ? ($successfulOrders / $totalOrders) * 100 : 0,
            'recent_orders' => $this->getRecentOrders($storeId, 5),
        ];
    }

    public function getProductAnalytics(string $storeId, Carbon $startDate, Carbon $endDate): array
    {
        $topProducts = OrderItem::join('orders', 'order_items.order_id', '=', 'orders.id')
            ->where('order_items.store_id', $storeId)
            ->whereBetween('orders.created_at', [$startDate, $endDate])
            ->whereIn('orders.status', ['processing', 'completed'])
            ->select(
                'order_items.product_id',
                'order_items.product_name',
                DB::raw('SUM(order_items.quantity) as units_sold'),
                DB::raw('SUM(order_items.total_price) as revenue'),
                DB::raw('COUNT(DISTINCT orders.user_id) as unique_customers')
            )
            ->groupBy('order_items.product_id', 'order_items.product_name')
            ->orderByDesc('revenue')
            ->limit(10)
            ->get();

        $productPerformance = Product::where('store_id', $storeId)
            ->select(
                'id',
                'name',
                'status',
                'quantity',
                'price',
                DB::raw('(SELECT COUNT(*) FROM order_items WHERE product_id = products.id) as total_orders'),
                DB::raw('(SELECT SUM(quantity) FROM order_items WHERE product_id = products.id) as total_sold'),
                DB::raw('(SELECT SUM(total_price) FROM order_items WHERE product_id = products.id) as total_revenue')
            )
            ->orderByDesc('total_revenue')
            ->get();

        return [
            'top_products' => $topProducts,
            'product_performance' => $productPerformance,
            'inventory_alerts' => $this->getInventoryAlerts($storeId),
            'category_breakdown' => $this->getCategoryBreakdown($storeId, $startDate, $endDate),
        ];
    }

    public function getCustomerAnalytics(string $storeId, Carbon $startDate, Carbon $endDate): array
    {
        $customerStats = OrderItem::join('orders', 'order_items.order_id', '=', 'orders.id')
            ->join('users', 'orders.user_id', '=', 'users.id')
            ->where('order_items.store_id', $storeId)
            ->whereBetween('orders.created_at', [$startDate, $endDate])
            ->whereIn('orders.status', ['processing', 'completed'])
            ->select(
                'users.id',
                'users.name',
                'users.email',
                DB::raw('COUNT(DISTINCT orders.id) as order_count'),
                DB::raw('SUM(order_items.total_price) as total_spent'),
                DB::raw('AVG(order_items.total_price) as avg_order_value'),
                DB::raw('MAX(orders.created_at) as last_order_date')
            )
            ->groupBy('users.id', 'users.name', 'users.email')
            ->orderByDesc('total_spent')
            ->get();

        $newCustomers = Order::join('order_items', 'orders.id', '=', 'order_items.order_id')
            ->where('order_items.store_id', $storeId)
            ->whereBetween('orders.created_at', [$startDate, $endDate])
            ->select('orders.user_id')
            ->distinct()
            ->whereNotExists(function ($query) use ($storeId, $startDate) {
                $query->select(DB::raw(1))
                    ->from('orders as prev_orders')
                    ->join('order_items as prev_items', 'prev_orders.id', '=', 'prev_items.order_id')
                    ->whereColumn('prev_orders.user_id', 'orders.user_id')
                    ->where('prev_items.store_id', $storeId)
                    ->where('prev_orders.created_at', '<', $startDate);
            })
            ->count();

        return [
            'top_customers' => $customerStats->take(10),
            'total_customers' => $customerStats->count(),
            'new_customers' => $newCustomers,
            'repeat_customers' => $customerStats->where('order_count', '>', 1)->count(),
            'customer_lifetime_value' => $customerStats->avg('total_spent'),
            'customer_segments' => $this->getCustomerSegments($customerStats),
        ];
    }

    private function calculatePeriodMetrics(string $storeId, Carbon $startDate, Carbon $endDate): array
    {
        $stats = OrderItem::join('orders', 'order_items.order_id', '=', 'orders.id')
            ->where('order_items.store_id', $storeId)
            ->whereBetween('orders.created_at', [$startDate, $endDate])
            ->whereIn('orders.status', ['processing', 'completed'])
            ->select(
                DB::raw('SUM(order_items.total_price) as revenue'),
                DB::raw('COUNT(DISTINCT orders.id) as orders'),
                DB::raw('COUNT(DISTINCT orders.user_id) as customers')
            )
            ->first();

        return [
            'revenue' => $stats->revenue ?? 0,
            'orders' => $stats->orders ?? 0,
            'customers' => $stats->customers ?? 0,
        ];
    }

    private function calculateChangePercentage($current, $previous): float
    {
        if ($previous == 0) {
            return $current > 0 ? 100.0 : 0.0;
        }

        return (($current - $previous) / $previous) * 100;
    }

    private function calculateGrowthTrend($values): string
    {
        $values = $values->filter()->values();
        if ($values->count() < 2) {
            return 'neutral';
        }

        $firstHalf = $values->take($values->count() / 2)->avg();
        $secondHalf = $values->skip($values->count() / 2)->avg();

        if ($secondHalf > $firstHalf * 1.05) {
            return 'up';
        }
        if ($secondHalf < $firstHalf * 0.95) {
            return 'down';
        }

        return 'neutral';
    }

    private function getRecentOrders(string $storeId, int $limit = 10): array
    {
        return Order::join('order_items', 'orders.id', '=', 'order_items.order_id')
            ->join('users', 'orders.user_id', '=', 'users.id')
            ->where('order_items.store_id', $storeId)
            ->select(
                'orders.id',
                'orders.order_number',
                'orders.status',
                'orders.total_amount',
                'orders.created_at',
                'users.name as customer_name',
                DB::raw('SUM(order_items.total_price) as store_revenue')
            )
            ->groupBy(
                'orders.id',
                'orders.order_number',
                'orders.status',
                'orders.total_amount',
                'orders.created_at',
                'users.name'
            )
            ->orderByDesc('orders.created_at')
            ->limit($limit)
            ->get()
            ->toArray();
    }

    private function getInventoryAlerts(string $storeId): array
    {
        return Product::where('store_id', $storeId)
            ->where('status', 'published')
            ->where('digital_product', false)
            ->where(function ($query) {
                $query->where('quantity', '<=', 5)
                    ->orWhere('quantity', 0);
            })
            ->select('id', 'name', 'quantity', 'price')
            ->orderBy('quantity')
            ->get()
            ->toArray();
    }

    private function getCategoryBreakdown(string $storeId, Carbon $startDate, Carbon $endDate): array
    {
        return OrderItem::join('orders', 'order_items.order_id', '=', 'orders.id')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->join('categories', 'products.category_id', '=', 'categories.id')
            ->where('order_items.store_id', $storeId)
            ->whereBetween('orders.created_at', [$startDate, $endDate])
            ->whereIn('orders.status', ['processing', 'completed'])
            ->select(
                'categories.name as category_name',
                DB::raw('SUM(order_items.quantity) as units_sold'),
                DB::raw('SUM(order_items.total_price) as revenue')
            )
            ->groupBy('categories.id', 'categories.name')
            ->orderByDesc('revenue')
            ->get()
            ->toArray();
    }

    private function getCustomerSegments($customerStats): array
    {
        $segments = [
            'high_value' => $customerStats->where('total_spent', '>=', 50000)->count(), // ₱500+
            'medium_value' => $customerStats->whereBetween('total_spent', [10000, 49999])->count(), // ₱100-₱499
            'low_value' => $customerStats->where('total_spent', '<', 10000)->count(), // < ₱100
            'frequent' => $customerStats->where('order_count', '>=', 5)->count(), // 5+ orders
            'occasional' => $customerStats->whereBetween('order_count', [2, 4])->count(), // 2-4 orders
            'one_time' => $customerStats->where('order_count', 1)->count(), // 1 order
        ];

        return $segments;
    }
}
