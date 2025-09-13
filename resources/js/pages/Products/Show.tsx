import StorefrontLayout from '@/layouts/StorefrontLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

interface Product {
    id: string;
    name: string;
    slug: string;
    description: string;
    price: number;
    quantity: number;
    images: string[];
    status: string;
    digital_files?: string[];
    metadata?: any;
    store: {
        id: string;
        name: string;
        slug: string;
        description: string;
        logo?: string;
    };
    category: {
        name: string;
        slug: string;
    };
    created_at: string;
}

interface Props {
    product: Product;
    relatedProducts: Product[];
    auth?: {
        user: any;
    };
}

export default function ProductShow({ product, relatedProducts, auth }: Props) {
    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(false);

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
                quantity: quantity,
            },
            {
                onFinish: () => setLoading(false),
                onSuccess: () => {
                    // Refresh page to update cart count in shared props
                    router.visit(window.location.pathname, {
                        preserveScroll: true,
                        preserveState: false,
                    });
                },
            },
        );
    };

    const isDigitalProduct = product.digital_files && product.digital_files.length > 0;
    const isOutOfStock = !isDigitalProduct && product.quantity <= 0;

    return (
        <StorefrontLayout>
            <Head title={`${product.name} - Marketplace`} />

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Breadcrumb */}
                <nav className="mb-8 flex" aria-label="Breadcrumb">
                    <ol className="flex items-center space-x-4">
                        <li>
                            <Link href="/" className="text-gray-400 hover:text-gray-500">
                                Home
                            </Link>
                        </li>
                        <li>
                            <svg
                                className="h-5 w-5 flex-shrink-0 text-gray-300"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                                aria-hidden="true"
                            >
                                <path d="m5.555 17.776 4-16 .894.448-4 16-.894-.448z" />
                            </svg>
                            <Link href="/products" className="ml-4 text-gray-400 hover:text-gray-500">
                                Products
                            </Link>
                        </li>
                        <li>
                            <svg
                                className="h-5 w-5 flex-shrink-0 text-gray-300"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                                aria-hidden="true"
                            >
                                <path d="m5.555 17.776 4-16 .894.448-4 16-.894-.448z" />
                            </svg>
                            <span className="ml-4 text-gray-500">{product.name}</span>
                        </li>
                    </ol>
                </nav>

                <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
                    {/* Product Images */}
                    <div>
                        <div className="aspect-w-1 aspect-h-1 mb-4">
                            <img
                                src={product.images[selectedImage] || '/placeholder-product.svg'}
                                alt={product.name}
                                className="h-96 w-full rounded-lg object-cover"
                            />
                        </div>
                        {product.images.length > 1 && (
                            <div className="flex space-x-2 overflow-x-auto">
                                {product.images.map((image, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedImage(index)}
                                        className={`h-20 w-20 flex-shrink-0 overflow-hidden rounded-md ${
                                            selectedImage === index ? 'ring-2 ring-indigo-500' : 'ring-1 ring-gray-200'
                                        }`}
                                    >
                                        <img src={image} alt={`${product.name} ${index + 1}`} className="h-full w-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div>
                        <h1 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">{product.name}</h1>

                        <div className="mb-4 flex items-center">
                            <span className="mr-4 text-3xl font-bold text-indigo-600">{formatPrice(product.price)}</span>
                            {isDigitalProduct && (
                                <span className="rounded bg-green-100 px-2.5 py-0.5 text-sm font-medium text-green-800 dark:bg-green-900 dark:text-green-300">
                                    Digital Product
                                </span>
                            )}
                        </div>

                        <div className="mb-6">
                            <h3 className="mb-2 text-sm font-medium text-gray-900 dark:text-white">Description</h3>
                            <p className="whitespace-pre-line text-gray-600 dark:text-gray-400">{product.description}</p>
                        </div>

                        <div className="mb-6">
                            <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                {product.category.name}
                            </span>
                        </div>

                        {/* Stock Status */}
                        <div className="mb-6">
                            {isDigitalProduct ? (
                                <p className="font-medium text-green-600">✓ Available for instant download</p>
                            ) : isOutOfStock ? (
                                <p className="font-medium text-red-600">✗ Out of stock</p>
                            ) : (
                                <p className="font-medium text-green-600">✓ In stock ({product.quantity} available)</p>
                            )}
                        </div>

                        {/* Quantity Selector */}
                        {!isOutOfStock && (
                            <div className="mb-6">
                                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Quantity</label>
                                <div className="flex items-center">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="rounded-l bg-gray-200 px-3 py-2 font-bold text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                                    >
                                        -
                                    </button>
                                    <input
                                        type="number"
                                        min="1"
                                        max={isDigitalProduct ? 1 : product.quantity}
                                        value={quantity}
                                        onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                                        className="w-20 border-t border-b border-gray-200 bg-gray-50 px-4 py-2 text-center text-gray-800 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                                    />
                                    <button
                                        onClick={() => setQuantity(Math.min(isDigitalProduct ? 1 : product.quantity, quantity + 1))}
                                        className="rounded-r bg-gray-200 px-3 py-2 font-bold text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Add to Cart Button */}
                        <div className="mb-8">
                            <button
                                onClick={handleAddToCart}
                                disabled={isOutOfStock || loading}
                                className={`w-full rounded-md px-4 py-3 font-medium text-white ${
                                    isOutOfStock
                                        ? 'cursor-not-allowed bg-gray-400'
                                        : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none'
                                } ${loading && 'cursor-not-allowed opacity-50'}`}
                            >
                                {loading ? 'Adding to Cart...' : isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                            </button>
                        </div>

                        {/* Store Info */}
                        <div className="border-t border-gray-200 pt-6 dark:border-gray-700">
                            <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">Sold by</h3>
                            <Link
                                href={`/stores/${product.store.slug}`}
                                className="flex items-center rounded-lg bg-gray-50 p-4 transition-colors hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700"
                            >
                                {product.store.logo ? (
                                    <img src={product.store.logo} alt={product.store.name} className="mr-4 h-12 w-12 rounded-full" />
                                ) : (
                                    <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-300 dark:bg-gray-600">
                                        <span className="text-xl">🏪</span>
                                    </div>
                                )}
                                <div>
                                    <h4 className="font-semibold text-gray-900 dark:text-white">{product.store.name}</h4>
                                    <p className="line-clamp-2 text-sm text-gray-600 dark:text-gray-400">{product.store.description}</p>
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <div className="mt-16">
                        <h2 className="mb-8 text-2xl font-bold text-gray-900 dark:text-white">Related Products</h2>
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                            {relatedProducts.map((relatedProduct) => (
                                <div
                                    key={relatedProduct.id}
                                    className="overflow-hidden rounded-lg bg-white shadow-md transition-shadow hover:shadow-lg dark:bg-gray-800"
                                >
                                    <Link href={`/products/${relatedProduct.slug}`}>
                                        <div className="aspect-w-1 aspect-h-1">
                                            <img
                                                src={relatedProduct.images[0] || '/placeholder-product.svg'}
                                                alt={relatedProduct.name}
                                                className="h-48 w-full object-cover"
                                            />
                                        </div>
                                        <div className="p-4">
                                            <h3 className="mb-2 line-clamp-2 text-lg font-semibold text-gray-900 dark:text-white">
                                                {relatedProduct.name}
                                            </h3>
                                            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">by {relatedProduct.store.name}</p>
                                            <p className="text-xl font-bold text-indigo-600">{formatPrice(relatedProduct.price)}</p>
                                        </div>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </StorefrontLayout>
    );
}
