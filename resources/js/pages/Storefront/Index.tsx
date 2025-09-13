import StorefrontLayout from '@/layouts/StorefrontLayout';
import { Head, Link } from '@inertiajs/react';

interface Product {
    id: string;
    name: string;
    slug: string;
    price: number;
    images: string[];
    store: {
        name: string;
        slug: string;
    };
}

interface Store {
    id: string;
    name: string;
    slug: string;
    description: string;
    logo?: string;
    products_count: number;
}

interface Category {
    id: string;
    name: string;
    slug: string;
    products_count: number;
}

interface Props {
    featuredProducts: Product[];
    popularStores: Store[];
    categories: Category[];
    stats: {
        totalProducts: number;
        totalStores: number;
        totalCategories: number;
    };
}

export default function StorefrontIndex({ featuredProducts, popularStores, categories, stats }: Props) {
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
        }).format(price);
    };

    return (
        <StorefrontLayout>
            <Head title="Marketplace - Shop Everything You Need" />

            {/* Hero Section */}
            <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="mb-4 text-4xl font-bold md:text-6xl">Welcome to Our Marketplace</h1>
                        <p className="mx-auto mb-8 max-w-3xl text-xl md:text-2xl">
                            Discover amazing products from local merchants. Shop with confidence and support small businesses.
                        </p>
                        <div className="flex flex-col justify-center gap-4 sm:flex-row">
                            <Link
                                href="/products"
                                className="rounded-lg bg-white px-8 py-3 font-semibold text-indigo-600 transition-colors hover:bg-gray-100"
                            >
                                Browse Products
                            </Link>
                            <Link
                                href="/stores"
                                className="rounded-lg border-2 border-white px-8 py-3 font-semibold text-white transition-colors hover:bg-white hover:text-indigo-600"
                            >
                                Explore Stores
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 gap-8 text-center md:grid-cols-3">
                        <div>
                            <div className="mb-2 text-4xl font-bold text-indigo-600">{stats.totalProducts.toLocaleString()}+</div>
                            <div className="text-gray-600 dark:text-gray-400">Products Available</div>
                        </div>
                        <div>
                            <div className="mb-2 text-4xl font-bold text-indigo-600">{stats.totalStores.toLocaleString()}+</div>
                            <div className="text-gray-600 dark:text-gray-400">Trusted Merchants</div>
                        </div>
                        <div>
                            <div className="mb-2 text-4xl font-bold text-indigo-600">{stats.totalCategories.toLocaleString()}+</div>
                            <div className="text-gray-600 dark:text-gray-400">Categories</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Products */}
            <section className="bg-gray-50 py-16 dark:bg-gray-800">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-12 text-center">
                        <h2 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">Featured Products</h2>
                        <p className="text-gray-600 dark:text-gray-400">Discover our most popular and trending items</p>
                    </div>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {featuredProducts.map((product) => (
                            <div
                                key={product.id}
                                className="overflow-hidden rounded-lg bg-white shadow-md transition-shadow hover:shadow-lg dark:bg-gray-700"
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
                                        <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">{product.name}</h3>
                                        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">by {product.store.name}</p>
                                        <p className="text-xl font-bold text-indigo-600">{formatPrice(product.price)}</p>
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 text-center">
                        <Link
                            href="/products"
                            className="rounded-lg bg-indigo-600 px-6 py-3 font-medium text-white transition-colors hover:bg-indigo-700"
                        >
                            View All Products
                        </Link>
                    </div>
                </div>
            </section>

            {/* Categories */}
            <section className="py-16">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-12 text-center">
                        <h2 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">Shop by Category</h2>
                        <p className="text-gray-600 dark:text-gray-400">Find exactly what you're looking for</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
                        {categories.map((category) => (
                            <Link
                                key={category.id}
                                href={`/products?category=${category.slug}`}
                                className="rounded-lg bg-white p-6 text-center shadow-md transition-shadow hover:shadow-lg dark:bg-gray-800"
                            >
                                <h3 className="mb-1 font-semibold text-gray-900 dark:text-white">{category.name}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{category.products_count} products</p>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Popular Stores */}
            <section className="bg-gray-50 py-16 dark:bg-gray-800">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-12 text-center">
                        <h2 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">Popular Stores</h2>
                        <p className="text-gray-600 dark:text-gray-400">Shop from our top-rated merchants</p>
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {popularStores.map((store) => (
                            <Link
                                key={store.id}
                                href={`/stores/${store.slug}`}
                                className="overflow-hidden rounded-lg bg-white shadow-md transition-shadow hover:shadow-lg dark:bg-gray-700"
                            >
                                <div className="p-6">
                                    <div className="mb-4 flex items-center">
                                        {store.logo ? (
                                            <img src={store.logo} alt={store.name} className="mr-4 h-12 w-12 rounded-full" />
                                        ) : (
                                            <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-300 dark:bg-gray-600">
                                                <span className="text-xl">🏪</span>
                                            </div>
                                        )}
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{store.name}</h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{store.products_count} products</p>
                                        </div>
                                    </div>
                                    <p className="line-clamp-2 text-gray-600 dark:text-gray-400">{store.description}</p>
                                </div>
                            </Link>
                        ))}
                    </div>

                    <div className="mt-8 text-center">
                        <Link
                            href="/stores"
                            className="rounded-lg bg-indigo-600 px-6 py-3 font-medium text-white transition-colors hover:bg-indigo-700"
                        >
                            View All Stores
                        </Link>
                    </div>
                </div>
            </section>

            {/* Call to Action */}
            <section className="bg-indigo-600 py-16">
                <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
                    <h2 className="mb-4 text-3xl font-bold text-white">Ready to Start Selling?</h2>
                    <p className="mb-8 text-xl text-indigo-200">Join thousands of merchants already selling on our platform</p>
                    <Link
                        href="/register?role=merchant"
                        className="rounded-lg bg-white px-8 py-3 font-semibold text-indigo-600 transition-colors hover:bg-gray-100"
                    >
                        Become a Merchant
                    </Link>
                </div>
            </section>
        </StorefrontLayout>
    );
}
