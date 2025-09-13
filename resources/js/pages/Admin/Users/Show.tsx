import AdminLayout from '@/layouts/AdminLayout';
import { User } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';

interface UserStats {
    total_orders: number;
    total_spent: number;
    pending_orders: number;
    completed_orders: number;
    cancelled_orders: number;
}

interface StoreStats {
    total_products: number;
    published_products: number;
    total_sales: number;
    orders_received: number;
}

interface Props {
    user: User & {
        orders: any[];
        store?: any;
        merchant?: any;
    };
    userStats: UserStats;
    storeStats?: StoreStats;
}

export default function UserShow({ user, userStats, storeStats }: Props) {
    const [showMerchantForm, setShowMerchantForm] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        business_name: '',
        business_type: '',
        phone: '',
    });
    const getRoleBadge = (userRole: string) => {
        const colors = {
            admin: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
            merchant: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
            buyer: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
        };
        return colors[userRole as keyof typeof colors] || 'bg-gray-100 text-gray-800';
    };

    const handleCreateMerchant = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/admin/users/${user.id}/make-merchant`, {
            onSuccess: () => {
                setShowMerchantForm(false);
                reset();
            },
        });
    };

    return (
        <AdminLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl leading-tight font-semibold text-gray-800 dark:text-gray-200">User Details</h2>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Detailed information for {user.name}</p>
                    </div>
                    <Link
                        href="/admin/users"
                        className="rounded-md bg-gray-600 px-4 py-2 text-white hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:outline-none"
                    >
                        Back to Users
                    </Link>
                </div>
            }
        >
            <Head title={`${user.name} - User Details - Admin`} />

            <div className="space-y-6">
                {/* User Information */}
                <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                    <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">User Information</h3>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                            <p className="mt-1 text-sm text-gray-900 dark:text-white">{user.name}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                            <p className="mt-1 text-sm text-gray-900 dark:text-white">{user.email}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
                            <span className={`mt-1 inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getRoleBadge(user.role)}`}>
                                {user.role}
                            </span>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Member Since</label>
                            <p className="mt-1 text-sm text-gray-900 dark:text-white">{new Date(user.created_at).toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>

                {/* Merchant Management */}
                {!user.merchant && (
                    <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Merchant Account</h3>
                            <button
                                onClick={() => setShowMerchantForm(!showMerchantForm)}
                                className="rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
                            >
                                {showMerchantForm ? 'Cancel' : 'Create Merchant Account'}
                            </button>
                        </div>

                        {showMerchantForm && (
                            <form onSubmit={handleCreateMerchant} className="space-y-4">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Business Name *</label>
                                        <input
                                            type="text"
                                            value={data.business_name}
                                            onChange={(e) => setData('business_name', e.target.value)}
                                            required
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                        />
                                        {errors.business_name && <p className="mt-1 text-sm text-red-600">{errors.business_name}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Business Type</label>
                                        <select
                                            value={data.business_type}
                                            onChange={(e) => setData('business_type', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                        >
                                            <option value="">Select a type</option>
                                            <option value="Sole Proprietorship">Sole Proprietorship</option>
                                            <option value="LLC">LLC</option>
                                            <option value="Corporation">Corporation</option>
                                            <option value="Partnership">Partnership</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone</label>
                                        <input
                                            type="tel"
                                            value={data.phone}
                                            onChange={(e) => setData('phone', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                        />
                                        {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:outline-none disabled:opacity-50"
                                    >
                                        {processing ? 'Creating...' : 'Create Merchant Account'}
                                    </button>
                                </div>
                            </form>
                        )}

                        {!showMerchantForm && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                This user does not have a merchant account. You can create one to allow them to sell products.
                            </p>
                        )}
                    </div>
                )}

                {user.merchant && (
                    <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Merchant Account</h3>
                            <Link
                                href={`/admin/merchants/${user.merchant.id}`}
                                className="rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
                            >
                                View Merchant Profile
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Business Name</label>
                                <p className="mt-1 text-sm text-gray-900 dark:text-white">{user.merchant.business_name}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                                <span
                                    className={`mt-1 inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                                        user.merchant.status === 'approved'
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                            : user.merchant.status === 'pending'
                                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                                              : user.merchant.status === 'suspended'
                                                ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                                                : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
                                    }`}
                                >
                                    {user.merchant.status}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Order Statistics */}
                <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                    <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">Order Statistics</h3>
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{userStats.total_orders}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Total Orders</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{userStats.completed_orders}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Completed</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{userStats.pending_orders}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Pending</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{userStats.cancelled_orders}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Cancelled</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">${userStats.total_spent.toFixed(2)}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Total Spent</p>
                        </div>
                    </div>
                </div>

                {/* Store Statistics (if merchant) */}
                {storeStats && (
                    <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                        <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">Store Statistics</h3>
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{storeStats.total_products}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Total Products</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{storeStats.published_products}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Published</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{storeStats.orders_received}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Orders Received</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">${storeStats.total_sales.toFixed(2)}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Total Sales</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Recent Orders */}
                {user.orders && user.orders.length > 0 && (
                    <div className="rounded-lg bg-white shadow dark:bg-gray-800">
                        <div className="px-4 py-5 sm:p-6">
                            <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">Recent Orders</h3>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                                                Order #
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
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                                        {user.orders.slice(0, 10).map((order) => (
                                            <tr key={order.id}>
                                                <td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-900 dark:text-white">
                                                    {order.order_number}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span
                                                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                                                            order.status === 'completed'
                                                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                                                : order.status === 'pending'
                                                                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                                                                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                                                        }`}
                                                    >
                                                        {order.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900 dark:text-white">
                                                    ${order.total?.toFixed(2) || '0.00'}
                                                </td>
                                                <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
                                                    {new Date(order.created_at).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
