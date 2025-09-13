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

interface Category {
    id: string;
    name: string;
    slug: string;
    products_count: number;
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
    categories: Category[];
    filters: {
        search?: string;
        category?: string;
        price_min?: number;
        price_max?: number;
        digital_only?: boolean;
        sort?: string;
    };
}

export default function StorefrontProductsIndex({ products, categories, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [selectedCategory, setSelectedCategory] = useState(filters.category || '');
    const [priceMin, setPriceMin] = useState(filters.price_min || '');
    const [priceMax, setPriceMax] = useState(filters.price_max || '');
    const [digitalOnly, setDigitalOnly] = useState(filters.digital_only || false);
    const [sort, setSort] = useState(filters.sort || 'newest');

    const handleFilter = () => {
        router.get('/', {
            search: search || undefined,
            category: selectedCategory || undefined,
            price_min: priceMin || undefined,
            price_max: priceMax || undefined,
            digital_only: digitalOnly || undefined,
            sort: sort !== 'newest' ? sort : undefined,
        });
    };

    const handleReset = () => {
        setSearch('');
        setSelectedCategory('');
        setPriceMin('');
        setPriceMax('');
        setDigitalOnly(false);
        setSort('newest');
        router.get('/');
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
        }).format(amount);
    };

    return (
        <StorefrontLayout>
            <Head title="Products - Marketplace" />

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Browse Products</h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">Discover amazing products from our marketplace</p>
                </div>

                <div className="flex flex-col gap-8 lg:flex-row">
                    {/* Filters Sidebar */}
                    <div className="flex-shrink-0 lg:w-64">
                        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Filters</h2>

                            {/* Search */}
                            <div className="mb-4">
                                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Search</label>
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search products..."
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                    onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
                                />
                            </div>

                            {/* Category */}
                            <div className="mb-4">
                                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                >
                                    <option value="">All Categories</option>
                                    {categories.map((category) => (
                                        <option key={category.id} value={category.slug}>
                                            {category.name} ({category.products_count})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Price Range */}
                            <div className="mb-4">
                                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Price Range</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <input
                                        type="number"
                                        value={priceMin}
                                        onChange={(e) => setPriceMin(e.target.value)}
                                        placeholder="Min"
                                        className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                    />
                                    <input
                                        type="number"
                                        value={priceMax}
                                        onChange={(e) => setPriceMax(e.target.value)}
                                        placeholder="Max"
                                        className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                            </div>

                            {/* Digital Only */}
                            <div className="mb-6">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={digitalOnly}
                                        onChange={(e) => setDigitalOnly(e.target.checked)}
                                        className="focus:ring-opacity-50 rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200"
                                    />
                                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Digital products only</span>
                                </label>
                            </div>

                            {/* Action Buttons */}
                            <div className="space-y-2">
                                <button
                                    onClick={handleFilter}
                                    className="w-full rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
                                >
                                    Apply Filters
                                </button>
                                <button
                                    onClick={handleReset}
                                    className="w-full rounded-md bg-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-400 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500"
                                >
                                    Reset
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Products Grid */}
                    <div className="flex-1">
                        {/* Sort Options */}
                        <div className="mb-6 flex items-center justify-between">
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                Showing {products.data.length} of {products.total} products
                            </p>
                            <select
                                value={sort}
                                onChange={(e) => setSort(e.target.value)}
                                onBlur={handleFilter}
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
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {products.data.map((product) => (
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
                                                <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                                                    {formatCurrency(product.price)}
                                                </span>
                                                <Link
                                                    href={`/products/${product.slug}`}
                                                    className="rounded-md bg-indigo-600 px-3 py-1 text-sm text-white hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
                                                >
                                                    View
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-12 text-center">
                                <p className="text-lg text-gray-500 dark:text-gray-400">No products found matching your criteria.</p>
                                <button onClick={handleReset} className="mt-4 font-medium text-indigo-600 hover:text-indigo-800">
                                    Clear all filters
                                </button>
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
