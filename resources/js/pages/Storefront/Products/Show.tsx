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
        if (!auth?.user) {
            router.visit('/login');
            return;
        }

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
                    <ol className="flex items-center space-x-2 text-sm text-gray-500">
                        <li>
                            <Link href="/" className="hover:text-gray-900">
                                Home
                            </Link>
                        </li>
                        <li>/</li>
                        <li>
                            <Link href={`/?category=${product.category.slug}`} className="hover:text-gray-900">
                                {product.category.name}
                            </Link>
                        </li>
                        <li>/</li>
                        <li className="text-gray-900">{product.name}</li>
                    </ol>
                </nav>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                    {/* Product Image */}
                    <div className="aspect-square w-full overflow-hidden rounded-lg bg-gray-100">
                        {product.images && product.images.length > 0 ? (
                            <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center">
                                <svg className="h-24 w-24 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
                            <p className="text-2xl font-semibold text-indigo-600">{formatPrice(product.price)}</p>
                        </div>

                        <div className="mb-6">
                            <h3 className="mb-2 text-sm font-medium text-gray-900">Description</h3>
                            <p className="text-gray-700">{product.description}</p>
                        </div>

                        <div className="mb-6">
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                                <span>
                                    Store:
                                    <Link href={`/stores/${product.store.slug}`} className="ml-1 text-indigo-600 hover:text-indigo-500">
                                        {product.store.name}
                                    </Link>
                                </span>
                                <span>•</span>
                                <span>Category: {product.category.name}</span>
                                {product.digital_product && (
                                    <>
                                        <span>•</span>
                                        <span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800">Digital Product</span>
                                    </>
                                )}
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
                        <h2 className="mb-6 text-2xl font-bold text-gray-900">Related Products</h2>
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                            {relatedProducts.map((relatedProduct) => (
                                <Link key={relatedProduct.id} href={`/products/${relatedProduct.slug}`} className="group">
                                    <div className="aspect-square w-full overflow-hidden rounded-lg bg-gray-100">
                                        {relatedProduct.images && relatedProduct.images.length > 0 ? (
                                            <img
                                                src={relatedProduct.images[0]}
                                                alt={relatedProduct.name}
                                                className="h-full w-full object-cover group-hover:opacity-75"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center">
                                                <svg className="h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                                    <div className="mt-4">
                                        <h3 className="text-sm font-medium text-gray-900 group-hover:text-indigo-600">{relatedProduct.name}</h3>
                                        <p className="mt-1 text-sm font-semibold text-gray-900">{formatPrice(relatedProduct.price)}</p>
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
