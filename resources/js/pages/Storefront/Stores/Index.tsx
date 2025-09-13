import StorefrontLayout from '@/layouts/StorefrontLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

interface Store {
    id: string;
    name: string;
    slug: string;
    description: string;
    logo?: string;
    banner?: string;
    products_count: number;
    created_at: string;
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
        search?: string;
    };
}

export default function StorefrontStoresIndex({ stores, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');

    const handleFilter = () => {
        router.get('/stores', {
            search: search || undefined,
        });
    };

    const handleReset = () => {
        setSearch('');
        router.get('/stores');
    };

    return (
        <StorefrontLayout>
            <Head title="Stores - Marketplace" />

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Browse Stores</h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">Discover amazing stores in our marketplace</p>
                </div>

                {/* Search */}
                <div className="mb-8">
                    <div className="max-w-md">
                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Search Stores</label>
                        <div className="flex space-x-2">
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search stores..."
                                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
                            />
                            <button
                                onClick={handleFilter}
                                className="rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
                            >
                                Search
                            </button>
                            {search && (
                                <button
                                    onClick={handleReset}
                                    className="rounded-md bg-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-400 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500"
                                >
                                    Reset
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Stores Grid */}
                {stores.data.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {stores.data.map((store) => (
                            <div key={store.id} className="overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800">
                                {/* Store Banner */}
                                <div className="h-32 bg-gradient-to-r from-indigo-500 to-purple-600">
                                    {store.banner && <img src={store.banner} alt={`${store.name} banner`} className="h-full w-full object-cover" />}
                                </div>

                                {/* Store Info */}
                                <div className="p-6">
                                    {/* Store Logo */}
                                    <div className="mb-4 flex items-start justify-between">
                                        <div className="flex items-center">
                                            {store.logo ? (
                                                <img
                                                    src={store.logo}
                                                    alt={`${store.name} logo`}
                                                    className="h-12 w-12 rounded-full bg-white object-cover shadow-sm"
                                                />
                                            ) : (
                                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
                                                    <span className="text-lg font-semibold text-gray-600 dark:text-gray-300">
                                                        {store.name.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                            )}
                                            <div className="ml-3">
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{store.name}</h3>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    {store.products_count} {store.products_count === 1 ? 'product' : 'products'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Store Description */}
                                    <p className="mb-4 line-clamp-3 text-sm text-gray-600 dark:text-gray-400">
                                        {store.description || 'No description available.'}
                                    </p>

                                    {/* Actions */}
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                            Joined {new Date(store.created_at).toLocaleDateString()}
                                        </span>
                                        <Link
                                            href={`/stores/${store.slug}`}
                                            className="rounded-md bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
                                        >
                                            Visit Store
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-12 text-center">
                        <div className="mx-auto mb-4 h-12 w-12 text-gray-400">🏪</div>
                        <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">No stores found</h3>
                        <p className="text-gray-500 dark:text-gray-400">
                            {search ? 'Try adjusting your search criteria.' : 'No stores are currently available.'}
                        </p>
                        {search && (
                            <button onClick={handleReset} className="mt-4 font-medium text-indigo-600 hover:text-indigo-800">
                                Clear search
                            </button>
                        )}
                    </div>
                )}

                {/* Pagination */}
                {stores.last_page > 1 && (
                    <div className="mt-8 flex justify-center">
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
                )}
            </div>
        </StorefrontLayout>
    );
}
