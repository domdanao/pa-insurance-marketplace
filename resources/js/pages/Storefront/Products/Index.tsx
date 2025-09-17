import StorefrontLayout from '@/layouts/StorefrontLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

interface Product {
    id: string;
    name: string;
    slug: string;
    price: number;
    images?: string[];
    description: string;
    store: {
        id: string;
        name: string;
        slug: string;
    };
    category: {
        id: string;
        name: string;
        slug: string;
    };
}

interface PaginatedProducts {
    data: Product[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: Array<{ url: string | null; label: string; active: boolean }>;
}

interface Props {
    products: PaginatedProducts;
    filters: {
        sort?: string;
    };
    cardLayout?: 'vertical' | 'horizontal';
}

export default function StorefrontProductsIndex({ products, filters, cardLayout = 'vertical' }: Props) {
    const [sort, setSort] = useState(filters.sort || 'newest');

    const handleSortChange = (newSort: string) => {
        setSort(newSort);
        router.get('/products', {
            sort: newSort !== 'newest' ? newSort : undefined,
        });
    };
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
        }).format(amount);
    };

    const renderVerticalCard = (product: Product) => (
        <div key={product.id} className="overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800">
            <div className="aspect-square bg-gray-200 dark:bg-gray-700">
                {product.images && product.images.length > 0 ? (
                    <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
                ) : (
                    <div className="flex h-full w-full items-center justify-center">
                        <span className="text-gray-400">No Image</span>
                    </div>
                )}
            </div>
            <div className="p-4">
                <h3 className="mb-2 line-clamp-2 font-semibold text-gray-900 dark:text-white">{product.name}</h3>
                <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">by {product.store.name}</p>
                <p className="mb-3 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">{product.description}</p>
                <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{formatCurrency(product.price)}</span>
                    <Link
                        href={`/products/${product.slug}`}
                        className="rounded-md bg-indigo-600 px-3 py-1 text-sm text-white hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
                    >
                        View
                    </Link>
                </div>
            </div>
        </div>
    );

    const renderHorizontalCard = (product: Product) => (
        <div
            key={product.id}
            className="overflow-hidden rounded-lg border-[0.5px] bg-gray-50 shadow transition-shadow hover:shadow-lg dark:bg-gray-800"
        >
            <div className="flex">
                <div className="bg-white p-2">
                    {product.images && product.images.length > 0 ? (
                        <div className="flex h-full items-center bg-white px-2">
                            <img src={product.images[0]} alt={product.name} className="h-24 w-24" />
                        </div>
                    ) : (
                        <div>NO IMAGE</div>
                    )}
                </div>
                <div className="flex flex-1 flex-col px-5 pt-5 pb-5">
                    <div className="mb-6 flex-1 space-y-2">
                        <h3 className="line-clamp-2 text-lg font-bold text-gray-900 dark:text-white">{product.name}</h3>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">by {product.store.name}</p>
                        <p className="line-clamp-2 text-sm text-gray-500 dark:text-gray-400">{product.description}</p>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{formatCurrency(product.price)}</span>
                        <Link
                            href={`/products/${product.slug}`}
                            className="flex-shrink-0 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
                        >
                            Details
                        </Link>
                    </div>
                </div>
                {/* <div className="h-full w-1/2 flex-shrink-0 bg-gray-100 dark:bg-gray-700">
                    {product.images && product.images.length > 0 ? (
                        <div className="flex h-full w-full items-center justify-center rounded-md bg-gray-100 dark:bg-gray-600">
                            <img src={product.images[0]} alt={product.name} className="rounded-md object-cover" />
                        </div>
                    ) : (
                        <div className="flex h-full w-full items-center justify-center rounded-md bg-gray-100 dark:bg-gray-600">
                            <span className="text-sm text-gray-400">No Image</span>
                        </div>
                    )}
                </div>
                <div className="flex flex-1 flex-col px-5 pt-5 pb-5">
                    <div className="mb-6 flex-1 space-y-2">
                        <h3 className="line-clamp-2 text-lg font-bold text-gray-900 dark:text-white">{product.name}</h3>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">by {product.store.name}</p>
                        <p className="line-clamp-2 text-sm text-gray-500 dark:text-gray-400">{product.description}</p>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{formatCurrency(product.price)}</span>
                        <Link
                            href={`/products/${product.slug}`}
                            className="flex-shrink-0 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
                        >
                            Details
                        </Link>
                    </div>
                </div> */}
            </div>
        </div>
    );

    return (
        <StorefrontLayout>
            <Head title="Products - Marketplace" />

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Header */}
                {/* <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Products</h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">Shop our collection</p>
                </div> */}

                <div className="flex flex-col gap-8">
                    {/* Products Grid */}
                    <div className="w-full">
                        {/* Sort Options */}
                        <div className="mb-6 flex items-center justify-between">
                            <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                Showing {products.data.length} of {products.total} products
                            </p>
                            <select
                                value={sort}
                                onChange={(e) => handleSortChange(e.target.value)}
                                className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            >
                                <option value="newest">Newest</option>
                                <option value="name">Name A-Z</option>
                                <option value="price_asc">Price: Low to High</option>
                                <option value="price_desc">Price: High to Low</option>
                            </select>
                        </div>

                        {/* Products Grid */}
                        {products.data.length > 0 ? (
                            <div
                                className={`grid grid-cols-1 gap-6 ${cardLayout === 'horizontal' ? 'sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3' : 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}
                            >
                                {products.data.map((product) =>
                                    cardLayout === 'horizontal' ? renderHorizontalCard(product) : renderVerticalCard(product),
                                )}
                            </div>
                        ) : (
                            <div className="py-12 text-center">
                                <p className="text-lg text-gray-500 dark:text-gray-400">No products found matching your criteria.</p>
                                <Link href="/products" className="mt-4 font-medium text-indigo-600 hover:text-indigo-800">
                                    View all products
                                </Link>
                            </div>
                        )}

                        {/* Pagination */}
                        {products.last_page > 1 && (
                            <div className="mt-8 flex justify-center">
                                <nav className="relative z-0 inline-flex -space-x-px rounded-md shadow-sm">
                                    {products.links.map((link, index) => (
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
                </div>
            </div>
        </StorefrontLayout>
    );
}
