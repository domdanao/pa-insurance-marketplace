import StorefrontLayout from '@/layouts/StorefrontLayout';
import { Head, Link } from '@inertiajs/react';

interface Order {
    id: string;
    order_number: string;
    status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'refunded';
    total_amount: number | string;
    created_at: string;
}

interface Product {
    id: string;
    name: string;
    price: number;
    image?: string;
    store: {
        id: string;
        name: string;
    };
}

interface DashboardStats {
    total_orders: number;
    pending_orders: number;
    completed_orders: number;
    total_spent: number;
}

interface Props {
    stats: DashboardStats;
    recent_orders: Order[];
    featured_products: Product[];
    user: {
        id: string;
        name: string;
        email: string;
    };
}

export default function BuyerDashboard({ user, stats, recent_orders, featured_products }: Props) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
        }).format(amount);
    };

    const getStatusBadge = (status: string) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
            processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
            completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
            cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
            refunded: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
        };
        return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
    };

    return (
        <StorefrontLayout>
            <Head title="Dashboard" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome back, {user.name}!</h1>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">Here's what's happening with your orders and shopping.</p>
                    </div>

                    <div className="space-y-8">
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                            <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800">
                                <div className="p-5">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <span className="text-2xl">📦</span>
                                        </div>
                                        <div className="ml-5 w-0 flex-1">
                                            <dl>
                                                <dt className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">Total Orders</dt>
                                                <dd className="text-lg font-semibold text-gray-900 dark:text-white">{stats.total_orders}</dd>
                                            </dl>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800">
                                <div className="p-5">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <span className="text-2xl">⏳</span>
                                        </div>
                                        <div className="ml-5 w-0 flex-1">
                                            <dl>
                                                <dt className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">Pending Orders</dt>
                                                <dd className="text-lg font-semibold text-yellow-600">{stats.pending_orders}</dd>
                                            </dl>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800">
                                <div className="p-5">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <span className="text-2xl">✅</span>
                                        </div>
                                        <div className="ml-5 w-0 flex-1">
                                            <dl>
                                                <dt className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">Completed Orders</dt>
                                                <dd className="text-lg font-semibold text-green-600">{stats.completed_orders}</dd>
                                            </dl>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800">
                                <div className="p-5">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <span className="text-2xl">💰</span>
                                        </div>
                                        <div className="ml-5 w-0 flex-1">
                                            <dl>
                                                <dt className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">Total Spent</dt>
                                                <dd className="text-lg font-semibold text-gray-900 dark:text-white">
                                                    {formatCurrency(stats.total_spent)}
                                                </dd>
                                            </dl>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                            {/* Recent Orders */}
                            <div className="rounded-lg bg-white shadow dark:bg-gray-800">
                                <div className="px-4 py-5 sm:p-6">
                                    <div className="mb-4 flex items-center justify-between">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Recent Orders</h3>
                                        <Link
                                            href="/orders"
                                            className="text-sm text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                                        >
                                            View all
                                        </Link>
                                    </div>
                                    <div className="space-y-3">
                                        {recent_orders?.length > 0 ? (
                                            recent_orders.map((order) => (
                                                <div key={order.id} className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900 dark:text-white">#{order.order_number}</p>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                                            {new Date(order.created_at).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span
                                                            className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusBadge(order.status)}`}
                                                        >
                                                            {order.status}
                                                        </span>
                                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                            {formatCurrency(Number(order.total_amount) / 100)}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-sm text-gray-500 dark:text-gray-400">No orders yet.</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Featured Products */}
                            <div className="rounded-lg bg-white shadow dark:bg-gray-800">
                                <div className="px-4 py-5 sm:p-6">
                                    <div className="mb-4 flex items-center justify-between">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Featured Products</h3>
                                        <Link
                                            href="/products"
                                            className="text-sm text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                                        >
                                            Browse all
                                        </Link>
                                    </div>
                                    <div className="space-y-3">
                                        {featured_products?.length > 0 ? (
                                            featured_products.map((product) => (
                                                <div key={product.id} className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900 dark:text-white">{product.name}</p>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">by {product.store.name}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                            {formatCurrency(product.price)}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-sm text-gray-500 dark:text-gray-400">No featured products available.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </StorefrontLayout>
    );
}
