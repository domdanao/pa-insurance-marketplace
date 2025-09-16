import { Toast } from '@/components/ui/toast';
import StorefrontLayout from '@/layouts/StorefrontLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import Modal from 'react-modal';

interface OrderItem {
    id: string;
    product_name: string;
    product_price: number;
    quantity: number;
    total_price: number;
    product?: {
        id: string;
        name: string;
        slug: string;
    };
    store?: {
        id: string;
        name: string;
    };
}

interface Payment {
    id: string;
    amount: number;
    currency: string;
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded';
    magpie_transaction_id?: string;
    processed_at?: string;
}

interface Order {
    id: string;
    order_number: string;
    status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'refunded';
    subtotal: number;
    tax_amount?: number;
    total_amount: number;
    billing_info: {
        // Complete PA Insurance Application Data
        application_type: 'new' | 'renewal';
        existing_policy_number?: string;

        // Personal Information
        last_name: string;
        first_name: string;
        middle_name?: string;
        suffix?: string;

        // Address
        block_lot_phase_floor_unit?: string;
        street: string;
        village_subdivision_condo?: string;
        barangay: string;
        city_municipality: string;
        province_state: string;
        zip_code: string;

        // Contact & Personal Info
        mobile_no: string;
        email_address: string;
        tin_sss_gsis_no?: string;
        gender: 'male' | 'female';
        civil_status: 'single' | 'married';
        date_of_birth: string;
        place_of_birth: string;
        citizenship_nationality: string;
        source_of_funds: 'self_employed' | 'salary';

        // Employment
        name_of_employer_business?: string;
        occupation: string;
        occupational_classification: 'class_1' | 'class_2' | 'class_3' | 'class_4';
        nature_of_employment_business?: string;
        employer_business_address?: string;

        // Plan
        choice_of_plan: 'class_i' | 'class_ii' | 'class_iii';

        // Family Data (for Class II/III)
        family_members?: Array<{
            relationship: 'spouse' | 'parent';
            last_name: string;
            first_name: string;
            middle_name?: string;
            suffix?: string;
            gender?: 'male' | 'female';
            date_of_birth: string;
            occupation_education?: string;
        }>;
        children_siblings?: Array<{
            full_name: string;
            relationship: 'child' | 'sibling';
            date_of_birth: string;
            occupation_education?: string;
        }>;

        // Agreements
        agreement_accepted: boolean;
        data_privacy_consent: boolean;

        // Legacy fields for backward compatibility
        name?: string;
        email?: string;
        address?: string;
        city?: string;
        postal_code?: string;
        country?: string;
    };
    created_at: string;
    completed_at?: string;
    order_items: OrderItem[];
    payment?: Payment;
    user?: {
        id: string;
        name: string;
        email: string;
    };
}

interface ToastData {
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
}

interface OrderShowProps {
    order: Order;
    toast?: ToastData;
}

