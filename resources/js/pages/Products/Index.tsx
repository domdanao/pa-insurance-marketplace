import StorefrontLayout from '@/layouts/StorefrontLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

interface Product {
    id: string;
    name: string;
    slug: string;
    description: string;
    price: number;
    images: string[];
    status: string;
    store: {
        name: string;
        slug: string;
    };
    category: {
        name: string;
        slug: string;
    };
}

interface Category {
    id: string;
    name: string;
    slug: string;
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
        min_price?: number;
        max_price?: number;
        sort?: string;
    };
}

export default function ProductsIndex({ products, categories, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [category, setCategory] = useState(filters.category || '');
    const [minPrice, setMinPrice] = useState(filters.min_price || '');
    const [maxPrice, setMaxPrice] = useState(filters.max_price || '');
    const [sort, setSort] = useState(filters.sort || 'created_at');

    const handleFilter = () => {
        router.get('/products', {
            search: search,
            category: category,
            min_price: minPrice,
            max_price: maxPrice,
            sort: sort,
        });
    };

    const handleReset = () => {
        setSearch('');
        setCategory('');
        setMinPrice('');
        setMaxPrice('');
        setSort('created_at');
        router.get('/products');
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
        }).format(price);
    };

    return (
        <StorefrontLayout
            header={
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">All Products</h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">Discover amazing products from our merchant community</p>
                </div>
            }
        >
            <Head title="Products - Marketplace" />

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="flex flex-col gap-8 lg:flex-row">
                    {/* Filters Sidebar */}
                    <div className="lg:w-1/4">
                        <div className="sticky top-4 rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Filters</h2>

                            {/* Search */}
                            <div className="mb-6">
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
                            <div className="mb-6">
                                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                >
                                    <option value="">All Categories</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.slug}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Price Range */}
                            <div className="mb-6">
                                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Price Range</label>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        value={minPrice}
                                        onChange={(e) => setMinPrice(e.target.value)}
                                        placeholder="Min"
                                        className="w-1/2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                    />
                                    <input
                                        type="number"
                                        value={maxPrice}
                                        onChange={(e) => setMaxPrice(e.target.value)}
                                        placeholder="Max"
                                        className="w-1/2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                            </div>

                            {/* Sort */}
                            <div className="mb-6">
                                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Sort By</label>
                                <select
                                    value={sort}
                                    onChange={(e) => setSort(e.target.value)}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                >
                                    <option value="created_at">Newest</option>
                                    <option value="price_asc">Price: Low to High</option>
                                    <option value="price_desc">Price: High to Low</option>
                                    <option value="name">Name A-Z</option>
                                </select>
                            </div>

                            <div className="flex flex-col gap-2">
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
                    <div className="lg:w-3/4">
                        {/* Results Header */}
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Showing {products.data.length} of {products.total} products
                                </p>
                            </div>
                        </div>

                        {/* Products */}
                        {products.data.length > 0 ? (
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {products.data.map((product) => (
                                    <div
                                        key={product.id}
                                        className="overflow-hidden rounded-lg bg-white shadow-md transition-shadow hover:shadow-lg dark:bg-gray-800"
                                    >
                                        <Link href={`/products/${product.slug}`}>
                                            <div className="aspect-w-1 aspect-h-1">
                                                <img
                                                    src={product.images[0] || '/placeholder-product.svg'}
                                                    alt={product.name}
                                                    className="h-48 w-full object-cover"
                                                />
                                            </div>
                                            <div className="p-4">
                                                <h3 className="mb-2 line-clamp-2 text-lg font-semibold text-gray-900 dark:text-white">
                                                    {product.name}
                                                </h3>
                                                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">by {product.store.name}</p>
                                                <p className="mb-3 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">{product.description}</p>
                                                <div className="flex items-center justify-between">
                                                    <p className="text-xl font-bold text-indigo-600">{formatPrice(product.price)}</p>
                                                    <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-500 dark:bg-gray-700 dark:text-gray-400">
                                                        {product.category.name}
                                                    </span>
                                                </div>
                                            </div>
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-12 text-center">
                                <div className="mb-4 text-6xl">🔍</div>
                                <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">No products found</h3>
                                <p className="mb-4 text-gray-600 dark:text-gray-400">Try adjusting your filters or search terms</p>
                                <button onClick={handleReset} className="rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700">
                                    Reset Filters
                                </button>
                            </div>
                        )}

                        {/* Pagination */}
                        {products.last_page > 1 && (
                            <div className="mt-8 flex items-center justify-center">
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
