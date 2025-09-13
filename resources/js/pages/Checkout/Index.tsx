import FlashMessages from '@/components/FlashMessages';
import StorefrontLayout from '@/layouts/StorefrontLayout';
import { User } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

interface CartItem {
    id: string;
    quantity: number;
    total_price: number;
    product: {
        id: string;
        name: string;
        price: number;
        images?: string[];
    };
    store?: {
        id: string;
        name: string;
    };
}

interface CheckoutProps {
    cartItems: CartItem[];
    storeGroups: Record<string, CartItem[]>;
    totalAmount: number;
    formattedTotal: string;
    defaultBillingInfo: {
        name?: string;
        email?: string;
        address?: string;
        city?: string;
        postal_code?: string;
        country?: string;
    };
    flash?: {
        success?: string;
        error?: string;
        warning?: string;
        info?: string;
    };
}

export default function CheckoutIndex({ cartItems, storeGroups, totalAmount, formattedTotal, defaultBillingInfo, flash }: CheckoutProps) {
    const [isRedirecting, setIsRedirecting] = useState(false);
    const { auth } = usePage().props as { auth?: { user: User } };

    const { data, setData, post, processing, errors } = useForm({
        billing_name: defaultBillingInfo?.name || auth?.user?.name || '',
        billing_email: defaultBillingInfo?.email || auth?.user?.email || '',
        billing_address: defaultBillingInfo?.address || '',
        billing_city: defaultBillingInfo?.city || '',
        billing_postal_code: defaultBillingInfo?.postal_code || '',
        billing_country: defaultBillingInfo?.country || 'Philippines',
    });

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
        }).format(amount);
    };

    const formatCentavos = (centavos: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
        }).format(centavos / 100);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!processing && !isRedirecting) {
            setIsRedirecting(true);

            try {
                // Refresh CSRF token before submission
                const response = await fetch('/csrf-token', {
                    method: 'GET',
                    headers: {
                        Accept: 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                });

                let freshToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

                if (response.ok) {
                    const tokenData = await response.json();
                    if (tokenData.csrf_token) {
                        freshToken = tokenData.csrf_token;
                        // Update the meta tag with fresh token
                        const metaTag = document.querySelector('meta[name="csrf-token"]');
                        if (metaTag && freshToken) {
                            metaTag.setAttribute('content', freshToken);
                        }
                    }
                }

                // For payment flows that redirect to external services (like Magpie),
                // we need to use a regular form submission instead of AJAX to allow
                // the browser to properly handle the external redirect
                const form = document.createElement('form');
                form.method = 'POST';
                form.action = '/orders/checkout';

                // Add fresh CSRF token
                if (freshToken) {
                    const csrfInput = document.createElement('input');
                    csrfInput.type = 'hidden';
                    csrfInput.name = '_token';
                    csrfInput.value = freshToken;
                    form.appendChild(csrfInput);
                }

                // Add form data
                Object.entries(data).forEach(([key, value]) => {
                    const input = document.createElement('input');
                    input.type = 'hidden';
                    input.name = key;
                    input.value = value;
                    form.appendChild(input);
                });

                // Submit the form
                document.body.appendChild(form);
                form.submit();
            } catch (error) {
                console.error('Failed to refresh CSRF token:', error);
                setIsRedirecting(false);
                // Fallback to original submission if token refresh fails
                const form = document.createElement('form');
                form.method = 'POST';
                form.action = '/orders/checkout';

                const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
                if (csrfToken) {
                    const csrfInput = document.createElement('input');
                    csrfInput.type = 'hidden';
                    csrfInput.name = '_token';
                    csrfInput.value = csrfToken;
                    form.appendChild(csrfInput);
                }

                Object.entries(data).forEach(([key, value]) => {
                    const input = document.createElement('input');
                    input.type = 'hidden';
                    input.name = key;
                    input.value = value;
                    form.appendChild(input);
                });

                document.body.appendChild(form);
                form.submit();
            }
        }
    };

    return (
        <StorefrontLayout>
            <Head title="Checkout" />

            {/* Payment Redirect Loading Modal with Blur */}
            {isRedirecting && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center"
                    style={{
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        backdropFilter: 'blur(8px)',
                    }}
                >
                    <div className="mx-4 max-w-md rounded-lg bg-white p-8 text-center shadow-2xl dark:bg-gray-800">
                        <div className="mb-4 flex justify-center">
                            <svg
                                className="h-12 w-12 animate-spin text-indigo-600"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                            </svg>
                        </div>
                        <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">Redirecting to Payment</h3>
                        <p className="text-gray-600 dark:text-gray-400">Please wait while we redirect you to Magpie's secure payment page...</p>
                    </div>
                </div>
            )}

            <div className="py-6">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    <h1 className="mb-8 text-2xl font-bold text-gray-900 dark:text-white">Checkout</h1>

                    <FlashMessages flash={flash} />

                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                        {/* Order Summary */}
                        <div className="order-2 lg:order-1">
                            <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                                <h2 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">Order Summary</h2>
                                <div className="space-y-4">
                                    {cartItems.map((item) => (
                                        <div key={item.id} className="flex items-center space-x-4">
                                            <div className="flex-1">
                                                <h3 className="text-sm font-medium text-gray-900 dark:text-white">{item.product.name}</h3>
                                                {item.store && <p className="text-sm text-gray-600 dark:text-gray-400">Sold by {item.store.name}</p>}
                                                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                                    <span>Qty: {item.quantity}</span>
                                                    <span className="mx-2">•</span>
                                                    <span>{formatCurrency(item.product.price)}</span>
                                                </div>
                                            </div>
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                {formatCentavos(item.total_price)}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-6 border-t border-gray-200 pt-6 dark:border-gray-700">
                                    <div className="flex items-center justify-between text-lg font-medium text-gray-900 dark:text-white">
                                        <span>Total</span>
                                        <span>{formattedTotal}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Billing Information */}
                        <div className="order-1 lg:order-2">
                            <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                                <h2 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">Billing Information</h2>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                                        <input
                                            type="text"
                                            name="billing_name"
                                            value={data.billing_name}
                                            onChange={(e) => setData('billing_name', e.target.value)}
                                            className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                            required
                                        />
                                        {errors.billing_name && <p className="mt-1 text-sm text-red-500">{errors.billing_name}</p>}
                                    </div>

                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                                        <input
                                            type="email"
                                            name="billing_email"
                                            value={data.billing_email}
                                            onChange={(e) => setData('billing_email', e.target.value)}
                                            className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                            required
                                        />
                                        {errors.billing_email && <p className="mt-1 text-sm text-red-500">{errors.billing_email}</p>}
                                    </div>

                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Address</label>
                                        <input
                                            type="text"
                                            name="billing_address"
                                            value={data.billing_address}
                                            onChange={(e) => setData('billing_address', e.target.value)}
                                            className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                            required
                                        />
                                        {errors.billing_address && <p className="mt-1 text-sm text-red-500">{errors.billing_address}</p>}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">City</label>
                                            <input
                                                type="text"
                                                name="billing_city"
                                                value={data.billing_city}
                                                onChange={(e) => setData('billing_city', e.target.value)}
                                                className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                                required
                                            />
                                            {errors.billing_city && <p className="mt-1 text-sm text-red-500">{errors.billing_city}</p>}
                                        </div>

                                        <div>
                                            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Postal Code</label>
                                            <input
                                                type="text"
                                                name="billing_postal_code"
                                                value={data.billing_postal_code}
                                                onChange={(e) => setData('billing_postal_code', e.target.value)}
                                                className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                                required
                                            />
                                            {errors.billing_postal_code && <p className="mt-1 text-sm text-red-500">{errors.billing_postal_code}</p>}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Country</label>
                                        <input
                                            type="text"
                                            name="billing_country"
                                            value={data.billing_country}
                                            onChange={(e) => setData('billing_country', e.target.value)}
                                            className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                            required
                                        />
                                        {errors.billing_country && <p className="mt-1 text-sm text-red-500">{errors.billing_country}</p>}
                                    </div>

                                    <div className="pt-4">
                                        <button
                                            type="submit"
                                            disabled={processing || isRedirecting}
                                            className="w-full rounded-md bg-indigo-600 px-4 py-3 font-medium text-white hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            {processing ? 'Processing...' : `Place Order - ${formattedTotal || '₱0.00'}`}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </StorefrontLayout>
    );
}
