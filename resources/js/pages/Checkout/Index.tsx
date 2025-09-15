import FlashMessages from '@/components/FlashMessages';
import StorefrontLayout from '@/layouts/StorefrontLayout';
import { User } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

// Occupational Classifications
const occupationalClasses = {
    class_1: {
        label: "Class 1",
        description: "Professional, technical, and related workers",
        examples: "Engineers, Doctors, Lawyers, Teachers, Architects, Accountants, Nurses, etc."
    },
    class_2: {
        label: "Class 2",
        description: "Administrative and managerial workers, clerical and related workers",
        examples: "Managers, Supervisors, Office Workers, Sales Personnel, Cashiers, etc."
    },
    class_3: {
        label: "Class 3",
        description: "Service workers and skilled workers in agriculture, forestry, fishing, and hunting",
        examples: "Police Officers, Security Guards, Farmers, Fishermen, Restaurant Workers, etc."
    },
    class_4: {
        label: "Class 4",
        description: "Production and related workers, transport equipment operators, and laborers",
        examples: "Factory Workers, Construction Workers, Drivers, Machine Operators, Mechanics, etc."
    }
};

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
    const [showClassPopover, setShowClassPopover] = useState<string | null>(null);
    const { auth } = usePage().props as { auth?: { user: User } };

    const { data, setData, post, processing, errors } = useForm({
        // Application Type
        application_type: 'new', // 'new' or 'renewal'
        existing_policy_number: '',

        // Applicant's Information - Name
        last_name: '',
        first_name: defaultBillingInfo?.name?.split(' ')[0] || auth?.user?.name?.split(' ')[0] || '',
        middle_name: '',
        suffix: '',

        // Mailing Address
        block_lot_phase_floor_unit: '',
        street: '',
        village_subdivision_condo: '',
        barangay: '',
        city_municipality: defaultBillingInfo?.city || '',
        province_state: '',
        zip_code: defaultBillingInfo?.postal_code || '',

        // Contact & Personal Info
        mobile_no: '',
        email_address: defaultBillingInfo?.email || auth?.user?.email || '',
        tin_sss_gsis_no: '',
        gender: '', // 'male' or 'female'
        civil_status: '', // 'single' or 'married'
        date_of_birth: '',
        place_of_birth: '',
        citizenship_nationality: 'Filipino',
        source_of_funds: '', // 'self_employed' or 'salary'

        // Employment Information
        name_of_employer_business: '',
        occupation: '',
        occupational_classification: '', // 'class_1', 'class_2', 'class_3', 'class_4'
        nature_of_employment_business: '',
        employer_business_address: '',

        // Choice of Plan
        choice_of_plan: '', // 'class_i', 'class_ii', 'class_iii'

        // Family Particulars
        family_members: [
            {
                relationship: 'spouse_or_parent',
                last_name: '',
                first_name: '',
                middle_name: '',
                suffix: '',
                gender: '',
                date_of_birth: '',
                occupation_education: ''
            }
        ],

        // Children/Siblings (dynamic)
        children_siblings: [
            {
                full_name: '',
                relationship: '',
                date_of_birth: '',
                occupation_education: ''
            }
        ],

        // Agreement and Privacy
        agreement_accepted: false,
        data_privacy_consent: false,
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

    const addChildSibling = () => {
        setData('children_siblings', [
            ...data.children_siblings,
            {
                full_name: '',
                relationship: '',
                date_of_birth: '',
                occupation_education: ''
            }
        ]);
    };

    const removeChildSibling = (index: number) => {
        if (data.children_siblings.length > 1) {
            setData('children_siblings', data.children_siblings.filter((_, i) => i !== index));
        }
    };

    const updateChildSibling = (index: number, field: string, value: string) => {
        const updated = [...data.children_siblings];
        updated[index] = { ...updated[index], [field]: value };
        setData('children_siblings', updated);
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
                    input.value = typeof value === 'object' ? JSON.stringify(value) : String(value);
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
                    input.value = typeof value === 'object' ? JSON.stringify(value) : String(value);
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

                    <div className="space-y-8">
                        {/* Order Summary */}
                        <div>
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

                        {/* Personal Accident Insurance Application */}
                        <div>
                            <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                                <div className="mb-6">
                                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Personal Accident Insurance Application</h2>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Complete your insurance application below</p>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-8">
                                    {/* Application Type */}
                                    <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                                        <h3 className="mb-4 text-base font-medium text-gray-900 dark:text-white">Application Type</h3>
                                        <div className="flex items-center gap-6 mb-4">
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="radio"
                                                    id="new"
                                                    name="application_type"
                                                    value="new"
                                                    checked={data.application_type === 'new'}
                                                    onChange={(e) => setData('application_type', e.target.value)}
                                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                                                />
                                                <label htmlFor="new" className="text-sm font-medium">New Application</label>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="radio"
                                                    id="renewal"
                                                    name="application_type"
                                                    value="renewal"
                                                    checked={data.application_type === 'renewal'}
                                                    onChange={(e) => setData('application_type', e.target.value)}
                                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                                                />
                                                <label htmlFor="renewal" className="text-sm font-medium">Policy Renewal</label>
                                            </div>
                                        </div>

                                        {data.application_type === 'renewal' && (
                                            <div>
                                                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Existing Policy Number *</label>
                                                <input
                                                    type="text"
                                                    value={data.existing_policy_number}
                                                    onChange={(e) => setData('existing_policy_number', e.target.value)}
                                                    className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                                    placeholder="Enter your existing policy number"
                                                    required
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* Personal Information */}
                                    <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                                        <h3 className="mb-4 text-base font-medium text-gray-900 dark:text-white">Personal Information</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                                            <div>
                                                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Last Name *</label>
                                                <input
                                                    type="text"
                                                    value={data.last_name}
                                                    onChange={(e) => setData('last_name', e.target.value)}
                                                    className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">First Name *</label>
                                                <input
                                                    type="text"
                                                    value={data.first_name}
                                                    onChange={(e) => setData('first_name', e.target.value)}
                                                    className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Middle Name</label>
                                                <input
                                                    type="text"
                                                    value={data.middle_name}
                                                    onChange={(e) => setData('middle_name', e.target.value)}
                                                    className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                                />
                                            </div>
                                            <div>
                                                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Suffix</label>
                                                <input
                                                    type="text"
                                                    value={data.suffix}
                                                    onChange={(e) => setData('suffix', e.target.value)}
                                                    className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                                    placeholder="Jr., Sr., III"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                            <div>
                                                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Mobile Number *</label>
                                                <input
                                                    type="tel"
                                                    value={data.mobile_no}
                                                    onChange={(e) => setData('mobile_no', e.target.value)}
                                                    className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                                    placeholder="09XX XXX XXXX"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Email Address *</label>
                                                <input
                                                    type="email"
                                                    value={data.email_address}
                                                    onChange={(e) => setData('email_address', e.target.value)}
                                                    className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">TIN/SSS/GSIS Number</label>
                                                <input
                                                    type="text"
                                                    value={data.tin_sss_gsis_no}
                                                    onChange={(e) => setData('tin_sss_gsis_no', e.target.value)}
                                                    className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                                    placeholder="XXX-XXX-XXX-XXX"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                            <div>
                                                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Gender *</label>
                                                <div className="flex gap-4 mt-2">
                                                    <label className="flex items-center">
                                                        <input
                                                            type="radio"
                                                            name="gender"
                                                            value="male"
                                                            checked={data.gender === 'male'}
                                                            onChange={(e) => setData('gender', e.target.value)}
                                                            className="mr-2 h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                                                            required
                                                        />
                                                        <span className="text-sm">Male</span>
                                                    </label>
                                                    <label className="flex items-center">
                                                        <input
                                                            type="radio"
                                                            name="gender"
                                                            value="female"
                                                            checked={data.gender === 'female'}
                                                            onChange={(e) => setData('gender', e.target.value)}
                                                            className="mr-2 h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                                                            required
                                                        />
                                                        <span className="text-sm">Female</span>
                                                    </label>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Civil Status *</label>
                                                <div className="flex gap-4 mt-2">
                                                    <label className="flex items-center">
                                                        <input
                                                            type="radio"
                                                            name="civil_status"
                                                            value="single"
                                                            checked={data.civil_status === 'single'}
                                                            onChange={(e) => setData('civil_status', e.target.value)}
                                                            className="mr-2 h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                                                            required
                                                        />
                                                        <span className="text-sm">Single</span>
                                                    </label>
                                                    <label className="flex items-center">
                                                        <input
                                                            type="radio"
                                                            name="civil_status"
                                                            value="married"
                                                            checked={data.civil_status === 'married'}
                                                            onChange={(e) => setData('civil_status', e.target.value)}
                                                            className="mr-2 h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                                                            required
                                                        />
                                                        <span className="text-sm">Married</span>
                                                    </label>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Date of Birth *</label>
                                                <input
                                                    type="date"
                                                    value={data.date_of_birth}
                                                    onChange={(e) => setData('date_of_birth', e.target.value)}
                                                    className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Place of Birth *</label>
                                                <input
                                                    type="text"
                                                    value={data.place_of_birth}
                                                    onChange={(e) => setData('place_of_birth', e.target.value)}
                                                    className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                            <div>
                                                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Nationality</label>
                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        value="Filipino"
                                                        readOnly
                                                        className="w-full rounded-md border border-gray-300 px-3 py-2 pl-10 shadow-sm bg-gray-50 text-gray-700 cursor-not-allowed dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
                                                    />
                                                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                                                        🇵🇭
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Source of Funds *</label>
                                                <div className="flex gap-4 mt-2">
                                                    <label className="flex items-center">
                                                        <input
                                                            type="radio"
                                                            name="source_of_funds"
                                                            value="self_employed"
                                                            checked={data.source_of_funds === 'self_employed'}
                                                            onChange={(e) => setData('source_of_funds', e.target.value)}
                                                            className="mr-2 h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                                                            required
                                                        />
                                                        <span className="text-sm">Self-Employed</span>
                                                    </label>
                                                    <label className="flex items-center">
                                                        <input
                                                            type="radio"
                                                            name="source_of_funds"
                                                            value="salary"
                                                            checked={data.source_of_funds === 'salary'}
                                                            onChange={(e) => setData('source_of_funds', e.target.value)}
                                                            className="mr-2 h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                                                            required
                                                        />
                                                        <span className="text-sm">Salary</span>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Address Information */}
                                    <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                                        <h3 className="mb-4 text-base font-medium text-gray-900 dark:text-white">Address Information</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">House/Unit Number</label>
                                                <input
                                                    type="text"
                                                    value={data.block_lot_phase_floor_unit}
                                                    onChange={(e) => setData('block_lot_phase_floor_unit', e.target.value)}
                                                    className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                                    placeholder="Block/Lot/Phase/Floor/Unit No."
                                                />
                                            </div>
                                            <div>
                                                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Street *</label>
                                                <input
                                                    type="text"
                                                    value={data.street}
                                                    onChange={(e) => setData('street', e.target.value)}
                                                    className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Village/Subdivision</label>
                                                <input
                                                    type="text"
                                                    value={data.village_subdivision_condo}
                                                    onChange={(e) => setData('village_subdivision_condo', e.target.value)}
                                                    className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                                    placeholder="Village/Subdivision/Condo Building"
                                                />
                                            </div>
                                            <div>
                                                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Barangay *</label>
                                                <input
                                                    type="text"
                                                    value={data.barangay}
                                                    onChange={(e) => setData('barangay', e.target.value)}
                                                    className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">City/Municipality *</label>
                                                <input
                                                    type="text"
                                                    value={data.city_municipality}
                                                    onChange={(e) => setData('city_municipality', e.target.value)}
                                                    className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Province/State *</label>
                                                <input
                                                    type="text"
                                                    value={data.province_state}
                                                    onChange={(e) => setData('province_state', e.target.value)}
                                                    className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">ZIP Code *</label>
                                                <input
                                                    type="text"
                                                    value={data.zip_code}
                                                    onChange={(e) => setData('zip_code', e.target.value)}
                                                    className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Employment Information */}
                                    <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                                        <h3 className="mb-4 text-base font-medium text-gray-900 dark:text-white">Employment Information</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Occupation *</label>
                                                <input
                                                    type="text"
                                                    value={data.occupation}
                                                    onChange={(e) => setData('occupation', e.target.value)}
                                                    className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                                    placeholder="Your job title or profession"
                                                    required
                                                />
                                            </div>
                                            <div className="relative">
                                                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Occupational Classification *
                                                    <button
                                                        type="button"
                                                        className="ml-1 text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
                                                        onClick={() => setShowClassPopover(showClassPopover ? null : 'info')}
                                                    >
                                                        <svg className="h-4 w-4 inline" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                                        </svg>
                                                    </button>
                                                </label>
                                                <select
                                                    value={data.occupational_classification}
                                                    onChange={(e) => setData('occupational_classification', e.target.value)}
                                                    className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                                    required
                                                >
                                                    <option value="">Select Classification</option>
                                                    {Object.entries(occupationalClasses).map(([key, classInfo]) => (
                                                        <option key={key} value={key}>
                                                            {classInfo.label}: {classInfo.description}
                                                        </option>
                                                    ))}
                                                </select>

                                                {/* General Info Popover */}
                                                {showClassPopover === 'info' && (
                                                    <div className="absolute z-50 mt-2 w-80 rounded-lg bg-white p-4 shadow-lg ring-1 ring-black ring-opacity-5 dark:bg-gray-800 dark:ring-white dark:ring-opacity-10">
                                                        <div className="flex items-start justify-between">
                                                            <div>
                                                                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Occupational Classifications</h4>
                                                                <div className="space-y-3 text-xs text-gray-600 dark:text-gray-300">
                                                                    {Object.entries(occupationalClasses).map(([key, classInfo]) => (
                                                                        <div key={key} className="border-l-2 border-indigo-200 dark:border-indigo-600 pl-2">
                                                                            <div className="font-medium text-gray-900 dark:text-white">{classInfo.label}</div>
                                                                            <div className="text-gray-600 dark:text-gray-400 mb-1">{classInfo.description}</div>
                                                                            <div className="text-gray-500 dark:text-gray-500 text-xs">{classInfo.examples}</div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                                                                onClick={() => setShowClassPopover(null)}
                                                            >
                                                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Nature of Employment/Business</label>
                                                <input
                                                    type="text"
                                                    value={data.nature_of_employment_business}
                                                    onChange={(e) => setData('nature_of_employment_business', e.target.value)}
                                                    className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                                    placeholder="Industry or business type"
                                                />
                                            </div>
                                            <div>
                                                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Employer/Business Name</label>
                                                <input
                                                    type="text"
                                                    value={data.name_of_employer_business}
                                                    onChange={(e) => setData('name_of_employer_business', e.target.value)}
                                                    className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                                    placeholder="Company name (if employed)"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Employer/Business Address</label>
                                            <input
                                                type="text"
                                                value={data.employer_business_address}
                                                onChange={(e) => setData('employer_business_address', e.target.value)}
                                                className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                                placeholder="Company address (if employed)"
                                            />
                                        </div>
                                    </div>

                                    {/* Insurance Plan Selection */}
                                    <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                                        <h3 className="mb-4 text-base font-medium text-gray-900 dark:text-white">Insurance Plan Selection</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="border border-gray-300 rounded-lg p-4 hover:border-indigo-500 transition-colors">
                                                <label className="flex items-start cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name="choice_of_plan"
                                                        value="class_i"
                                                        checked={data.choice_of_plan === 'class_i'}
                                                        onChange={(e) => setData('choice_of_plan', e.target.value)}
                                                        className="mt-1 mr-3 h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                                                        required
                                                    />
                                                    <div>
                                                        <div className="font-medium text-gray-900 dark:text-white">Class I</div>
                                                        <div className="text-sm text-gray-600 dark:text-gray-400">Principal Insured Only</div>
                                                    </div>
                                                </label>
                                            </div>
                                            <div className="border border-gray-300 rounded-lg p-4 hover:border-indigo-500 transition-colors">
                                                <label className="flex items-start cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name="choice_of_plan"
                                                        value="class_ii"
                                                        checked={data.choice_of_plan === 'class_ii'}
                                                        onChange={(e) => setData('choice_of_plan', e.target.value)}
                                                        className="mt-1 mr-3 h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                                                        required
                                                    />
                                                    <div>
                                                        <div className="font-medium text-gray-900 dark:text-white">Class II</div>
                                                        <div className="text-sm text-gray-600 dark:text-gray-400">Principal Insured & Spouse/Parent</div>
                                                    </div>
                                                </label>
                                            </div>
                                            <div className="border border-gray-300 rounded-lg p-4 hover:border-indigo-500 transition-colors">
                                                <label className="flex items-start cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name="choice_of_plan"
                                                        value="class_iii"
                                                        checked={data.choice_of_plan === 'class_iii'}
                                                        onChange={(e) => setData('choice_of_plan', e.target.value)}
                                                        className="mt-1 mr-3 h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                                                        required
                                                    />
                                                    <div>
                                                        <div className="font-medium text-gray-900 dark:text-white">Class III</div>
                                                        <div className="text-sm text-gray-600 dark:text-gray-400">Principal Insured & Family</div>
                                                    </div>
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Family Information - Show only if Class II or III is selected */}
                                    {(data.choice_of_plan === 'class_ii' || data.choice_of_plan === 'class_iii') && (
                                        <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                                            <h3 className="mb-4 text-base font-medium text-gray-900 dark:text-white">Family Information</h3>
                                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4 dark:bg-yellow-900/20 dark:border-yellow-800">
                                                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                                    Please provide information for your {data.choice_of_plan === 'class_ii' ? 'spouse or parent' : 'family members'} to be covered under this policy.
                                                </p>
                                            </div>

                                            {/* Spouse/Parent Section */}
                                            <div className="mb-6">
                                                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                                                    {data.choice_of_plan === 'class_ii' ? 'Spouse or Parent Information' : 'Spouse or Parent Information'}
                                                </h4>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border border-gray-200 rounded-lg dark:border-gray-600">
                                                    <div>
                                                        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                                                        <input
                                                            type="text"
                                                            className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                                            placeholder="Enter full name"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Relationship</label>
                                                        <select className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                                                            <option value="">Select relationship</option>
                                                            <option value="spouse">Spouse</option>
                                                            <option value="parent">Parent</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Date of Birth</label>
                                                        <input
                                                            type="date"
                                                            className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Children/Siblings Section - Only for Class III */}
                                            {data.choice_of_plan === 'class_iii' && (
                                                <div>
                                                    <div className="flex justify-between items-center mb-3">
                                                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">Children or Siblings Information</h4>
                                                        <button
                                                            type="button"
                                                            onClick={addChildSibling}
                                                            className="text-sm text-indigo-600 hover:text-indigo-500 font-medium"
                                                        >
                                                            + Add Another
                                                        </button>
                                                    </div>
                                                    <div className="space-y-4">
                                                        {data.children_siblings.map((child, index) => (
                                                            <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border border-gray-200 rounded-lg dark:border-gray-600 relative">
                                                                {data.children_siblings.length > 1 && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => removeChildSibling(index)}
                                                                        className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                                                                        title="Remove this entry"
                                                                    >
                                                                        ×
                                                                    </button>
                                                                )}
                                                                <div>
                                                                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                                                                    <input
                                                                        type="text"
                                                                        value={child.full_name}
                                                                        onChange={(e) => updateChildSibling(index, 'full_name', e.target.value)}
                                                                        className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                                                        placeholder="Enter full name (optional)"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Relationship</label>
                                                                    <select
                                                                        value={child.relationship}
                                                                        onChange={(e) => updateChildSibling(index, 'relationship', e.target.value)}
                                                                        className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                                                    >
                                                                        <option value="">Select relationship</option>
                                                                        <option value="child">Child</option>
                                                                        <option value="sibling">Sibling</option>
                                                                    </select>
                                                                </div>
                                                                <div>
                                                                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Date of Birth</label>
                                                                    <input
                                                                        type="date"
                                                                        value={child.date_of_birth}
                                                                        onChange={(e) => updateChildSibling(index, 'date_of_birth', e.target.value)}
                                                                        className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Occupation/Education</label>
                                                                    <input
                                                                        type="text"
                                                                        value={child.occupation_education}
                                                                        onChange={(e) => updateChildSibling(index, 'occupation_education', e.target.value)}
                                                                        className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                                                        placeholder="Occupation or education level"
                                                                    />
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Agreement and Privacy */}
                                    <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                                        <h3 className="mb-4 text-base font-medium text-gray-900 dark:text-white">Legal Agreements</h3>

                                        {/* Agreement */}
                                        <div className="mb-6">
                                            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Insurance Agreement</h4>
                                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4 max-h-40 overflow-y-auto text-sm dark:bg-gray-800 dark:border-gray-600">
                                                <p className="mb-2">I HEREBY DECLARE and warrant the answers given above in every respect true and correct, and have not withheld any information likely to affect acceptance of this proposal. I further agree that this proposal declaration shall be the basis of the contract between FPG Insurance and me.</p>
                                                <p className="mb-2">During the effectivity period of the contract/policy, the customer agrees to the following:</p>
                                                <p className="mb-2">(1) In case the Company is unable to comply with relevant customer due diligence (CDD) measures, as required under the Anti-Money Laundering Act, as amended and relevant issuances, due to the fault of the client, the company may apply appropriate measures.</p>
                                                <p className="mb-2">(2) Be bound by obligations set out in relevant United Nations Security Council Resolution relating to the prevention and suppression of proliferation financing of weapons of mass destruction.</p>
                                            </div>
                                            <div className="flex items-start">
                                                <input
                                                    type="checkbox"
                                                    id="agreement_accepted"
                                                    checked={data.agreement_accepted}
                                                    onChange={(e) => setData('agreement_accepted', e.target.checked)}
                                                    className="mt-1 mr-3 h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                                                    required
                                                />
                                                <label htmlFor="agreement_accepted" className="text-sm text-gray-700 dark:text-gray-300">
                                                    I acknowledge and agree to the above insurance terms and conditions. *
                                                </label>
                                            </div>
                                        </div>

                                        {/* Data Privacy */}
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Data Privacy Consent</h4>
                                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4 max-h-40 overflow-y-auto text-sm dark:bg-gray-800 dark:border-gray-600">
                                                <p className="mb-2">I acknowledge that FPG Insurance Co., Inc. (FPG) may collect, use, process and share my personal information to its stakeholders, duly authorized representatives, business partners, adjusters and other third parties for purposes such as but is not limited to underwriting, claims, business analysis, compliance with regulatory requirements and any other legitimate business purpose.</p>
                                                <p className="mb-2">I also authorize FPG to verify and investigate the information I have given, including documents submitted. FPG may retain my personal information as long as my business transaction with FPG is still in force and in case of termination, for a period of five (5) years from the date of termination.</p>
                                            </div>
                                            <div className="flex items-start">
                                                <input
                                                    type="checkbox"
                                                    id="data_privacy_consent"
                                                    checked={data.data_privacy_consent}
                                                    onChange={(e) => setData('data_privacy_consent', e.target.checked)}
                                                    className="mt-1 mr-3 h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                                                    required
                                                />
                                                <label htmlFor="data_privacy_consent" className="text-sm text-gray-700 dark:text-gray-300">
                                                    I provide my consent to the data privacy provisions stated above. *
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4">
                                        <button
                                            type="submit"
                                            disabled={processing || isRedirecting}
                                            className="w-full rounded-md bg-indigo-600 px-4 py-3 font-medium text-white hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            {processing ? 'Processing Application...' : `Submit Application & Pay ${formattedTotal || '₱0.00'}`}
                                        </button>
                                        <p className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">
                                            Your application will be reviewed and policy will be issued upon payment confirmation.
                                        </p>
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
