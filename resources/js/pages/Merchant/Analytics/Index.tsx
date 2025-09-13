import MerchantLayout from '@/layouts/MerchantLayout';
import { Head } from '@inertiajs/react';
import { useState } from 'react';

interface Analytics {
    overview: {
        total_revenue: {
            current: number;
            previous: number;
            change_percentage: number;
        };
        total_orders: {
            current: number;
            previous: number;
            change_percentage: number;
        };
        average_order_value: {
            current: number;
            previous: number;
        };
        total_customers: {
            current: number;
            previous: number;
            change_percentage: number;
        };
    };
    revenue: {
        daily_data: Array<{
            date: string;
            revenue: number;
            orders_count: number;
        }>;
        total_revenue: number;
        average_daily_revenue: number;
        highest_day: {
            date: string;
            revenue: number;
            orders_count: number;
        };
        growth_trend: string;
    };
    orders: {
        status_breakdown: Record<string, number>;
        total_orders: number;
        successful_orders: number;
        success_rate: number;
        recent_orders: any[];
    };
    products: {
        top_products: any[];
        product_performance: Array<{
            id: string;
            name: string;
            status: string;
            quantity: number;
            price: number;
            total_orders: number;
            total_sold: number | null;
            total_revenue: number | null;
        }>;
        inventory_alerts: any[];
        category_breakdown: any[];
    };
    customers: {
        top_customers: any[];
        total_customers: number;
        new_customers: number;
        repeat_customers: number;
        customer_lifetime_value: number | null;
        customer_segments: Record<string, number>;
    };
}

interface Store {
    id: string;
    name: string;
    status: string;
}

interface DateRange {
    start: string;
    end: string;
}

interface AnalyticsIndexProps {
    analytics: Analytics;
    dateRange: DateRange;
    store: Store;
}

export default function AnalyticsIndex({ analytics, dateRange, store }: AnalyticsIndexProps) {
    const [selectedPeriod, setSelectedPeriod] = useState('current_month');

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
        }).format(amount);
    };

    const getChangeColor = (percentage: number) => {
        if (percentage > 0) return 'text-green-600';
        if (percentage < 0) return 'text-red-600';
        return 'text-gray-600';
    };

    const getChangeIcon = (percentage: number) => {
        if (percentage > 0) return '↗';
        if (percentage < 0) return '↘';
        return '→';
    };

    return (
        <MerchantLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl leading-tight font-semibold text-gray-800 dark:text-gray-200">Analytics - {store.name}</h2>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(dateRange.start).toLocaleDateString()} - {new Date(dateRange.end).toLocaleDateString()}
                    </div>
                </div>
            }
        >
            <Head title="Analytics" />

            <div className="space-y-6">
                {/* Overview Cards */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-gray-800">
                        <div className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                        {formatCurrency(analytics.overview.total_revenue.current)}
                                    </p>
                                    <p className={`text-sm ${getChangeColor(analytics.overview.total_revenue.change_percentage)}`}>
                                        {getChangeIcon(analytics.overview.total_revenue.change_percentage)}{' '}
                                        {analytics.overview.total_revenue.change_percentage.toFixed(1)}% from previous period
                                    </p>
                                </div>
                                <div className="text-3xl">💰</div>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-gray-800">
                        <div className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Orders</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                        {analytics.overview.total_orders.current.toLocaleString()}
                                    </p>
                                    <p className={`text-sm ${getChangeColor(analytics.overview.total_orders.change_percentage)}`}>
                                        {getChangeIcon(analytics.overview.total_orders.change_percentage)}{' '}
                                        {analytics.overview.total_orders.change_percentage.toFixed(1)}% from previous period
                                    </p>
                                </div>
                                <div className="text-3xl">📦</div>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-gray-800">
                        <div className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg. Order Value</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                        {formatCurrency(analytics.overview.average_order_value.current)}
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Previous: {formatCurrency(analytics.overview.average_order_value.previous)}
                                    </p>
                                </div>
                                <div className="text-3xl">📊</div>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-gray-800">
                        <div className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Customers</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                        {analytics.overview.total_customers.current.toLocaleString()}
                                    </p>
                                    <p className={`text-sm ${getChangeColor(analytics.overview.total_customers.change_percentage)}`}>
                                        {getChangeIcon(analytics.overview.total_customers.change_percentage)}{' '}
                                        {analytics.overview.total_customers.change_percentage.toFixed(1)}% from previous period
                                    </p>
                                </div>
                                <div className="text-3xl">👥</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Revenue Trend */}
                <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-gray-800">
                    <div className="p-6">
                        <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-gray-100">Revenue Trend</h3>
                        <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</p>
                                <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                    {formatCurrency(analytics.revenue.total_revenue)}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Average Daily</p>
                                <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                    {formatCurrency(analytics.revenue.average_daily_revenue)}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Best Day</p>
                                <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                    {formatCurrency(analytics.revenue.highest_day.revenue)}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {new Date(analytics.revenue.highest_day.date).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                        <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                            📈 Revenue chart would be displayed here (requires chart library)
                        </div>
                    </div>
                </div>

                {/* Orders Status */}
                <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-gray-800">
                    <div className="p-6">
                        <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-gray-100">Order Status Breakdown</h3>
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
                            {Object.entries(analytics.orders.status_breakdown).map(([status, count]) => (
                                <div key={status} className="text-center">
                                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{count}</p>
                                    <p className="text-sm text-gray-600 capitalize dark:text-gray-400">{status}</p>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-700">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">Success Rate:</span>
                                <span className="font-medium text-gray-900 dark:text-gray-100">{analytics.orders.success_rate}%</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Product Performance */}
                <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-gray-800">
                    <div className="p-6">
                        <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-gray-100">Product Performance</h3>
                        {analytics.products.product_performance.length === 0 ? (
                            <p className="py-8 text-center text-gray-500 dark:text-gray-400">No product data available</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 dark:bg-gray-900">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                                                Product
                                            </th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                                                Status
                                            </th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                                                Price
                                            </th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                                                Orders
                                            </th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                                                Revenue
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {analytics.products.product_performance.map((product) => (
                                            <tr key={product.id}>
                                                <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">{product.name}</td>
                                                <td className="px-4 py-2 text-sm text-gray-600 capitalize dark:text-gray-400">{product.status}</td>
                                                <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">
                                                    {formatCurrency(product.price)}
                                                </td>
                                                <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">{product.total_orders}</td>
                                                <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">
                                                    {product.total_revenue ? formatCurrency(product.total_revenue) : '-'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                {/* Customer Insights */}
                <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-gray-800">
                    <div className="p-6">
                        <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-gray-100">Customer Insights</h3>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div>
                                <h4 className="mb-3 text-sm font-medium text-gray-600 dark:text-gray-400">Customer Stats</h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Total Customers:</span>
                                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                            {analytics.customers.total_customers}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">New Customers:</span>
                                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                            {analytics.customers.new_customers}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Repeat Customers:</span>
                                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                            {analytics.customers.repeat_customers}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Avg. Lifetime Value:</span>
                                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                            {analytics.customers.customer_lifetime_value
                                                ? formatCurrency(analytics.customers.customer_lifetime_value)
                                                : '-'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h4 className="mb-3 text-sm font-medium text-gray-600 dark:text-gray-400">Customer Segments</h4>
                                <div className="space-y-2">
                                    {Object.entries(analytics.customers.customer_segments).map(([segment, count]) => (
                                        <div key={segment} className="flex justify-between">
                                            <span className="text-sm text-gray-600 capitalize dark:text-gray-400">{segment.replace('_', ' ')}:</span>
                                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{count}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MerchantLayout>
    );
}
