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
                <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
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
                                                                <h3 className="text-sm font-medium text-gray-900 dark:text-white">{item.product_name}</h3>
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
                                    <div className="px-4 py-5 sm:px-6">
                                        <h2 className="text-lg font-medium text-gray-900 dark:text-white">PA Insurance Application</h2>
                                    </div>
                                    <div className="border-t border-gray-200 px-4 py-5 sm:px-6 dark:border-gray-700">
                                        <div className="space-y-6">
                                            {/* Application Type */}
                                            <div>
                                                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Application Type</h3>
                                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                                    {order.billing_info.application_type === 'new' ? 'New Application' : 'Renewal Application'}
                                                    {order.billing_info.existing_policy_number && (
                                                        <div className="mt-1">Policy Number: {order.billing_info.existing_policy_number}</div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Personal Information */}
                                            <div>
                                                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Personal Information</h3>
                                                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                                                    <div className="font-medium text-gray-900 dark:text-white">
                                                        {order.billing_info.first_name} {order.billing_info.middle_name} {order.billing_info.last_name} {order.billing_info.suffix}
                                                    </div>
                                                    <div>Gender: {order.billing_info.gender === 'male' ? 'Male' : 'Female'}</div>
                                                    <div>Civil Status: {order.billing_info.civil_status === 'single' ? 'Single' : 'Married'}</div>
                                                    <div>Date of Birth: {new Date(order.billing_info.date_of_birth).toLocaleDateString()}</div>
                                                    <div>Place of Birth: {order.billing_info.place_of_birth}</div>
                                                    <div>Citizenship: {order.billing_info.citizenship_nationality}</div>
                                                </div>
                                            </div>

                                            {/* Contact Information */}
                                            <div>
                                                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Contact Information</h3>
                                                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                                                    <div>Mobile: {order.billing_info.mobile_no}</div>
                                                    <div>Email: {order.billing_info.email_address}</div>
                                                    {order.billing_info.tin_sss_gsis_no && (
                                                        <div>TIN/SSS/GSIS: {order.billing_info.tin_sss_gsis_no}</div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Address */}
                                            <div>
                                                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Address</h3>
                                                <address className="text-sm text-gray-600 not-italic dark:text-gray-400 space-y-1">
                                                    {order.billing_info.block_lot_phase_floor_unit && (
                                                        <div>{order.billing_info.block_lot_phase_floor_unit}</div>
                                                    )}
                                                    <div>{order.billing_info.street}</div>
                                                    {order.billing_info.village_subdivision_condo && (
                                                        <div>{order.billing_info.village_subdivision_condo}</div>
                                                    )}
                                                    <div>{order.billing_info.barangay}</div>
                                                    <div>{order.billing_info.city_municipality}, {order.billing_info.province_state}</div>
                                                    <div>{order.billing_info.zip_code}</div>
                                                </address>
                                            </div>

                                            {/* Employment Information */}
                                            <div>
                                                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Employment Information</h3>
                                                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                                                    <div>Occupation: {order.billing_info.occupation}</div>
                                                    <div>Classification: {order.billing_info.occupational_classification?.replace('_', ' ').toUpperCase()}</div>
                                                    <div>Source of Funds: {order.billing_info.source_of_funds === 'self_employed' ? 'Self Employed' : 'Salary'}</div>
                                                    {order.billing_info.name_of_employer_business && (
                                                        <div>Employer: {order.billing_info.name_of_employer_business}</div>
                                                    )}
                                                    {order.billing_info.nature_of_employment_business && (
                                                        <div>Nature of Business: {order.billing_info.nature_of_employment_business}</div>
                                                    )}
                                                    {order.billing_info.employer_business_address && (
                                                        <div>Employer Address: {order.billing_info.employer_business_address}</div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Insurance Plan */}
                                            <div>
                                                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Insurance Plan</h3>
                                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                                    <div className="font-medium">
                                                        {order.billing_info.choice_of_plan === 'class_i' && 'Class I - Principal Insured Only'}
                                                        {order.billing_info.choice_of_plan === 'class_ii' && 'Class II - Principal + Spouse/Parent'}
                                                        {order.billing_info.choice_of_plan === 'class_iii' && 'Class III - Principal + Family Members'}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Family Members (Class II/III) */}
                                            {order.billing_info.family_members && order.billing_info.family_members.length > 0 && (
                                                <div>
                                                    <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Family Members</h3>
                                                    <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                                                        {order.billing_info.family_members.map((member, index) => (
                                                            <div key={index} className="border-l-2 border-gray-200 pl-3 dark:border-gray-600">
                                                                <div className="font-medium">
                                                                    {member.first_name} {member.middle_name} {member.last_name} {member.suffix}
                                                                </div>
                                                                <div>Relationship: {member.relationship === 'spouse' ? 'Spouse' : 'Parent'}</div>
                                                                <div>Date of Birth: {new Date(member.date_of_birth).toLocaleDateString()}</div>
                                                                {member.gender && <div>Gender: {member.gender === 'male' ? 'Male' : 'Female'}</div>}
                                                                {member.occupation_education && <div>Occupation: {member.occupation_education}</div>}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Children/Siblings (Class III) */}
                                            {order.billing_info.children_siblings && order.billing_info.children_siblings.length > 0 && (
                                                <div>
                                                    <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Children/Siblings</h3>
                                                    <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                                                        {order.billing_info.children_siblings.map((child, index) => (
                                                            <div key={index} className="border-l-2 border-gray-200 pl-3 dark:border-gray-600">
                                                                <div className="font-medium">{child.full_name}</div>
                                                                <div>Relationship: {child.relationship === 'child' ? 'Child' : 'Sibling'}</div>
                                                                <div>Date of Birth: {new Date(child.date_of_birth).toLocaleDateString()}</div>
                                                                {child.occupation_education && <div>Occupation/Education: {child.occupation_education}</div>}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Legal Agreements */}
                                            <div>
                                                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Legal Agreements</h3>
                                                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                                                    <div className="flex items-center">
                                                        <span className="text-green-600 mr-2">✓</span>
                                                        Terms and Conditions Accepted
                                                    </div>
                                                    <div className="flex items-center">
                                                        <span className="text-green-600 mr-2">✓</span>
                                                        Data Privacy Consent Given
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Order Items & Payment (2/3) */}
                            <div className="lg:col-span-2">
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
                                                                <h3 className="text-sm font-medium text-gray-900 dark:text-white">{item.product_name}</h3>
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
