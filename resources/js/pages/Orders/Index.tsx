import StorefrontLayout from '@/layouts/StorefrontLayout';
import { Head, Link } from '@inertiajs/react';

interface Order {
    id: string;
    order_number: string;
    status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'refunded';
    total_amount: number | string;
    created_at: string;
}

interface PaginatedOrders {
    data: Order[];
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
}

interface Props {
    orders: PaginatedOrders;
}

export default function OrdersIndex({ orders }: Props) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
        }).format(amount / 100);
    };

    const getStatusBadge = (status: Order['status']) => {
        const badges = {
            pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
            processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
            completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
            cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
            refunded: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
        };

        return badges[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    };

    return (
        <StorefrontLayout>
            <Head title="My Orders" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-gray-800">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            <div className="mb-6">
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">My Orders</h1>
                                <p className="text-gray-600 dark:text-gray-400">View and manage your order history</p>
                            </div>

                            {orders.data.length === 0 ? (
                                <div className="py-12 text-center">
                                    <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-gray-100 p-4 dark:bg-gray-700">
                                        <svg
                                            className="h-8 w-8 text-gray-400 dark:text-gray-500"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                                            />
                                        </svg>
                                    </div>
                                    <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-gray-100">No orders yet</h3>
                                    <p className="mb-6 text-gray-500 dark:text-gray-400">Start shopping to see your orders here</p>
                                    <Link
                                        href="/"
                                        className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                                    >
                                        Shop Now
                                    </Link>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                        <thead className="bg-gray-50 dark:bg-gray-700">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                                                    Order
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                                                    Status
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                                                    Total
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                                                    Date
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                                            {orders.data.map((order) => (
                                                <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                            {order.order_number}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span
                                                            className={`inline-flex rounded-full px-2 text-xs leading-5 font-semibold ${getStatusBadge(order.status)}`}
                                                        >
                                                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900 dark:text-gray-100">
                                                            {formatCurrency(Number(order.total_amount))}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                                            {new Date(order.created_at).toLocaleDateString()}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                                                        <Link
                                                            href={`/orders/${order.id}`}
                                                            className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                                                        >
                                                            View Details
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </StorefrontLayout>
    );
}
