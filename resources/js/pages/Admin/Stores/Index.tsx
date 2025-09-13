import AdminLayout from '@/layouts/AdminLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

interface Store {
    id: string;
    name: string;
    slug: string;
    description: string;
    status: 'pending' | 'approved' | 'suspended';
    user: {
        id: string;
        name: string;
        email: string;
    };
    products_count: number;
    order_items_count: number;
    created_at: string;
    updated_at: string;
}

interface PaginatedStores {
    data: Store[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: Array<{ url: string | null; label: string; active: boolean }>;
}

interface Props {
    stores: PaginatedStores;
    filters: {
        status?: string;
        search?: string;
    };
}

export default function StoresIndex({ stores, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [loading, setLoading] = useState<string | null>(null);

    const handleSearch = () => {
        router.get('/admin/stores', {
            search: search,
            status: status,
        });
    };

    const handleReset = () => {
        setSearch('');
        setStatus('');
        router.get('/admin/stores');
    };

    const handleStoreAction = (storeId: string, action: 'approve' | 'suspend') => {
        setLoading(storeId);
        const url = action === 'approve' ? `/admin/stores/${storeId}/approve` : `/admin/stores/${storeId}/suspend`;

        router.patch(
            url,
            {},
            {
                onFinish: () => setLoading(null),
            },
        );
    };

    const getStatusBadge = (storeStatus: string) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
            approved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
            suspended: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
        };
        return colors[storeStatus as keyof typeof colors] || 'bg-gray-100 text-gray-800';
    };

    return (
        <AdminLayout
            header={
                <div>
                    <h2 className="text-xl leading-tight font-semibold text-gray-800 dark:text-gray-200">Store Management</h2>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Manage all merchant stores</p>
                </div>
            }
        >
            <Head title="Stores - Admin" />

            <div className="space-y-6">
                {/* Filters */}
                <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Search</label>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by store name or description..."
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            >
                                <option value="">All Statuses</option>
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="suspended">Suspended</option>
                            </select>
                        </div>
                        <div className="flex items-end space-x-2">
                            <button
                                onClick={handleSearch}
                                className="rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
                            >
                                Search
                            </button>
                            <button
                                onClick={handleReset}
                                className="rounded-md bg-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-400 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:outline-none dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500"
                            >
                                Reset
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stores Table */}
                <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800">
                    <div className="px-4 py-5 sm:p-6">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                                            Store
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                                            Owner
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                                            Products
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                                            Sales
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                                            Created
                                        </th>
                                        <th className="relative px-6 py-3">
                                            <span className="sr-only">Actions</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                                    {stores.data.map((store) => (
                                        <tr key={store.id}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">{store.name}</div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">/{store.slug}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">{store.user.name}</div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">{store.user.email}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusBadge(store.status)}`}
                                                >
                                                    {store.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900 dark:text-white">
                                                {store.products_count}
                                            </td>
                                            <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900 dark:text-white">
                                                {store.order_items_count}
                                            </td>
                                            <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
                                                {new Date(store.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-right text-sm font-medium whitespace-nowrap">
                                                <div className="flex space-x-2">
                                                    {store.status === 'pending' && (
                                                        <button
                                                            onClick={() => handleStoreAction(store.id, 'approve')}
                                                            disabled={loading === store.id}
                                                            className="text-green-600 hover:text-green-900 disabled:opacity-50 dark:text-green-400 dark:hover:text-green-300"
                                                        >
                                                            {loading === store.id ? 'Loading...' : 'Approve'}
                                                        </button>
                                                    )}
                                                    {store.status === 'approved' && (
                                                        <button
                                                            onClick={() => handleStoreAction(store.id, 'suspend')}
                                                            disabled={loading === store.id}
                                                            className="text-red-600 hover:text-red-900 disabled:opacity-50 dark:text-red-400 dark:hover:text-red-300"
                                                        >
                                                            {loading === store.id ? 'Loading...' : 'Suspend'}
                                                        </button>
                                                    )}
                                                    {store.status === 'suspended' && (
                                                        <button
                                                            onClick={() => handleStoreAction(store.id, 'approve')}
                                                            disabled={loading === store.id}
                                                            className="text-green-600 hover:text-green-900 disabled:opacity-50 dark:text-green-400 dark:hover:text-green-300"
                                                        >
                                                            {loading === store.id ? 'Loading...' : 'Reactivate'}
                                                        </button>
                                                    )}
                                                    <Link
                                                        href={`/stores/${store.slug}`}
                                                        className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                                                    >
                                                        View
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Pagination */}
                    {stores.last_page > 1 && (
                        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 dark:border-gray-700 dark:bg-gray-800">
                            <div className="flex flex-1 justify-between sm:hidden">
                                {stores.links[0].url && (
                                    <Link
                                        href={stores.links[0].url}
                                        className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                    >
                                        Previous
                                    </Link>
                                )}
                                {stores.links[stores.links.length - 1].url && (
                                    <Link
                                        href={stores.links[stores.links.length - 1].url}
                                        className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                    >
                                        Next
                                    </Link>
                                )}
                            </div>
                            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm text-gray-700 dark:text-gray-300">
                                        Showing <span className="font-medium">{(stores.current_page - 1) * stores.per_page + 1}</span> to{' '}
                                        <span className="font-medium">{Math.min(stores.current_page * stores.per_page, stores.total)}</span> of{' '}
                                        <span className="font-medium">{stores.total}</span> results
                                    </p>
                                </div>
                                <div>
                                    <nav className="relative z-0 inline-flex -space-x-px rounded-md shadow-sm">
                                        {stores.links.map((link, index) => (
                                            <Link
                                                key={index}
                                                href={link.url || '#'}
                                                className={`relative inline-flex items-center border px-2 py-2 text-sm font-medium ${
                                                    link.active
                                                        ? 'z-10 border-indigo-500 bg-indigo-50 text-indigo-600'
                                                        : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
                                                } ${!link.url && 'cursor-not-allowed opacity-50'}`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ))}
                                    </nav>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
