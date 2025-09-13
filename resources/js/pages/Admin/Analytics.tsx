import AdminLayout from '@/layouts/AdminLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

interface Analytics {
    daily_data: Array<{
        date: string;
        orders: number;
        customers: number;
        revenue: number;
    }>;
    top_stores: Array<{
        id: string;
        name: string;
        total_revenue: number;
        total_orders: number;
    }>;
    category_performance: Array<{
        id: string;
        name: string;
        revenue: number;
        units_sold: number;
        products_count: number;
    }>;
    summary: {
        total_revenue: number;
        total_orders: number;
        total_customers: number;
        average_daily_revenue: number;
    };
}

interface Props {
    analytics: Analytics;
    dateRange: {
        start: string;
        end: string;
    };
}

export default function AdminAnalytics({ analytics, dateRange }: Props) {
    const [startDate, setStartDate] = useState(dateRange.start);
    const [endDate, setEndDate] = useState(dateRange.end);

    const handleFilter = () => {
        router.get('/admin/analytics', {
            start_date: startDate,
            end_date: endDate,
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
        }).format(amount / 100);
    };

    return (
        <AdminLayout
            header={
                <div>
                    <h2 className="text-xl leading-tight font-semibold text-gray-800 dark:text-gray-200">Platform Analytics</h2>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Comprehensive analytics for the marketplace platform</p>
                </div>
            }
        >
            <Head title="Analytics - Admin" />

            <div className="space-y-6">
                {/* Date Range Filter */}
                <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Start Date</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">End Date</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                        <div className="flex items-end">
                            <button
                                onClick={handleFilter}
                                className="rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
                            >
                                Apply Filter
                            </button>
                        </div>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <span className="text-2xl">💰</span>
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">Total Revenue</dt>
                                        <dd className="text-lg font-semibold text-gray-900 dark:text-white">
                                            {formatCurrency(analytics.summary.total_revenue)}
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <span className="text-2xl">📦</span>
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">Total Orders</dt>
                                        <dd className="text-lg font-semibold text-gray-900 dark:text-white">
                                            {analytics.summary.total_orders.toLocaleString()}
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <span className="text-2xl">👥</span>
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">Total Customers</dt>
                                        <dd className="text-lg font-semibold text-gray-900 dark:text-white">
                                            {analytics.summary.total_customers.toLocaleString()}
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <span className="text-2xl">📊</span>
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">Avg Daily Revenue</dt>
                                        <dd className="text-lg font-semibold text-gray-900 dark:text-white">
                                            {formatCurrency(analytics.summary.average_daily_revenue)}
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Top Performing Stores */}
                    <div className="rounded-lg bg-white shadow dark:bg-gray-800">
                        <div className="px-4 py-5 sm:p-6">
                            <h3 className="mb-4 text-lg leading-6 font-medium text-gray-900 dark:text-white">Top Performing Stores</h3>
                            <div className="space-y-3">
                                {analytics.top_stores.map((store, index) => (
                                    <div key={store.id} className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0">
                                                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-sm font-medium text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300">
                                                    #{index + 1}
                                                </span>
                                            </div>
                                            <div className="ml-3">
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">{store.name}</p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">{store.total_orders} orders</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(store.total_revenue)}</p>
                                        </div>
                                    </div>
                                ))}
                                {analytics.top_stores.length === 0 && (
                                    <p className="text-sm text-gray-500 dark:text-gray-400">No store data available.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Category Performance */}
                    <div className="rounded-lg bg-white shadow dark:bg-gray-800">
                        <div className="px-4 py-5 sm:p-6">
                            <h3 className="mb-4 text-lg leading-6 font-medium text-gray-900 dark:text-white">Category Performance</h3>
                            <div className="space-y-3">
                                {analytics.category_performance.map((category, index) => (
                                    <div key={category.id} className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0">
                                                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-sm font-medium text-green-600 dark:bg-green-900 dark:text-green-300">
                                                    #{index + 1}
                                                </span>
                                            </div>
                                            <div className="ml-3">
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">{category.name}</p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">{category.units_sold} units sold</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(category.revenue)}</p>
                                        </div>
                                    </div>
                                ))}
                                {analytics.category_performance.length === 0 && (
                                    <p className="text-sm text-gray-500 dark:text-gray-400">No category data available.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Daily Data Table */}
                <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800">
                    <div className="px-4 py-5 sm:p-6">
                        <h3 className="mb-4 text-lg leading-6 font-medium text-gray-900 dark:text-white">Daily Performance</h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                                            Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                                            Orders
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                                            Customers
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                                            Revenue
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                                    {analytics.daily_data.map((day) => (
                                        <tr key={day.date}>
                                            <td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-900 dark:text-white">
                                                {new Date(day.date).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900 dark:text-white">{day.orders}</td>
                                            <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900 dark:text-white">{day.customers}</td>
                                            <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900 dark:text-white">
                                                {formatCurrency(day.revenue)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
