import StorefrontLayout from '@/layouts/StorefrontLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import Modal from 'react-modal';

interface CartItem {
    id: string;
    quantity: number;
    product: {
        id: string;
        name: string;
        slug: string;
        price: number;
        images: string[];
        quantity: number;
        digital_files?: string[];
        store: {
            name: string;
            slug: string;
        };
    };
    total_price: number;
}

interface Props {
    cartItems: CartItem[];
    cartTotal: number;
    cartCount: number;
    formattedTotal: string;
}

export default function CartIndex({ cartItems, cartTotal, cartCount, formattedTotal }: Props) {
    const [loadingItems, setLoadingItems] = useState<string[]>([]);
    const [showClearDialog, setShowClearDialog] = useState(false);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
        }).format(price);
    };

    const formatCentavos = (centavos: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
        }).format(centavos / 100);
    };

    const updateQuantity = (cartItemId: string, newQuantity: number) => {
        if (newQuantity < 1) return;

        setLoadingItems((prev) => [...prev, cartItemId]);
        router.put(
            `/cart/${cartItemId}`,
            {
                quantity: newQuantity,
            },
            {
                onFinish: () => setLoadingItems((prev) => prev.filter((id) => id !== cartItemId)),
            },
        );
    };

    const removeItem = (cartItemId: string) => {
        setLoadingItems((prev) => [...prev, cartItemId]);
        router.delete(`/cart/${cartItemId}`, {
            onFinish: () => setLoadingItems((prev) => prev.filter((id) => id !== cartItemId)),
        });
    };

    const clearCart = () => {
        setShowClearDialog(true);
    };

    const confirmClearCart = () => {
        router.delete('/cart');
        setShowClearDialog(false);
    };

    const proceedToCheckout = () => {
        router.get('/orders/checkout');
    };

    const isDigitalProduct = (product: CartItem['product']) => {
        return product.digital_files && product.digital_files.length > 0;
    };

    if (cartItems.length === 0) {
        return (
            <StorefrontLayout>
                <Head title="Shopping Cart - Marketplace" />

                <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <div className="mb-4 text-8xl">🛒</div>
                        <h1 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">Your cart is empty</h1>
                        <p className="mb-8 text-gray-600 dark:text-gray-400">Looks like you haven't added any items to your cart yet.</p>
                        <Link
                            href="/products"
                            className="rounded-lg bg-indigo-600 px-6 py-3 font-medium text-white transition-colors hover:bg-indigo-700"
                        >
                            Continue Shopping
                        </Link>
                    </div>
                </div>
            </StorefrontLayout>
        );
    }

    return (
        <StorefrontLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Shopping Cart</h1>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">
                            {cartCount} {cartCount === 1 ? 'item' : 'items'} in your cart
                        </p>
                    </div>
                    <button
                        onClick={clearCart}
                        className="text-sm font-medium text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    >
                        Clear Cart
                    </button>
                </div>
            }
        >
            <Head title="Shopping Cart - Marketplace" />

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    {/* Cart Items */}
                    <div className="lg:col-span-2">
                        <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800">
                            <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                {cartItems.map((item) => (
                                    <div key={item.id} className="p-6">
                                        <div className="flex items-center">
                                            <Link href={`/products/${item.product.slug}`} className="flex-shrink-0">
                                                <img
                                                    src={item.product.images?.[0] || '/placeholder-product.svg'}
                                                    alt={item.product.name}
                                                    className="h-20 w-20 rounded-lg object-cover"
                                                />
                                            </Link>

                                            <div className="ml-6 flex-1">
                                                <div className="flex justify-between">
                                                    <div className="flex-1">
                                                        <Link
                                                            href={`/products/${item.product.slug}`}
                                                            className="text-lg font-semibold text-gray-900 hover:text-indigo-600 dark:text-white dark:hover:text-indigo-400"
                                                        >
                                                            {item.product.name}
                                                        </Link>
                                                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">by {item.product.store.name}</p>
                                                        <div className="mt-2 flex items-center">
                                                            <span className="text-lg font-bold text-indigo-600">
                                                                {formatPrice(item.product.price)}
                                                            </span>
                                                            {isDigitalProduct(item.product) && (
                                                                <span className="ml-2 rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-300">
                                                                    Digital
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="text-right">
                                                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                                                            {formatCentavos(item.total_price)}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="mt-4 flex items-center justify-between">
                                                    {/* Quantity Controls */}
                                                    <div className="flex items-center">
                                                        <label className="mr-3 text-sm text-gray-700 dark:text-gray-300">Qty:</label>
                                                        <button
                                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                            disabled={item.quantity <= 1 || loadingItems.includes(item.id)}
                                                            className="rounded-l bg-gray-200 px-2 py-1 font-bold text-gray-800 hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                                                        >
                                                            -
                                                        </button>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            max={isDigitalProduct(item.product) ? 1 : item.product.quantity}
                                                            value={item.quantity}
                                                            onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                                                            disabled={loadingItems.includes(item.id)}
                                                            className="w-16 border-t border-b border-gray-200 bg-gray-50 px-2 py-1 text-center text-gray-800 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                                                        />
                                                        <button
                                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                            disabled={
                                                                loadingItems.includes(item.id) ||
                                                                (isDigitalProduct(item.product) && item.quantity >= 1) ||
                                                                (!isDigitalProduct(item.product) && item.quantity >= item.product.quantity)
                                                            }
                                                            className="rounded-r bg-gray-200 px-2 py-1 font-bold text-gray-800 hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                                                        >
                                                            +
                                                        </button>
                                                    </div>

                                                    <button
                                                        onClick={() => removeItem(item.id)}
                                                        disabled={loadingItems.includes(item.id)}
                                                        className="text-sm font-medium text-red-600 hover:text-red-800 disabled:opacity-50 dark:text-red-400 dark:hover:text-red-300"
                                                    >
                                                        {loadingItems.includes(item.id) ? 'Removing...' : 'Remove'}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mt-6">
                            <Link
                                href="/products"
                                className="font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
                            >
                                ← Continue Shopping
                            </Link>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-4 rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Order Summary</h2>

                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">
                                        Subtotal ({cartCount} {cartCount === 1 ? 'item' : 'items'})
                                    </span>
                                    <span className="font-medium text-gray-900 dark:text-white">{formattedTotal}</span>
                                </div>

                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                                    <span className="font-medium text-gray-900 dark:text-white">Calculated at checkout</span>
                                </div>

                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">Tax</span>
                                    <span className="font-medium text-gray-900 dark:text-white">Calculated at checkout</span>
                                </div>

                                <div className="border-t border-gray-200 pt-3 dark:border-gray-700">
                                    <div className="flex justify-between">
                                        <span className="text-base font-semibold text-gray-900 dark:text-white">Total</span>
                                        <span className="text-xl font-bold text-indigo-600">{formattedTotal}</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={proceedToCheckout}
                                className="mt-6 w-full rounded-md bg-indigo-600 px-4 py-3 font-medium text-white transition-colors hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
                            >
                                Proceed to Checkout
                            </button>

                            <div className="mt-4 text-center">
                                <p className="text-xs text-gray-500 dark:text-gray-400">Secure checkout powered by our payment processor</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Clear Cart Modal */}
            <Modal
                isOpen={showClearDialog}
                onRequestClose={() => setShowClearDialog(false)}
                className="relative mx-auto w-full max-w-md scale-100 transform rounded-lg bg-white p-0 opacity-100 shadow-xl transition-all duration-500 ease-in-out outline-none dark:bg-gray-800"
                overlayClassName="fixed inset-0 flex items-center justify-center p-4 z-50 transition-all duration-500 ease-in-out"
                style={{
                    overlay: {
                        backgroundColor: 'rgba(0, 0, 0, 0.1)',
                        backdropFilter: 'blur(4px)',
                    },
                }}
                closeTimeoutMS={500}
                ariaHideApp={false}
            >
                <div className="px-6 py-4">
                    <div className="flex items-center">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
                            <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                                />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Clear Cart</h3>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                Are you sure you want to clear your cart? This action will remove all {cartCount} {cartCount === 1 ? 'item' : 'items'}{' '}
                                from your cart and cannot be undone.
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex justify-end space-x-3 bg-gray-50 px-6 py-4 dark:bg-gray-700">
                    <button
                        type="button"
                        onClick={() => setShowClearDialog(false)}
                        className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={confirmClearCart}
                        className="rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:outline-none"
                    >
                        Clear Cart
                    </button>
                </div>
            </Modal>
        </StorefrontLayout>
    );
}
