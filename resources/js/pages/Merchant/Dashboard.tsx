import MerchantLayout from '@/layouts/MerchantLayout';
import { Head } from '@inertiajs/react';

interface Stats {
    store: {
        name: string;
        status: 'pending' | 'approved' | 'suspended';
        products_count: number;
        published_products: number;
    } | null;
    orders: {
        total: number;
        pending: number;
        processing: number;
        completed: number;
        this_month: number;
        growth_percentage: number;
    };
    revenue: {
        total: number;
        this_month: number;
        last_month: number;
        growth_percentage: number;
    };
    products: {
        total: number;
        published: number;
        draft: number;
        low_stock: number;
    };
    recent_orders: any[];
    low_stock_products: any[];
}

interface Props {
    stats: Stats;
}

export default function MerchantDashboard({ stats }: Props) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
        }).format(amount);
    };

    const formatGrowth = (percentage: number) => {
        const sign = percentage >= 0 ? '+' : '';
        return `${sign}${percentage.toFixed(1)}%`;
    };

    const getGrowthColor = (percentage: number) => {
        return percentage >= 0 ? 'text-green-600' : 'text-red-600';
    };

    const getStatusBadge = (status: string) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
            approved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
            suspended: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
        };
        return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
    };

    return (
        <MerchantLayout
            header={
                <div>
                    <h2 className="text-xl leading-tight font-semibold text-gray-800 dark:text-gray-200">Dashboard</h2>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Welcome to your merchant dashboard</p>
                </div>
            }
        >
            <Head title="Merchant Dashboard" />

            <div className="space-y-6">
                {/* Store Status Alert */}
                {stats.store && stats.store.status !== 'approved' && (
                    <div className="rounded-md border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900">
                        <div className="flex">
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Store Status: {stats.store.status}</h3>
                                <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                                    {stats.store.status === 'pending' && (
                                        <p>Your store is pending approval. You can continue setting up products while we review your application.</p>
                                    )}
                                    {stats.store.status === 'suspended' && (
                                        <p>Your store has been suspended. Please contact support for more information.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* No Store Alert */}
                {!stats.store && (
                    <div className="rounded-md border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900">
                        <div className="flex">
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">Create Your Store</h3>
                                <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                                    <p>You haven't created a store yet. Set up your store to start selling products.</p>
                                </div>
                                <div className="mt-4">
                                    <a
                                        href="/merchant/store/create"
                                        className="rounded-md bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"
                                    >
                                        Create Store
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Key Metrics */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
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
                                        <dd className="text-lg font-semibold text-gray-900 dark:text-white">{formatCurrency(stats.revenue.total)}</dd>
                                        <dd className={`text-sm ${getGrowthColor(stats.revenue.growth_percentage)}`}>
                                            {formatGrowth(stats.revenue.growth_percentage)} this month
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Orders */}
                    <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <span className="text-2xl">📦</span>
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">Total Orders</dt>
                                        <dd className="text-lg font-semibold text-gray-900 dark:text-white">{stats.orders.total.toLocaleString()}</dd>
                                        <dd className={`text-sm ${getGrowthColor(stats.orders.growth_percentage)}`}>
                                            {formatGrowth(stats.orders.growth_percentage)} this month
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Products */}
                    <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <span className="text-2xl">📋</span>
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">Published Products</dt>
                                        <dd className="text-lg font-semibold text-gray-900 dark:text-white">
                                            {stats.products.published} / {stats.products.total}
                                        </dd>
                                        <dd className="text-sm text-gray-600 dark:text-gray-400">{stats.products.draft} drafts</dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Store Status */}
                    <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <span className="text-2xl">🏪</span>
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">Store Status</dt>
                                        <dd className="text-lg font-semibold text-gray-900 dark:text-white">
                                            {stats.store ? (
                                                <span
                                                    className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusBadge(stats.store.status)}`}
                                                >
                                                    {stats.store.status}
                                                </span>
                                            ) : (
                                                <span className="text-red-600">No store</span>
                                            )}
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
                            <h3 className="mb-4 text-lg leading-6 font-medium text-gray-900 dark:text-white">Recent Orders</h3>
                            {stats.recent_orders.length > 0 ? (
                                <div className="space-y-3">
                                    {stats.recent_orders.map((order) => (
                                        <div key={order.id} className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">#{order.order_number}</p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">{order.user?.name}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {formatCurrency(order.total_amount)}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">{order.status}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500 dark:text-gray-400">No orders yet.</p>
                            )}
                        </div>
                    </div>

                    {/* Low Stock Alert */}
                    <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800">
                        <div className="px-4 py-5 sm:p-6">
                            <h3 className="mb-4 text-lg leading-6 font-medium text-gray-900 dark:text-white">Low Stock Alert</h3>
                            {stats.low_stock_products.length > 0 ? (
                                <div className="space-y-3">
                                    {stats.low_stock_products.map((product) => (
                                        <div key={product.id} className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">{product.name}</p>
                                                <p className="text-sm text-red-600">Only {product.quantity} left</p>
                                            </div>
                                            <a
                                                href={`/merchant/products/${product.id}/edit`}
                                                className="text-sm font-medium text-indigo-600 hover:text-indigo-900"
                                            >
                                                Update
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500 dark:text-gray-400">All products are well stocked.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                    <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">Quick Actions</h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <a
                            href="/merchant/products/create"
                            className="flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                        >
                            📦 Add Product
                        </a>
                        <a
                            href="/merchant/orders"
                            className="flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                        >
                            📋 View Orders
                        </a>
                        <a
                            href="/merchant/analytics"
                            className="flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                        >
                            📈 Analytics
                        </a>
                        <a
                            href="/merchant/store/edit"
                            className="flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                        >
                            🏪 Store Settings
                        </a>
                    </div>
                </div>
            </div>
        </MerchantLayout>
    );
}
