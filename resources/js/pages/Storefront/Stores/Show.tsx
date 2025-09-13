import StorefrontLayout from '@/layouts/StorefrontLayout';
import { Head, Link } from '@inertiajs/react';

interface Product {
    id: string;
    name: string;
    slug: string;
    description: string;
    price: number;
    images?: string[];
    category: {
        id: string;
        name: string;
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

interface Store {
    id: string;
    name: string;
    slug: string;
    description?: string;
    logo?: string;
    banner?: string;
    created_at: string;
}

interface Props {
    store: Store;
    products: PaginatedProducts;
}

export default function StorefrontStoreShow({ store, products }: Props) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
        }).format(amount);
    };

    return (
        <StorefrontLayout>
            <Head title={`${store.name} - Store`} />

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Store Header */}
                <div className="mb-8">
                    {/* Store Banner */}
                    <div className="relative h-48 overflow-hidden rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600">
                        {store.banner && <img src={store.banner} alt={`${store.name} banner`} className="h-full w-full object-cover" />}
                        <div className="bg-opacity-40 absolute inset-0 bg-black"></div>
                        <div className="absolute bottom-4 left-4 flex items-center">
                            {store.logo ? (
                                <img src={store.logo} alt={`${store.name} logo`} className="h-16 w-16 rounded-full bg-white object-cover shadow-lg" />
                            ) : (
                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-lg">
                                    <span className="text-xl font-bold text-gray-800">{store.name.charAt(0).toUpperCase()}</span>
                                </div>
                            )}
                            <div className="ml-4 text-white">
                                <h1 className="text-3xl font-bold">{store.name}</h1>
                                <p className="text-lg opacity-90">Member since {new Date(store.created_at).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>

                    {/* Store Description */}
                    {store.description && (
                        <div className="mt-6 rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                            <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">About {store.name}</h2>
                            <p className="text-gray-600 dark:text-gray-400">{store.description}</p>
                        </div>
                    )}
                </div>

                {/* Products Section */}
                <div className="mb-8">
                    <div className="mb-6 flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Products ({products.total})</h2>
                        <Link href="/stores" className="font-medium text-indigo-600 hover:text-indigo-800">
                            ← Browse All Stores
                        </Link>
                    </div>

                    {products.data.length > 0 ? (
                        <>
                            {/* Products Grid */}
                            <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
                                            <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">{product.category.name}</p>
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

                            {/* Pagination */}
                            {products.last_page > 1 && (
                                <div className="flex justify-center">
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
                        </>
                    ) : (
                        <div className="py-12 text-center">
                            <div className="mx-auto mb-4 h-12 w-12 text-gray-400">📦</div>
                            <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">No products yet</h3>
                            <p className="text-gray-500 dark:text-gray-400">This store hasn't added any products yet.</p>
                            <Link href="/" className="mt-4 inline-flex items-center font-medium text-indigo-600 hover:text-indigo-800">
                                Browse other products →
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </StorefrontLayout>
    );
}