export default function OrderShow({ order }: OrderShowProps) {
    const { flash } = usePage().props as { flash?: { toast?: ToastData } };
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [isRedirecting, setIsRedirecting] = useState(false);
    const [showToast, setShowToast] = useState(false);

    useEffect(() => {
        if (flash?.toast) {
            setShowToast(true);
        }
    }, [flash?.toast]);

    const handleRetryPayment = () => {
        setIsRedirecting(true);

        // Create a temporary form and submit it to avoid CORS issues
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = `/payment/create-session/${order.id}`;

        // Add CSRF token
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        if (csrfToken) {
            const tokenInput = document.createElement('input');
            tokenInput.type = 'hidden';
            tokenInput.name = '_token';
            tokenInput.value = csrfToken;
            form.appendChild(tokenInput);
        }

        document.body.appendChild(form);
        form.submit();
    };

    const handleDeleteOrder = () => {
        setShowDeleteDialog(true);
    };

    const confirmDeleteOrder = () => {
        router.delete(`/orders/${order.id}`);
        setShowDeleteDialog(false);
    };
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
        }).format(amount / 100);
    };

    const formatCurrencyFromPesos = (amount: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
        }).format(amount);
    };

    const getStatusColor = (status: string) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
            processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
            completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
            cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
            refunded: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
        };
        return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
    };

    const getPaymentStatusColor = (status: string) => {
        const colors = {
            pending: 'text-yellow-600 dark:text-yellow-400',
            processing: 'text-blue-600 dark:text-blue-400',
            completed: 'text-green-600 dark:text-green-400',
            failed: 'text-red-600 dark:text-red-400',
            cancelled: 'text-red-600 dark:text-red-400',
            refunded: 'text-purple-600 dark:text-purple-400',
        };
        return colors[status as keyof typeof colors] || 'text-gray-600';
    };

    return (
        <StorefrontLayout>
            <Head title={`Order ${order.order_number}`} />

            {/* Toast Notification */}
            {flash?.toast && (
                <div className="fixed top-4 left-1/2 z-50 -translate-x-1/2 transform">
                    <Toast
                        variant={flash.toast.type === 'warning' ? 'warning' : flash.toast.type}
                        title={flash.toast.title}
                        description={flash.toast.message}
                        visible={showToast}
                        onClose={() => setShowToast(false)}
                        duration={6000}
                    />
                </div>
            )}

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
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="space-y-6">
                        {/* Order Header */}
                        <div className="rounded-lg bg-white shadow dark:bg-gray-800">
                            <div className="px-4 py-5 sm:px-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Order {order.order_number}</h1>
                                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                            Placed on{' '}
                                            {new Date(order.created_at).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                            })}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span
                                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(order.status)}`}
                                        >
                                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                        </span>
                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                                {formatCurrency(order.total_amount)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons for Pending Orders */}
                        {order.status === 'pending' && (
                            <div className="rounded-lg bg-white shadow dark:bg-gray-800">
                                <div className="px-4 py-5 sm:px-6">
                                    <h2 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">Order Actions</h2>
                                    <div className="flex flex-col gap-3 sm:flex-row">
                                        <button
                                            onClick={handleRetryPayment}
                                            disabled={isRedirecting}
                                            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                                                />
                                            </svg>
                                            Retry Payment
                                        </button>
                                        <button
                                            onClick={handleDeleteOrder}
                                            className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                                        >
                                            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                />
                                            </svg>
                                            Delete Order
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                            {/* Left Column: Order Items & Payment (1/3) */}
                            <div className="lg:col-span-1">
                                <div className="space-y-6">
                                    {/* Order Items & Summary */}
                                    <div className="rounded-lg bg-white shadow dark:bg-gray-800">
                                        <div className="px-4 py-5 sm:px-6">
                                            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Order Items & Summary</h2>
                                        </div>
                                        <div className="border-t border-gray-200 dark:border-gray-700">
                                            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                                                {order.order_items.map((item) => (
                                                    <li key={item.id} className="px-4 py-6 sm:px-6">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex-1">
                                                                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                                                                    {item.product_name}
                                                                </h3>
                                                                {item.store && (
                                                                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                                                        Sold by {item.store.name}
                                                                    </p>
                                                                )}
                                                                <div className="mt-2 flex items-center text-sm text-gray-600 dark:text-gray-400">
                                                                    <span>Qty: {item.quantity}</span>
                                                                    <span className="mx-2">•</span>
                                                                    <span>{formatCurrency(item.product_price * 100)} each</span>
                                                                </div>
                                                            </div>
                                                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                                {formatCurrency(item.total_price)}
                                                            </div>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                            {/* Order Summary within same box */}
                                            <div className="border-t border-gray-200 bg-gray-50 px-4 py-5 sm:px-6 dark:border-gray-700 dark:bg-gray-700">
                                                <dl className="space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <dt className="text-sm text-gray-600 dark:text-gray-400">Subtotal</dt>
                                                        <dd className="text-sm font-medium text-gray-900 dark:text-white">
                                                            {formatCurrency(order.subtotal)}
                                                        </dd>
                                                    </div>
                                                    {order.tax_amount && (
                                                        <div className="flex items-center justify-between">
                                                            <dt className="text-sm text-gray-600 dark:text-gray-400">Tax</dt>
                                                            <dd className="text-sm font-medium text-gray-900 dark:text-white">
                                                                {formatCurrency(order.tax_amount)}
                                                            </dd>
                                                        </div>
                                                    )}
                                                    <div className="flex items-center justify-between border-t border-gray-200 pt-3 dark:border-gray-700">
                                                        <dt className="text-base font-medium text-gray-900 dark:text-white">Total</dt>
                                                        <dd className="text-base font-medium text-gray-900 dark:text-white">
                                                            {formatCurrency(order.total_amount)}
                                                        </dd>
                                                    </div>
                                                </dl>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Payment Information */}
                                    {order.payment && (
                                        <div className="rounded-lg bg-white shadow dark:bg-gray-800">
                                            <div className="px-4 py-5 sm:px-6">
                                                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Payment</h2>
                                            </div>
                                            <div className="border-t border-gray-200 px-4 py-5 sm:px-6 dark:border-gray-700">
                                                <dl className="space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <dt className="text-sm text-gray-600 dark:text-gray-400">Status</dt>
                                                        <dd className={`text-sm font-medium ${getPaymentStatusColor(order.payment.status)}`}>
                                                            {order.payment.status.charAt(0).toUpperCase() + order.payment.status.slice(1)}
                                                        </dd>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <dt className="text-sm text-gray-600 dark:text-gray-400">Amount</dt>
                                                        <dd className="text-sm font-medium text-gray-900 dark:text-white">
                                                            {formatCurrencyFromPesos(order.payment.amount)} {order.payment.currency}
                                                        </dd>
                                                    </div>
                                                    {order.payment.magpie_transaction_id && (
                                                        <div className="flex items-center justify-between">
                                                            <dt className="text-sm text-gray-600 dark:text-gray-400">Transaction ID</dt>
                                                            <dd className="font-mono text-sm text-gray-900 dark:text-white">
                                                                {order.payment.magpie_transaction_id}
                                                            </dd>
                                                        </div>
                                                    )}
                                                </dl>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Right Column: PA Insurance Application (2/3) */}
                            <div className="lg:col-span-2">
                                {/* PA Insurance Application Data */}
                                <div className="rounded-lg bg-white shadow dark:bg-gray-800">
                                    <div className="border-b border-gray-200 px-4 py-5 sm:px-6 dark:border-gray-700">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900">
                                                    <svg
                                                        className="h-5 w-5 text-indigo-600 dark:text-indigo-400"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                        />
                                                    </svg>
                                                </div>
                                            </div>
                                            <div className="ml-3">
                                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">PA Insurance Application</h2>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    Complete application details and coverage information
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="px-4 py-6 sm:px-6">
                                        {/* Application Type & Plan - Featured Section */}
                                        <div className="mb-8 rounded-lg border border-indigo-100 bg-gradient-to-r from-indigo-50 to-blue-50 p-6 dark:border-indigo-800 dark:from-indigo-900/20 dark:to-blue-900/20">
                                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                                <div>
                                                    <h3 className="mb-3 flex items-center text-sm font-semibold text-indigo-900 dark:text-indigo-100">
                                                        <span className="mr-2 h-2 w-2 rounded-full bg-indigo-500"></span>
                                                        Application Type
                                                    </h3>
                                                    <div className="rounded-md bg-white p-3 shadow-sm dark:bg-gray-800">
                                                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                            {order.billing_info.application_type === 'new'
                                                                ? 'New Application'
                                                                : 'Renewal Application'}
                                                        </div>
                                                        {order.billing_info.existing_policy_number &&
                                                            order.billing_info.existing_policy_number !== 'null' && (
                                                                <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                                    Policy: {order.billing_info.existing_policy_number}
                                                                </div>
                                                            )}
                                                    </div>
                                                </div>
                                                <div>
                                                    <h3 className="mb-3 flex items-center text-sm font-semibold text-indigo-900 dark:text-indigo-100">
                                                        <span className="mr-2 h-2 w-2 rounded-full bg-indigo-500"></span>
                                                        Insurance Plan
                                                    </h3>
                                                    <div className="rounded-md bg-white p-3 shadow-sm dark:bg-gray-800">
                                                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                            {order.billing_info.choice_of_plan === 'class_i' && 'Class I - Principal Insured Only'}
                                                            {order.billing_info.choice_of_plan === 'class_ii' &&
                                                                'Class II - Principal + Spouse/Parent'}
                                                            {order.billing_info.choice_of_plan === 'class_iii' &&
                                                                'Class III - Principal + Family Members'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Main Information Grid */}
                                        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
                                            {/* Personal Information */}
                                            <div className="rounded-lg border border-gray-200 bg-gray-50 p-5 dark:border-gray-600 dark:bg-gray-700/50">
                                                <h3 className="mb-4 flex items-center text-sm font-semibold text-gray-900 dark:text-white">
                                                    <svg className="mr-2 h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                                        />
                                                    </svg>
                                                    Personal Information
                                                </h3>
                                                <div className="space-y-3">
                                                    <div className="rounded-md bg-white p-3 shadow-sm dark:bg-gray-800">
                                                        <div className="mb-1 text-sm font-medium text-gray-900 dark:text-white">Full Name</div>
                                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                                            {order.billing_info.first_name}{' '}
                                                            {order.billing_info.middle_name && order.billing_info.middle_name !== 'null'
                                                                ? order.billing_info.middle_name + ' '
                                                                : ''}
                                                            {order.billing_info.last_name}
                                                            {order.billing_info.suffix && order.billing_info.suffix !== 'null'
                                                                ? ' ' + order.billing_info.suffix
                                                                : ''}
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div className="rounded-md bg-white p-3 shadow-sm dark:bg-gray-800">
                                                            <div className="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">Gender</div>
                                                            <div className="text-sm text-gray-900 dark:text-white">
                                                                {order.billing_info.gender === 'male' ? 'Male' : 'Female'}
                                                            </div>
                                                        </div>
                                                        <div className="rounded-md bg-white p-3 shadow-sm dark:bg-gray-800">
                                                            <div className="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                                                                Civil Status
                                                            </div>
                                                            <div className="text-sm text-gray-900 dark:text-white">
                                                                {order.billing_info.civil_status === 'single' ? 'Single' : 'Married'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div className="rounded-md bg-white p-3 shadow-sm dark:bg-gray-800">
                                                            <div className="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">Birthdate</div>
                                                            <div className="text-sm text-gray-900 dark:text-white">
                                                                {new Date(order.billing_info.date_of_birth).toLocaleDateString()}
                                                            </div>
                                                        </div>
                                                        <div className="rounded-md bg-white p-3 shadow-sm dark:bg-gray-800">
                                                            <div className="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                                                                Place of Birth
                                                            </div>
                                                            <div className="text-sm text-gray-900 dark:text-white">
                                                                {order.billing_info.place_of_birth}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="rounded-md bg-white p-3 shadow-sm dark:bg-gray-800">
                                                        <div className="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">Citizenship</div>
                                                        <div className="text-sm text-gray-900 dark:text-white">
                                                            {order.billing_info.citizenship_nationality}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Contact Information */}
                                            <div className="rounded-lg border border-gray-200 bg-gray-50 p-5 dark:border-gray-600 dark:bg-gray-700/50">
                                                <h3 className="mb-4 flex items-center text-sm font-semibold text-gray-900 dark:text-white">
                                                    <svg className="mr-2 h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                                        />
                                                    </svg>
                                                    Contact Information
                                                </h3>
                                                <div className="space-y-3">
                                                    <div className="rounded-md bg-white p-3 shadow-sm dark:bg-gray-800">
                                                        <div className="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">Mobile Number</div>
                                                        <div className="text-sm text-gray-900 dark:text-white">{order.billing_info.mobile_no}</div>
                                                    </div>
                                                    <div className="rounded-md bg-white p-3 shadow-sm dark:bg-gray-800">
                                                        <div className="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">Email Address</div>
                                                        <div className="text-sm text-gray-900 dark:text-white">
                                                            {order.billing_info.email_address}
                                                        </div>
                                                    </div>
                                                    {order.billing_info.tin_sss_gsis_no && (
                                                        <div className="rounded-md bg-white p-3 shadow-sm dark:bg-gray-800">
                                                            <div className="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                                                                TIN/SSS/GSIS
                                                            </div>
                                                            {order.billing_info.tin_sss_gsis_no && order.billing_info.tin_sss_gsis_no !== 'null' && (
                                                                <div className="text-sm text-gray-900 dark:text-white">
                                                                    {order.billing_info.tin_sss_gsis_no}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Address & Employment Grid */}
                                        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
                                            {/* Address */}
                                            <div className="rounded-lg border border-gray-200 bg-gray-50 p-5 dark:border-gray-600 dark:bg-gray-700/50">
                                                <h3 className="mb-4 flex items-center text-sm font-semibold text-gray-900 dark:text-white">
                                                    <svg className="mr-2 h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                                        />
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                                        />
                                                    </svg>
                                                    Address
                                                </h3>
                                                <div className="rounded-md bg-white p-3 shadow-sm dark:bg-gray-800">
                                                    <address className="space-y-1 text-sm text-gray-600 not-italic dark:text-gray-400">
                                                        {order.billing_info.block_lot_phase_floor_unit && (
                                                            <div>{order.billing_info.block_lot_phase_floor_unit}</div>
                                                        )}
                                                        <div>{order.billing_info.street}</div>
                                                        {order.billing_info.village_subdivision_condo && (
                                                            <div>{order.billing_info.village_subdivision_condo}</div>
                                                        )}
                                                        <div>{order.billing_info.barangay}</div>
                                                        <div>
                                                            {order.billing_info.city_municipality}, {order.billing_info.province_state}
                                                        </div>
                                                        <div className="font-medium">{order.billing_info.zip_code}</div>
                                                    </address>
                                                </div>
                                            </div>

                                            {/* Employment Information */}
                                            <div className="rounded-lg border border-gray-200 bg-gray-50 p-5 dark:border-gray-600 dark:bg-gray-700/50">
                                                <h3 className="mb-4 flex items-center text-sm font-semibold text-gray-900 dark:text-white">
                                                    <svg className="mr-2 h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6z"
                                                        />
                                                    </svg>
                                                    Employment Information
                                                </h3>
                                                <div className="space-y-3">
                                                    <div className="rounded-md bg-white p-3 shadow-sm dark:bg-gray-800">
                                                        <div className="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">Occupation</div>
                                                        <div className="text-sm text-gray-900 dark:text-white">{order.billing_info.occupation}</div>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div className="rounded-md bg-white p-3 shadow-sm dark:bg-gray-800">
                                                            <div className="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                                                                Classification
                                                            </div>
                                                            <div className="text-sm text-gray-900 dark:text-white">
                                                                {order.billing_info.occupational_classification?.replace('_', ' ').toUpperCase()}
                                                            </div>
                                                        </div>
                                                        <div className="rounded-md bg-white p-3 shadow-sm dark:bg-gray-800">
                                                            <div className="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                                                                Source of Funds
                                                            </div>
                                                            <div className="text-sm text-gray-900 dark:text-white">
                                                                {order.billing_info.source_of_funds === 'self_employed' ? 'Self Employed' : 'Salary'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {order.billing_info.name_of_employer_business && (
                                                        <div className="rounded-md bg-white p-3 shadow-sm dark:bg-gray-800">
                                                            <div className="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">Employer</div>
                                                            {order.billing_info.name_of_employer_business &&
                                                                order.billing_info.name_of_employer_business !== 'null' && (
                                                                    <div className="text-sm text-gray-900 dark:text-white">
                                                                        {order.billing_info.name_of_employer_business}
                                                                    </div>
                                                                )}
                                                        </div>
                                                    )}
                                                    {order.billing_info.nature_of_employment_business && (
                                                        <div className="rounded-md bg-white p-3 shadow-sm dark:bg-gray-800">
                                                            <div className="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                                                                Nature of Business
                                                            </div>
                                                            {order.billing_info.nature_of_employment_business &&
                                                                order.billing_info.nature_of_employment_business !== 'null' && (
                                                                    <div className="text-sm text-gray-900 dark:text-white">
                                                                        {order.billing_info.nature_of_employment_business}
                                                                    </div>
                                                                )}
                                                        </div>
                                                    )}
                                                    {order.billing_info.employer_business_address && (
                                                        <div className="rounded-md bg-white p-3 shadow-sm dark:bg-gray-800">
                                                            <div className="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                                                                Employer Address
                                                            </div>
                                                            {order.billing_info.employer_business_address &&
                                                                order.billing_info.employer_business_address !== 'null' && (
                                                                    <div className="text-sm text-gray-900 dark:text-white">
                                                                        {order.billing_info.employer_business_address}
                                                                    </div>
                                                                )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Family Members Section */}
                                        {((order.billing_info.family_members && order.billing_info.family_members.length > 0) ||
                                            (order.billing_info.children_siblings && order.billing_info.children_siblings.length > 0)) && (
                                            <div className="mb-8">
                                                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                                    {/* Family Members (Class II/III) */}
                                                    {order.billing_info.family_members && order.billing_info.family_members.length > 0 && (
                                                        <div className="rounded-lg border border-gray-200 bg-gray-50 p-5 dark:border-gray-600 dark:bg-gray-700/50">
                                                            <h4 className="mb-4 flex items-center text-sm font-semibold text-gray-900 dark:text-white">
                                                                <svg
                                                                    className="mr-2 h-4 w-4 text-gray-500"
                                                                    fill="none"
                                                                    stroke="currentColor"
                                                                    viewBox="0 0 24 24"
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        strokeWidth={2}
                                                                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                                                    />
                                                                </svg>
                                                                Family Members
                                                            </h4>
                                                            <div className="space-y-3">
                                                                {order.billing_info.family_members.map((member, index) => (
                                                                    <div
                                                                        key={index}
                                                                        className="rounded-md border-l-4 border-indigo-200 bg-white p-3 shadow-sm dark:border-indigo-700 dark:bg-gray-800"
                                                                    >
                                                                        <div className="mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                                                            {member.first_name} {member.middle_name ? member.middle_name + ' ' : ''}
                                                                            {member.last_name}
                                                                            {member.suffix ? ' ' + member.suffix : ''}
                                                                        </div>
                                                                        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400">
                                                                            <div>
                                                                                <span className="font-medium">Relationship:</span>{' '}
                                                                                {member.relationship === 'spouse' ? 'Spouse' : 'Parent'}
                                                                            </div>
                                                                            <div>
                                                                                <span className="font-medium">Birthdate:</span>{' '}
                                                                                {new Date(member.date_of_birth).toLocaleDateString()}
                                                                            </div>
                                                                            {member.gender && (
                                                                                <div>
                                                                                    <span className="font-medium">Gender:</span>{' '}
                                                                                    {member.gender === 'male' ? 'Male' : 'Female'}
                                                                                </div>
                                                                            )}
                                                                            {member.occupation_education && (
                                                                                <div>
                                                                                    <span className="font-medium">Occupation:</span>{' '}
                                                                                    {member.occupation_education}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Children/Siblings (Class III only) */}
                                                    {order.billing_info.choice_of_plan === 'class_iii' &&
                                                        order.billing_info.children_siblings &&
                                                        order.billing_info.children_siblings.length > 0 &&
                                                        order.billing_info.children_siblings.some(
                                                            (child) => child.full_name && child.relationship && child.date_of_birth,
                                                        ) && (
                                                            <div className="rounded-lg border border-gray-200 bg-gray-50 p-5 dark:border-gray-600 dark:bg-gray-700/50">
                                                                <h4 className="mb-4 flex items-center text-sm font-semibold text-gray-900 dark:text-white">
                                                                    <svg
                                                                        className="mr-2 h-4 w-4 text-gray-500"
                                                                        fill="none"
                                                                        stroke="currentColor"
                                                                        viewBox="0 0 24 24"
                                                                    >
                                                                        <path
                                                                            strokeLinecap="round"
                                                                            strokeLinejoin="round"
                                                                            strokeWidth={2}
                                                                            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                                                                        />
                                                                    </svg>
                                                                    Children/Siblings
                                                                </h4>
                                                                <div className="space-y-3">
                                                                    {order.billing_info.children_siblings.map((child, index) => (
                                                                        <div
                                                                            key={index}
                                                                            className="rounded-md border-l-4 border-green-200 bg-white p-3 shadow-sm dark:border-green-700 dark:bg-gray-800"
                                                                        >
                                                                            <div className="mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                                                                {child.full_name}
                                                                            </div>
                                                                            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400">
                                                                                <div>
                                                                                    <span className="font-medium">Relationship:</span>{' '}
                                                                                    {child.relationship === 'child' ? 'Child' : 'Sibling'}
                                                                                </div>
                                                                                <div>
                                                                                    <span className="font-medium">Birthdate:</span>{' '}
                                                                                    {new Date(child.date_of_birth).toLocaleDateString()}
                                                                                </div>
                                                                                {child.occupation_education && (
                                                                                    <div className="col-span-2">
                                                                                        <span className="font-medium">Occupation/Education:</span>{' '}
                                                                                        {child.occupation_education}
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Legal Agreements */}
                                        <div className="rounded-lg border border-green-200 bg-green-50 p-6 dark:border-green-800 dark:bg-green-900/20">
                                            <h3 className="mb-4 flex items-center text-sm font-semibold text-green-900 dark:text-green-100">
                                                <svg className="mr-2 h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                                    />
                                                </svg>
                                                Legal Agreements
                                            </h3>
                                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                <div className="flex items-center rounded-md bg-white p-3 shadow-sm dark:bg-gray-800">
                                                    <span className="mr-3 text-lg text-green-600">✓</span>
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900 dark:text-white">Terms & Conditions</div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400">Accepted and agreed</div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center rounded-md bg-white p-3 shadow-sm dark:bg-gray-800">
                                                    <span className="mr-3 text-lg text-green-600">✓</span>
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900 dark:text-white">Data Privacy Consent</div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400">Consent provided</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Order Modal */}
            <Modal
                isOpen={showDeleteDialog}
                onRequestClose={() => setShowDeleteDialog(false)}
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
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Delete Order</h3>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                Are you sure you want to delete order #{order.order_number}? This action will remove the order and restore product
                                inventory. This cannot be undone.
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex justify-end space-x-3 bg-gray-50 px-6 py-4 dark:bg-gray-700">
                    <button
                        type="button"
                        onClick={() => setShowDeleteDialog(false)}
                        className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={confirmDeleteOrder}
                        className="rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:outline-none"
                    >
                        Delete Order
                    </button>
                </div>
            </Modal>
        </StorefrontLayout>
    );
}
