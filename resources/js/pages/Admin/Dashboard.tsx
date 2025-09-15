import AdminLayout from '@/layouts/AdminLayout';
import { Head, Link } from '@inertiajs/react';

interface Stats {
    users: {
        total: number;
        merchants: number;
        buyers: number;
        new_this_month: number;
    };
    merchants: {
        total: number;
        pending: number;
        approved: number;
        rejected: number;
        suspended: number;
    };
    stores: {
        total: number;
        active: number;
        pending: number;
        suspended: number;
    };
    products: {
        total: number;
        published: number;
        low_stock: number;
    };
    orders: {
        total: number;
        this_month: number;
        last_month: number;
        growth_percentage: number;
    };
    revenue: {
        total: number;
        this_month: number;
        last_month: number;
        growth_percentage: number;
    };
    payments: {
        completed: number;
        failed: number;
        success_rate: number;
    };
    recent_activities: {
        orders: any[];
        users: any[];
        stores: any[];
    };
}

interface Props {
    stats: Stats;
}

export default function AdminDashboard({ stats }: Props) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
        }).format(amount / 100);
    };

    const formatGrowth = (percentage: number) => {
        const sign = percentage >= 0 ? '+' : '';
        return `${sign}${percentage.toFixed(1)}%`;
    };

    const getGrowthColor = (percentage: number) => {
        return percentage >= 0 ? 'text-green-600' : 'text-red-600';
    };

    return (
        <AdminLayout
            header={
                <div>
                    <h2 className="text-xl leading-tight font-semibold text-gray-800 dark:text-gray-200">Admin Dashboard</h2>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Overview of your marketplace platform</p>
                </div>
            }
        >
            <Head title="Admin Dashboard" />

            <div className="space-y-6">
                {/* Key Metrics */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {/* Users */}
                    <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <span className="text-2xl">👥</span>
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">Total Users</dt>
                                        <dd className="text-lg font-semibold text-gray-900 dark:text-white">
                                            {stats.users.total?.toLocaleString() ?? '0'}
                                        </dd>
                                        <dd className="text-sm text-gray-600 dark:text-gray-400">
                                            {stats.users.merchants ?? 0} merchants, {stats.users.buyers ?? 0} buyers, {stats.users.admins ?? 0} admins
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Merchants */}
                    <div className={`overflow-hidden rounded-lg shadow ${stats.merchants?.pending > 0 ? 'bg-orange-50 border-l-4 border-orange-400 dark:bg-orange-900/20 dark:border-orange-500' : 'bg-white dark:bg-gray-800'}`}>
                        {stats.merchants?.pending > 0 ? (
                            <Link href="/admin/merchants?status=pending" className="block p-5 hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <span className="text-2xl">🏢</span>
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">Merchant Applications</dt>
                                            <dd className="text-lg font-semibold text-gray-900 dark:text-white">
                                                {stats.merchants?.total?.toLocaleString() ?? '0'}
                                            </dd>
                                            <dd className="text-sm text-orange-600 dark:text-orange-400 font-medium">
                                                {stats.merchants?.pending ?? 0} pending approval →
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </Link>
                        ) : (
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <span className="text-2xl">🏢</span>
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">Merchant Applications</dt>
                                            <dd className="text-lg font-semibold text-gray-900 dark:text-white">
                                                {stats.merchants?.total?.toLocaleString() ?? '0'}
                                            </dd>
                                            <dd className="text-sm text-gray-600 dark:text-gray-400">
                                                {stats.merchants?.pending ?? 0} pending approval
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Stores */}
                    <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <span className="text-2xl">🏪</span>
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">Active Stores</dt>
                                        <dd className="text-lg font-semibold text-gray-900 dark:text-white">
                                            {stats.stores.active?.toLocaleString() ?? '0'}
                                        </dd>
                                        <dd className="text-sm text-gray-600 dark:text-gray-400">{stats.stores.pending ?? 0} pending approval</dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Revenue */}
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
                                            {formatCurrency(stats.revenue.total ?? 0)}
                                        </dd>
                                        <dd className={`text-sm ${getGrowthColor(stats.revenue.growth_percentage ?? 0)}`}>
                                            {formatGrowth(stats.revenue.growth_percentage ?? 0)} this month
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Recent Orders */}
                    <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800">
                        <div className="px-4 py-5 sm:p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Recent Orders</h3>
                                <div className="text-right">
                                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                        {stats.orders.total?.toLocaleString() ?? '0'}
                                    </p>
                                    <p className={`text-sm ${getGrowthColor(stats.orders.growth_percentage ?? 0)}`}>
                                        {formatGrowth(stats.orders.growth_percentage ?? 0)} this month
                                    </p>
                                </div>
                            </div>
                            <div className="space-y-3">
                                {(stats.recent_activities?.orders ?? []).map((order) => (
                                    <div key={order.id} className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">#{order.order_number}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{order.user?.name}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(order.total_amount)}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{order.status}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800">
                        <div className="px-4 py-5 sm:p-6">
                            <h3 className="mb-4 text-lg leading-6 font-medium text-gray-900 dark:text-white">Platform Health</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">Pending Merchants</span>
                                    <span className={`text-sm font-medium ${stats.merchants?.pending > 0 ? 'text-orange-600' : 'text-gray-900 dark:text-white'}`}>
                                        {stats.merchants?.pending ?? 0}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">Approved Merchants</span>
                                    <span className="text-sm font-medium text-green-600">{stats.merchants?.approved ?? 0}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">Payment Success Rate</span>
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">{stats.payments?.success_rate ?? 0}%</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">Published Products</span>
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                                        {stats.products.published?.toLocaleString() ?? '0'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">Low Stock Items</span>
                                    <span className="text-sm font-medium text-red-600">{stats.products?.low_stock ?? 0}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">New Users This Month</span>
                                    <span className="text-sm font-medium text-green-600">{stats.users?.new_this_month ?? 0}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
