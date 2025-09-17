import StorefrontLayout from '@/layouts/StorefrontLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

interface Product {
    id: string;
    name: string;
    slug: string;
    description: string;
    price: number;
    quantity: number;
    digital_product: boolean;
    images: string[] | null;
    status: 'published' | 'draft' | 'archived';
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

interface Props {
    product: Product;
    relatedProducts: Product[];
}

export default function ProductShow({ product, relatedProducts }: Props) {
    const [loading, setLoading] = useState(false);
    const { props } = usePage();
    const auth = (props as any).auth;

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
        }).format(price);
    };

    const handleAddToCart = () => {
        setLoading(true);
        router.post(
            `/cart/add/${product.id}`,
            {
                quantity: 1,
            },
            {
                onFinish: () => setLoading(false),
            },
        );
    };

    return (
        <StorefrontLayout>
            <Head title={product.name} />

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Breadcrumb */}
                <nav className="mb-8">
                    <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <li>
                            <Link href="/" className="hover:text-foreground">
                                Home
                            </Link>
                        </li>
                        <li>/</li>
                        <li>
                            <Link href={`/?category=${product.category.slug}`} className="hover:text-foreground">
                                {product.category.name}
                            </Link>
                        </li>
                        <li>/</li>
                        <li className="text-foreground">{product.name}</li>
                    </ol>
                </nav>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                    {/* Product Image */}
                    <div className="aspect-square w-full overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
                        {product.images && product.images.length > 0 ? (
                            <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center">
                                <svg className="h-24 w-24 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                    />
                                </svg>
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div>
                        <div className="mb-4">
                            <h1 className="text-3xl font-bold text-foreground">{product.name}</h1>
                            <p className="text-2xl font-semibold text-indigo-600 dark:text-indigo-400">{formatPrice(product.price)}</p>
                        </div>

                        <div className="mb-6">
                            <h3 className="mb-2 text-sm font-medium text-foreground">Description</h3>
                            <p className="text-muted-foreground">{product.description}</p>
                        </div>

                        <div className="mb-6">
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                <span>
                                    Store:
                                    <Link
                                        href={`/stores/${product.store.slug}`}
                                        className="ml-1 text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                                    >
                                        {product.store.name}
                                    </Link>
                                </span>
                                <span>•</span>
                                <span>Category: {product.category.name}</span>
                            </div>
                        </div>

                        {/* Stock Status */}
                        <div className="mb-6">
                            {product.digital_product || product.quantity > 0 ? (
                                <div className="flex items-center">
                                    <div className="mr-2 h-2 w-2 rounded-full bg-green-400"></div>
                                    <span className="text-sm text-green-600">
                                        {product.digital_product ? 'Available' : `${product.quantity} in stock`}
                                    </span>
                                </div>
                            ) : (
                                <div className="flex items-center">
                                    <div className="mr-2 h-2 w-2 rounded-full bg-red-400"></div>
                                    <span className="text-sm text-red-600">Out of stock</span>
                                </div>
                            )}
                        </div>

                        {/* Add to Cart Button */}
                        <div className="mb-8">
                            <button
                                onClick={handleAddToCart}
                                disabled={(!product.digital_product && product.quantity === 0) || loading}
                                className="w-full rounded-md bg-indigo-600 px-8 py-3 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
                            >
                                {loading ? 'Adding to Cart...' : !product.digital_product && product.quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <div className="mt-12">
                        <h2 className="mb-6 text-2xl font-bold text-foreground">Other Options</h2>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {relatedProducts.map((relatedProduct) => (
                                <Link key={relatedProduct.id} href={`/products/${relatedProduct.slug}`} className="group">
                                    <div className="flex items-center space-x-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
                                        {/* Product Image */}
                                        <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700">
                                            {relatedProduct.images && relatedProduct.images.length > 0 ? (
                                                <img
                                                    src={relatedProduct.images[0]}
                                                    alt={relatedProduct.name}
                                                    className="h-full w-full object-cover group-hover:opacity-75"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center">
                                                    <svg
                                                        className="h-8 w-8 text-gray-300 dark:text-gray-600"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                        />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>

                                        {/* Product Info */}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-lg font-medium text-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400 truncate">
                                                {relatedProduct.name}
                                            </h3>
                                            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                                                {relatedProduct.description}
                                            </p>
                                            <div className="mt-2 flex items-center justify-between">
                                                <p className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">
                                                    {formatPrice(relatedProduct.price)}
                                                </p>
                                                <div className="flex items-center text-sm text-muted-foreground">
                                                    <span>{relatedProduct.store.name}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Arrow Icon */}
                                        <div className="flex-shrink-0">
                                            <svg
                                                className="h-5 w-5 text-gray-400 group-hover:text-gray-600 dark:text-gray-500 dark:group-hover:text-gray-300"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M9 5l7 7-7 7"
                                                />
                                            </svg>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </StorefrontLayout>
    );
}
