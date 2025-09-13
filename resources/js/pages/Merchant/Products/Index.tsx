import MerchantLayout from '@/layouts/MerchantLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

interface Product {
    id: string;
    name: string;
    slug: string;
    description: string;
    price: number;
    quantity: number;
    status: 'draft' | 'published' | 'archived';
    digital_product: boolean;
    images?: string[];
    category: {
        id: string;
        name: string;
    };
    created_at: string;
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
        search?: string;
        status?: string;
        category?: string;
    };
    categories: Array<{ id: string; name: string }>;
}

export default function MerchantProductsIndex({ products, filters, categories }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [category, setCategory] = useState(filters.category || '');

    const handleFilter = () => {
        router.get('/merchant/products', {
            search: search || undefined,
            status: status || undefined,
            category: category || undefined,
        });
    };

    const handleReset = () => {
        setSearch('');
        setStatus('');
        setCategory('');
        router.get('/merchant/products');
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
        }).format(amount);
    };

    const getStatusBadge = (productStatus: string) => {
        const colors = {
            draft: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
            published: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
            archived: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
        };
        return colors[productStatus as keyof typeof colors] || 'bg-gray-100 text-gray-800';
    };

    const getStockStatus = (quantity: number, isDigital: boolean) => {
        if (isDigital) return 'Digital';
        if (quantity === 0) return 'Out of Stock';
        if (quantity <= 5) return 'Low Stock';
        return 'In Stock';
    };

    const getStockColor = (quantity: number, isDigital: boolean) => {
        if (isDigital) return 'text-blue-600';
        if (quantity === 0) return 'text-red-600';
        if (quantity <= 5) return 'text-yellow-600';
        return 'text-green-600';
    };

    return (
        <MerchantLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl leading-tight font-semibold text-gray-800 dark:text-gray-200">Products</h2>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Manage your product catalog</p>
                    </div>
                    <Link href="/merchant/products/create" className="rounded bg-indigo-600 px-4 py-2 font-bold text-white hover:bg-indigo-700">
                        Add Product
                    </Link>
                </div>
            }
        >
            <Head title="Products - Merchant" />

            <div className="space-y-6">
                {/* Filters */}
                <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Search</label>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search products..."
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
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
                                <option value="draft">Draft</option>
                                <option value="published">Published</option>
                                <option value="archived">Archived</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            >
                                <option value="">All Categories</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-end space-x-2">
                            <button
                                onClick={handleFilter}
                                className="rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
                            >
                                Filter
                            </button>
                            <button
                                onClick={handleReset}
                                className="rounded-md bg-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-400 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500"
                            >
                                Reset
                            </button>
                        </div>
                    </div>
                </div>

                {/* Products Table */}
                <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800">
                    <div className="px-4 py-5 sm:p-6">
                        {products.data.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                                                Product
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                                                Category
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                                                Price
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                                                Stock
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                                                Status
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
                                        {products.data.map((product) => (
                                            <tr key={product.id}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="h-10 w-10 flex-shrink-0">
                                                            {product.images && product.images.length > 0 ? (
                                                                <img
                                                                    className="h-10 w-10 rounded-md object-cover"
                                                                    src={product.images[0]}
                                                                    alt={product.name}
                                                                />
                                                            ) : (
                                                                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gray-200">
                                                                    <span className="text-xs text-gray-500">No Image</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900 dark:text-white">{product.name}</div>
                                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                                {product.description.length > 60
                                                                    ? `${product.description.substring(0, 60)}...`
                                                                    : product.description}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900 dark:text-white">
                                                    {product.category.name}
                                                </td>
                                                <td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-900 dark:text-white">
                                                    {formatCurrency(product.price)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900 dark:text-white">
                                                        {product.digital_product ? 'Digital' : product.quantity}
                                                    </div>
                                                    <div className={`text-xs ${getStockColor(product.quantity, product.digital_product)}`}>
                                                        {getStockStatus(product.quantity, product.digital_product)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span
                                                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusBadge(product.status)}`}
                                                    >
                                                        {product.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
                                                    {new Date(product.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 text-right text-sm font-medium whitespace-nowrap">
                                                    <div className="flex justify-end space-x-2">
                                                        <Link
                                                            href={`/merchant/products/${product.id}`}
                                                            className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                                                        >
                                                            View
                                                        </Link>
                                                        <Link
                                                            href={`/merchant/products/${product.id}/edit`}
                                                            className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                                                        >
                                                            Edit
                                                        </Link>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="py-12 text-center">
                                <div className="mx-auto h-12 w-12 text-gray-400">📦</div>
                                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No products</h3>
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Get started by creating your first product.</p>
                                <div className="mt-6">
                                    <Link
                                        href="/merchant/products/create"
                                        className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
                                    >
                                        Add Product
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {products.last_page > 1 && (
                        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 dark:border-gray-700 dark:bg-gray-800">
                            <div className="flex flex-1 justify-between sm:hidden">
                                {products.links[0].url && (
                                    <Link
                                        href={products.links[0].url}
                                        className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                    >
                                        Previous
                                    </Link>
                                )}
                                {products.links[products.links.length - 1].url && (
                                    <Link
                                        href={products.links[products.links.length - 1].url}
                                        className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                    >
                                        Next
                                    </Link>
                                )}
                            </div>
                            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm text-gray-700 dark:text-gray-300">
                                        Showing <span className="font-medium">{(products.current_page - 1) * products.per_page + 1}</span> to{' '}
                                        <span className="font-medium">{Math.min(products.current_page * products.per_page, products.total)}</span> of{' '}
                                        <span className="font-medium">{products.total}</span> results
                                    </p>
                                </div>
                                <div>
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
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </MerchantLayout>
    );
}
