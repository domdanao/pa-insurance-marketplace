import FlashMessages from '@/components/FlashMessages';
import MultiStepForm from '@/components/MultiStepForm';
import StorefrontLayout from '@/layouts/StorefrontLayout';
import { User } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

// Occupational Classifications
const occupationalClasses = {
    class_1: {
        label: 'Class 1',
        description: 'Professional, technical, and related workers',
        examples: 'Engineers, Doctors, Lawyers, Teachers, Architects, Accountants, Nurses, etc.',
    },
    class_2: {
        label: 'Class 2',
        description: 'Administrative and managerial workers, clerical and related workers',
        examples: 'Managers, Supervisors, Office Workers, Sales Personnel, Cashiers, etc.',
    },
    class_3: {
        label: 'Class 3',
        description: 'Service workers and skilled workers in agriculture, forestry, fishing, and hunting',
        examples: 'Police Officers, Security Guards, Farmers, Fishermen, Restaurant Workers, etc.',
    },
    class_4: {
        label: 'Class 4',
        description: 'Production and related workers, transport equipment operators, and laborers',
        examples: 'Factory Workers, Construction Workers, Drivers, Machine Operators, Mechanics, etc.',
    },
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
    draftData?: {
        id: string;
        current_step: number;
        form_data: any;
        last_accessed_at: string;
    } | null;
    flash?: {
        success?: string;
        error?: string;
        warning?: string;
        info?: string;
    };
}

export default function CheckoutIndex({ cartItems, storeGroups, totalAmount, formattedTotal, defaultBillingInfo, draftData, flash }: CheckoutProps) {
    const [isRedirecting, setIsRedirecting] = useState(false);
    const [showClassPopover, setShowClassPopover] = useState<string | null>(null);
    const [currentStep, setCurrentStep] = useState(draftData?.current_step || 1);
    const [showResumePrompt, setShowResumePrompt] = useState(false);
    const [isDraftSaving, setIsDraftSaving] = useState(false);
    const { auth } = usePage().props as { auth?: { user: User } };

    // Create initial form data, merging with draft if available
    const getInitialFormData = () => {
        const defaultData = {
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
                    occupation_education: '',
                },
            ],

            // Children/Siblings (dynamic)
            children_siblings: [
                {
                    full_name: '',
                    relationship: '',
                    date_of_birth: '',
                    occupation_education: '',
                },
            ],

            // Agreement and Privacy
            agreement_accepted: false,
            data_privacy_consent: false,
        };

        // Merge with draft data if available
        if (draftData?.form_data) {
            return { ...defaultData, ...draftData.form_data };
        }

        return defaultData;
    };

    // Define the steps
    const steps = [
        { id: 1, name: 'Application Type', description: 'New or renewal application' },
        { id: 2, name: 'Personal Information', description: 'Your personal details' },
        { id: 3, name: 'Address Information', description: 'Your mailing address' },
        { id: 4, name: 'Employment Information', description: 'Work and occupation details' },
        { id: 5, name: 'Insurance Plan Selection', description: 'Choose your coverage plan' },
        { id: 6, name: 'Legal Agreements', description: 'Terms and privacy consent' },
    ];

    const { data, setData, processing } = useForm(getInitialFormData());

    // Auto-save draft functionality
    const saveDraft = async () => {
        if (isDraftSaving) return;

        setIsDraftSaving(true);
        try {
            await fetch('/draft-policy/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    current_step: currentStep,
                    form_data: data,
                }),
            });
        } catch (error) {
            console.error('Error saving draft:', error);
        } finally {
            setIsDraftSaving(false);
        }
    };

    // Save draft when moving to next step
    useEffect(() => {
        if (currentStep > 1) {
            const timeoutId = setTimeout(() => {
                saveDraft();
            }, 1000); // Debounce saves

            return () => clearTimeout(timeoutId);
        }
    }, [currentStep, data]);

    // Show resume prompt if draft exists
    useEffect(() => {
        if (draftData && !showResumePrompt) {
            setShowResumePrompt(true);
        }
    }, [draftData]);

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
                occupation_education: '',
            },
        ]);
    };

    const removeChildSibling = (index: number) => {
        if (data.children_siblings.length > 1) {
            setData(
                'children_siblings',
                data.children_siblings.filter((_, i) => i !== index),
            );
        }
    };

    const updateChildSibling = (index: number, field: string, value: string) => {
        const updated = [...data.children_siblings];
        updated[index] = { ...updated[index], [field]: value };
        setData('children_siblings', updated);
    };

    // Step validation functions
    const validateStep = (step: number): boolean => {
        console.log(`Validating step ${step}...`);
        let isValid = false;

        switch (step) {
            case 1: // Application Type
                isValid = !!data.application_type && (data.application_type !== 'renewal' || !!data.existing_policy_number);
                console.log(
                    `Step 1 validation - application_type: ${data.application_type}, existing_policy_number: ${data.existing_policy_number}, valid: ${isValid}`,
                );
                return isValid;
            case 2: // Personal Information
                isValid = !!(
                    data.first_name &&
                    data.last_name &&
                    data.mobile_no &&
                    data.email_address &&
                    data.gender &&
                    data.civil_status &&
                    data.date_of_birth &&
                    data.place_of_birth &&
                    data.citizenship_nationality &&
                    data.source_of_funds
                );
                console.log(`Step 2 validation - valid: ${isValid}`, {
                    first_name: data.first_name,
                    last_name: data.last_name,
                    mobile_no: data.mobile_no,
                    email_address: data.email_address,
                    gender: data.gender,
                    civil_status: data.civil_status,
                    date_of_birth: data.date_of_birth,
                    place_of_birth: data.place_of_birth,
                    citizenship_nationality: data.citizenship_nationality,
                    source_of_funds: data.source_of_funds,
                });
                return isValid;
            case 3: // Address Information
                isValid = !!(data.street && data.barangay && data.city_municipality && data.province_state && data.zip_code);
                console.log(`Step 3 validation - valid: ${isValid}`, {
                    street: data.street,
                    barangay: data.barangay,
                    city_municipality: data.city_municipality,
                    province_state: data.province_state,
                    zip_code: data.zip_code,
                });
                return isValid;
            case 4: // Employment Information
                isValid = !!(data.occupation && data.occupational_classification);
                console.log(`Step 4 validation - valid: ${isValid}`, {
                    occupation: data.occupation,
                    occupational_classification: data.occupational_classification,
                });
                return isValid;
            case 5: // Insurance Plan Selection
                if (!data.choice_of_plan) {
                    console.log('Step 5 validation - no plan selected');
                    return false;
                }

                // Class I - no additional requirements
                if (data.choice_of_plan === 'class_i') {
                    console.log('Step 5 validation - Class I selected, valid: true');
                    return true;
                }

                // Class II - requires spouse/parent information
                if (data.choice_of_plan === 'class_ii') {
                    const spouseParent = data.family_members[0];
                    isValid = !!(spouseParent?.first_name && spouseParent?.last_name && spouseParent?.relationship && spouseParent?.date_of_birth);
                    console.log(`Step 5 validation - Class II, spouse/parent valid: ${isValid}`, spouseParent);
                    return isValid;
                }

                // Class III - requires spouse/parent AND at least one child/sibling
                if (data.choice_of_plan === 'class_iii') {
                    const spouseParent = data.family_members[0];
                    const hasSpouseParent = !!(
                        spouseParent?.first_name &&
                        spouseParent?.last_name &&
                        spouseParent?.relationship &&
                        spouseParent?.date_of_birth
                    );

                    const hasChildSibling = data.children_siblings.some((child) => child.full_name && child.relationship && child.date_of_birth);
                    isValid = hasSpouseParent && hasChildSibling;
                    console.log(
                        `Step 5 validation - Class III, spouse/parent valid: ${hasSpouseParent}, child/sibling valid: ${hasChildSibling}, overall valid: ${isValid}`,
                    );
                    return isValid;
                }

                console.log('Step 5 validation - unknown plan type');
                return false;
            case 6: // Legal Agreements
                isValid = data.agreement_accepted && data.data_privacy_consent;
                console.log(`Step 6 validation - valid: ${isValid}`, {
                    agreement_accepted: data.agreement_accepted,
                    data_privacy_consent: data.data_privacy_consent,
                });
                return isValid;
            default:
                console.log(`Step ${step} validation - unknown step`);
                return false;
        }
    };

    const canProceedToStep = (step: number): boolean => {
        if (step <= currentStep) return true;

        // Check if all previous steps are valid
        for (let i = 1; i < step; i++) {
            if (!validateStep(i)) return false;
        }
        return true;
    };

    const nextStep = () => {
        if (currentStep < steps.length && validateStep(currentStep)) {
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const goToStep = (step: number) => {
        if (canProceedToStep(step)) {
            setCurrentStep(step);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Store debug info in localStorage so it persists through page reloads
        localStorage.setItem(
            'debug_form_data',
            JSON.stringify({
                currentStep,
                totalSteps: steps.length,
                processing,
                isRedirecting,
                formData: data,
                timestamp: new Date().toISOString(),
            }),
        );

        console.log('=== FORM SUBMISSION DEBUG ===');
        console.log('Current Step:', currentStep);
        console.log('Total Steps:', steps.length);
        console.log('Processing:', processing);
        console.log('Is Redirecting:', isRedirecting);
        console.log('Form Data:', data);
        console.log('Debug data saved to localStorage');

        // If not on final step, just go to next step
        if (currentStep < steps.length) {
            console.log('Not on final step, going to next step');
            nextStep();
            return;
        }

        console.log('On final step, attempting to submit and redirect to payment');

        // Check for potential validation issues
        if (data.choice_of_plan === 'class_ii' || data.choice_of_plan === 'class_iii') {
            console.log('Class II/III plan selected, checking family_members:', data.family_members);
            if (!data.family_members || data.family_members.length === 0) {
                console.error('VALIDATION ISSUE: family_members is required for Class II/III but is empty');
                localStorage.setItem('validation_error', 'family_members required but empty');
            }
        }

        if (data.choice_of_plan === 'class_iii') {
            console.log('Class III plan selected, checking children_siblings:', data.children_siblings);
            if (!data.children_siblings || data.children_siblings.length === 0) {
                console.error('VALIDATION ISSUE: children_siblings is required for Class III but is empty');
                localStorage.setItem('validation_error', 'children_siblings required but empty');
            }
        }

        // Only submit on final step
        if (!processing && !isRedirecting) {
            console.log('Setting isRedirecting to true');
            setIsRedirecting(true);

            try {
                // Refresh CSRF token before submission
                console.log('Fetching fresh CSRF token...');
                const response = await fetch('/csrf-token', {
                    method: 'GET',
                    headers: {
                        Accept: 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                });

                console.log('CSRF token response status:', response.status);
                let freshToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
                console.log('Initial CSRF token from meta tag:', freshToken);

                if (response.ok) {
                    const tokenData = await response.json();
                    console.log('CSRF token response data:', tokenData);
                    if (tokenData.csrf_token) {
                        freshToken = tokenData.csrf_token;
                        console.log('Using fresh CSRF token:', freshToken);
                        // Update the meta tag with fresh token
                        const metaTag = document.querySelector('meta[name="csrf-token"]');
                        if (metaTag && freshToken) {
                            metaTag.setAttribute('content', freshToken);
                        }
                    }
                } else {
                    console.log('Failed to fetch fresh CSRF token, using existing token');
                }

                // For payment flows that redirect to external services (like Magpie),
                // we need to use a regular form submission instead of AJAX to allow
                // the browser to properly handle the external redirect
                console.log('Creating form for submission...');
                const form = document.createElement('form');
                form.method = 'POST';
                form.action = '/orders/checkout';
                console.log('Form action set to:', form.action);

                // Add fresh CSRF token
                if (freshToken) {
                    const csrfInput = document.createElement('input');
                    csrfInput.type = 'hidden';
                    csrfInput.name = '_token';
                    csrfInput.value = freshToken;
                    form.appendChild(csrfInput);
                    console.log('Added CSRF token to form');
                } else {
                    console.error('No CSRF token available!');
                }

                // Add form data
                console.log('Adding form data to form...');
                Object.entries(data).forEach(([key, value]) => {
                    if (Array.isArray(value)) {
                        // Handle arrays properly for Laravel
                        value.forEach((item, index) => {
                            if (typeof item === 'object') {
                                Object.entries(item).forEach(([subKey, subValue]) => {
                                    const input = document.createElement('input');
                                    input.type = 'hidden';
                                    input.name = `${key}[${index}][${subKey}]`;
                                    input.value = subValue ? String(subValue) : '';
                                    form.appendChild(input);
                                });
                            } else {
                                const input = document.createElement('input');
                                input.type = 'hidden';
                                input.name = `${key}[${index}]`;
                                input.value = item ? String(item) : '';
                                form.appendChild(input);
                            }
                        });
                    } else {
                        const input = document.createElement('input');
                        input.type = 'hidden';
                        input.name = key;
                        input.value = typeof value === 'object' ? JSON.stringify(value) : String(value);
                        form.appendChild(input);
                    }
                });
                console.log('Form data added, total inputs:', form.querySelectorAll('input').length);

                // Submit the form
                console.log('Appending form to body and submitting...');
                document.body.appendChild(form);
                console.log('Form appended to body');
                form.submit();
                console.log('Form submitted!');
            } catch (error) {
                console.error('Failed to refresh CSRF token:', error);
                console.log('Falling back to original submission method');
                setIsRedirecting(false);
                // Fallback to original submission if token refresh fails
                const form = document.createElement('form');
                form.method = 'POST';
                form.action = '/orders/checkout';

                const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
                console.log('Fallback CSRF token:', csrfToken);
                if (csrfToken) {
                    const csrfInput = document.createElement('input');
                    csrfInput.type = 'hidden';
                    csrfInput.name = '_token';
                    csrfInput.value = csrfToken;
                    form.appendChild(csrfInput);
                    console.log('Added fallback CSRF token to form');
                }

                console.log('Adding fallback form data...');
                Object.entries(data).forEach(([key, value]) => {
                    if (Array.isArray(value)) {
                        // Handle arrays properly for Laravel
                        value.forEach((item, index) => {
                            if (typeof item === 'object') {
                                Object.entries(item).forEach(([subKey, subValue]) => {
                                    const input = document.createElement('input');
                                    input.type = 'hidden';
                                    input.name = `${key}[${index}][${subKey}]`;
                                    input.value = subValue ? String(subValue) : '';
                                    form.appendChild(input);
                                });
                            } else {
                                const input = document.createElement('input');
                                input.type = 'hidden';
                                input.name = `${key}[${index}]`;
                                input.value = item ? String(item) : '';
                                form.appendChild(input);
                            }
                        });
                    } else {
                        const input = document.createElement('input');
                        input.type = 'hidden';
                        input.name = key;
                        input.value = typeof value === 'object' ? JSON.stringify(value) : String(value);
                        form.appendChild(input);
                    }
                });

                console.log('Submitting fallback form...');
                document.body.appendChild(form);
                form.submit();
                console.log('Fallback form submitted!');
            }
        } else {
            console.log('Cannot submit - processing:', processing, 'isRedirecting:', isRedirecting);
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

                    {/* Resume Draft Prompt */}
                    {showResumePrompt && draftData && currentStep < steps.length && (
                        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
                            <div className="flex items-start justify-between">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path
                                                fillRule="evenodd"
                                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </div>
                                    <div className="ml-3 flex-1">
                                        <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">Continue Your Application</h3>
                                        <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                                            You have an incomplete application from {draftData.last_accessed_at}. Would you like to continue where you
                                            left off?
                                        </p>
                                        <div className="mt-3 flex gap-3">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setCurrentStep(draftData.current_step);
                                                    setShowResumePrompt(false);
                                                }}
                                                className="rounded-md bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                            >
                                                Continue Application
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setShowResumePrompt(false);
                                                    // Optionally delete the draft
                                                    fetch('/draft-policy/delete', { method: 'DELETE' });
                                                }}
                                                className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                                            >
                                                Start Fresh
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowResumePrompt(false)}
                                    className="text-blue-400 hover:text-blue-600 dark:text-blue-500 dark:hover:text-blue-300"
                                >
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    )}

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
                                    <div className="mb-2 flex items-center justify-between">
                                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Personal Accident Insurance Application</h2>
                                        {isDraftSaving && (
                                            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                                    <circle
                                                        className="opacity-25"
                                                        cx="12"
                                                        cy="12"
                                                        r="10"
                                                        stroke="currentColor"
                                                        strokeWidth="4"
                                                    ></circle>
                                                    <path
                                                        className="opacity-75"
                                                        fill="currentColor"
                                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                    ></path>
                                                </svg>
                                                Saving draft...
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Step {currentStep} of {steps.length}: {steps[currentStep - 1]?.description}
                                    </p>
                                </div>

                                <MultiStepForm steps={steps} currentStep={currentStep} onStepChange={goToStep} canProceedToStep={canProceedToStep}>
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        {/* Step 1: Application Type */}
                                        {currentStep === 1 && (
                                            <div>
                                                <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">Application Type</h3>
                                                <div className="mb-4 flex items-center gap-6">
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
                                                        <label htmlFor="new" className="text-sm font-medium">
                                                            New Application
                                                        </label>
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
                                                        <label htmlFor="renewal" className="text-sm font-medium">
                                                            Policy Renewal
                                                        </label>
                                                    </div>
                                                </div>

                                                {data.application_type === 'renewal' && (
                                                    <div>
                                                        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                            Existing Policy Number *
                                                        </label>
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
                                        )}

                                        {/* Step 2: Personal Information */}
                                        {currentStep === 2 && (
                                            <div>
                                                <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">Personal Information</h3>
                                                <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                                                    <div>
                                                        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                            Last Name *
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={data.last_name}
                                                            onChange={(e) => setData('last_name', e.target.value)}
                                                            className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                                            required
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                            First Name *
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={data.first_name}
                                                            onChange={(e) => setData('first_name', e.target.value)}
                                                            className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                                            required
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                            Middle Name
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={data.middle_name}
                                                            onChange={(e) => setData('middle_name', e.target.value)}
                                                            className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                            Suffix
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={data.suffix}
                                                            onChange={(e) => setData('suffix', e.target.value)}
                                                            className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                                            placeholder="Jr., Sr., III"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                                                    <div>
                                                        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                            Mobile Number *
                                                        </label>
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
                                                        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                            Email Address *
                                                        </label>
                                                        <input
                                                            type="email"
                                                            value={data.email_address}
                                                            onChange={(e) => setData('email_address', e.target.value)}
                                                            className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                                            required
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                            TIN/SSS/GSIS Number
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={data.tin_sss_gsis_no}
                                                            onChange={(e) => setData('tin_sss_gsis_no', e.target.value)}
                                                            className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                                            placeholder="XXX-XXX-XXX-XXX"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                                                    <div>
                                                        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                            Gender *
                                                        </label>
                                                        <div className="mt-2 flex gap-4">
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
                                                        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                            Civil Status *
                                                        </label>
                                                        <div className="mt-2 flex gap-4">
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
                                                        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                            Date of Birth *
                                                        </label>
                                                        <input
                                                            type="date"
                                                            value={data.date_of_birth}
                                                            onChange={(e) => setData('date_of_birth', e.target.value)}
                                                            className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                                            required
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                            Place of Birth *
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={data.place_of_birth}
                                                            onChange={(e) => setData('place_of_birth', e.target.value)}
                                                            className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                                            required
                                                        />
                                                    </div>
                                                </div>

                                                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                                                    <div>
                                                        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                            Nationality
                                                        </label>
                                                        <div className="relative">
                                                            <input
                                                                type="text"
                                                                value="Filipino"
                                                                readOnly
                                                                className="w-full cursor-not-allowed rounded-md border border-gray-300 bg-gray-50 px-3 py-2 pl-10 text-gray-700 shadow-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
                                                            />
                                                            <div className="absolute top-1/2 left-3 -translate-y-1/2 transform">🇵🇭</div>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                            Source of Funds *
                                                        </label>
                                                        <div className="mt-2 flex gap-4">
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
                                        )}

                                        {/* Step 3: Address Information */}
                                        {currentStep === 3 && (
                                            <div>
                                                <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">Address Information</h3>
                                                <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                                                    <div>
                                                        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                            House/Unit Number
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={data.block_lot_phase_floor_unit}
                                                            onChange={(e) => setData('block_lot_phase_floor_unit', e.target.value)}
                                                            className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                                            placeholder="Block/Lot/Phase/Floor/Unit No."
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                            Street *
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={data.street}
                                                            onChange={(e) => setData('street', e.target.value)}
                                                            className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                                <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                                                    <div>
                                                        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                            Village/Subdivision
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={data.village_subdivision_condo}
                                                            onChange={(e) => setData('village_subdivision_condo', e.target.value)}
                                                            className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                                            placeholder="Village/Subdivision/Condo Building"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                            Barangay *
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={data.barangay}
                                                            onChange={(e) => setData('barangay', e.target.value)}
                                                            className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                                    <div>
                                                        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                            City/Municipality *
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={data.city_municipality}
                                                            onChange={(e) => setData('city_municipality', e.target.value)}
                                                            className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                                            required
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                            Province/State *
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={data.province_state}
                                                            onChange={(e) => setData('province_state', e.target.value)}
                                                            className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                                            required
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                            ZIP Code *
                                                        </label>
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
                                        )}

                                        {/* Step 4: Employment Information */}
                                        {currentStep === 4 && (
                                            <div>
                                                <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">Employment Information</h3>
                                                <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                                                    <div>
                                                        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                            Occupation *
                                                        </label>
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
                                                                <svg className="inline h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path
                                                                        fillRule="evenodd"
                                                                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                                                        clipRule="evenodd"
                                                                    />
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
                                                            <div className="ring-opacity-5 dark:ring-opacity-10 absolute z-50 mt-2 w-80 rounded-lg bg-white p-4 shadow-lg ring-1 ring-black dark:bg-gray-800 dark:ring-white">
                                                                <div className="flex items-start justify-between">
                                                                    <div>
                                                                        <h4 className="mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                                                            Occupational Classifications
                                                                        </h4>
                                                                        <div className="space-y-3 text-xs text-gray-600 dark:text-gray-300">
                                                                            {Object.entries(occupationalClasses).map(([key, classInfo]) => (
                                                                                <div
                                                                                    key={key}
                                                                                    className="border-l-2 border-indigo-200 pl-2 dark:border-indigo-600"
                                                                                >
                                                                                    <div className="font-medium text-gray-900 dark:text-white">
                                                                                        {classInfo.label}
                                                                                    </div>
                                                                                    <div className="mb-1 text-gray-600 dark:text-gray-400">
                                                                                        {classInfo.description}
                                                                                    </div>
                                                                                    <div className="text-xs text-gray-500 dark:text-gray-500">
                                                                                        {classInfo.examples}
                                                                                    </div>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                    <button
                                                                        type="button"
                                                                        className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                                                                        onClick={() => setShowClassPopover(null)}
                                                                    >
                                                                        <svg
                                                                            className="h-4 w-4"
                                                                            fill="none"
                                                                            stroke="currentColor"
                                                                            viewBox="0 0 24 24"
                                                                        >
                                                                            <path
                                                                                strokeLinecap="round"
                                                                                strokeLinejoin="round"
                                                                                strokeWidth={2}
                                                                                d="M6 18L18 6M6 6l12 12"
                                                                            />
                                                                        </svg>
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                                                    <div>
                                                        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                            Nature of Employment/Business
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={data.nature_of_employment_business}
                                                            onChange={(e) => setData('nature_of_employment_business', e.target.value)}
                                                            className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                                            placeholder="Industry or business type"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                            Employer/Business Name
                                                        </label>
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
                                                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        Employer/Business Address
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={data.employer_business_address}
                                                        onChange={(e) => setData('employer_business_address', e.target.value)}
                                                        className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                                        placeholder="Company address (if employed)"
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {/* Step 5: Insurance Plan Selection */}
                                        {currentStep === 5 && (
                                            <div>
                                                <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">Insurance Plan Selection</h3>
                                                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                                    <div className="rounded-lg border border-gray-300 p-4 transition-colors hover:border-indigo-500">
                                                        <label className="flex cursor-pointer items-start">
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
                                                    <div className="rounded-lg border border-gray-300 p-4 transition-colors hover:border-indigo-500">
                                                        <label className="flex cursor-pointer items-start">
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
                                                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                                                    Principal Insured & Spouse/Parent
                                                                </div>
                                                            </div>
                                                        </label>
                                                    </div>
                                                    <div className="rounded-lg border border-gray-300 p-4 transition-colors hover:border-indigo-500">
                                                        <label className="flex cursor-pointer items-start">
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
                                                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                                                    Principal Insured & Family
                                                                </div>
                                                            </div>
                                                        </label>
                                                    </div>
                                                </div>

                                                {/* Family Information - Show only if Class II or III is selected */}
                                                {(data.choice_of_plan === 'class_ii' || data.choice_of_plan === 'class_iii') && (
                                                    <div className="mt-6">
                                                        <h4 className="mb-4 text-base font-medium text-gray-900 dark:text-white">
                                                            Family Information
                                                        </h4>
                                                        <div className="mb-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
                                                            <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                                                Please provide information for your{' '}
                                                                {data.choice_of_plan === 'class_ii' ? 'spouse or parent' : 'family members'} to be
                                                                covered under this policy.
                                                            </p>
                                                        </div>

                                                        {/* Spouse/Parent Section - For both Class II and III */}
                                                        <div className="mb-6">
                                                            <div className="mb-3 flex items-center justify-between">
                                                                <h5 className="text-sm font-medium text-gray-900 dark:text-white">
                                                                    Spouse or Parent Information
                                                                </h5>
                                                                <span className="text-xs text-red-600 dark:text-red-400">Required</span>
                                                            </div>
                                                            <div className="grid grid-cols-1 gap-4 rounded-lg border border-gray-200 p-4 md:grid-cols-4 dark:border-gray-600">
                                                                <div>
                                                                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                                        Last Name
                                                                    </label>
                                                                    <input
                                                                        type="text"
                                                                        value={data.family_members[0]?.last_name || ''}
                                                                        onChange={(e) => {
                                                                            const updated = [...data.family_members];
                                                                            updated[0] = { ...updated[0], last_name: e.target.value };
                                                                            setData('family_members', updated);
                                                                        }}
                                                                        className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                                                        placeholder="Last name"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                                        First Name
                                                                    </label>
                                                                    <input
                                                                        type="text"
                                                                        value={data.family_members[0]?.first_name || ''}
                                                                        onChange={(e) => {
                                                                            const updated = [...data.family_members];
                                                                            updated[0] = { ...updated[0], first_name: e.target.value };
                                                                            setData('family_members', updated);
                                                                        }}
                                                                        className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                                                        placeholder="First name"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                                        Relationship
                                                                    </label>
                                                                    <select
                                                                        value={data.family_members[0]?.relationship || ''}
                                                                        onChange={(e) => {
                                                                            const updated = [...data.family_members];
                                                                            updated[0] = { ...updated[0], relationship: e.target.value };
                                                                            setData('family_members', updated);
                                                                        }}
                                                                        className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                                                    >
                                                                        <option value="">Select relationship</option>
                                                                        <option value="spouse">Spouse</option>
                                                                        <option value="parent">Parent</option>
                                                                    </select>
                                                                </div>
                                                                <div>
                                                                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                                        Date of Birth
                                                                    </label>
                                                                    <input
                                                                        type="date"
                                                                        value={data.family_members[0]?.date_of_birth || ''}
                                                                        onChange={(e) => {
                                                                            const updated = [...data.family_members];
                                                                            updated[0] = { ...updated[0], date_of_birth: e.target.value };
                                                                            setData('family_members', updated);
                                                                        }}
                                                                        className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Children/Siblings Section - Only for Class III */}
                                                        {data.choice_of_plan === 'class_iii' && (
                                                            <div>
                                                                <div className="mb-3 flex items-center justify-between">
                                                                    <div className="flex items-center gap-2">
                                                                        <h5 className="text-sm font-medium text-gray-900 dark:text-white">
                                                                            Children or Siblings Information
                                                                        </h5>
                                                                        <span className="text-xs text-red-600 dark:text-red-400">
                                                                            At least one required
                                                                        </span>
                                                                    </div>
                                                                    <button
                                                                        type="button"
                                                                        onClick={addChildSibling}
                                                                        className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                                                                    >
                                                                        + Add Another
                                                                    </button>
                                                                </div>
                                                                <div className="space-y-4">
                                                                    {data.children_siblings.map((child, index) => (
                                                                        <div
                                                                            key={index}
                                                                            className="relative grid grid-cols-1 gap-4 rounded-lg border border-gray-200 p-4 md:grid-cols-4 dark:border-gray-600"
                                                                        >
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
                                                                                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                                                    Full Name
                                                                                </label>
                                                                                <input
                                                                                    type="text"
                                                                                    value={child.full_name}
                                                                                    onChange={(e) =>
                                                                                        updateChildSibling(index, 'full_name', e.target.value)
                                                                                    }
                                                                                    className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                                                                    placeholder="Enter full name (optional)"
                                                                                />
                                                                            </div>
                                                                            <div>
                                                                                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                                                    Relationship
                                                                                </label>
                                                                                <select
                                                                                    value={child.relationship}
                                                                                    onChange={(e) =>
                                                                                        updateChildSibling(index, 'relationship', e.target.value)
                                                                                    }
                                                                                    className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                                                                >
                                                                                    <option value="">Select relationship</option>
                                                                                    <option value="child">Child</option>
                                                                                    <option value="sibling">Sibling</option>
                                                                                </select>
                                                                            </div>
                                                                            <div>
                                                                                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                                                    Date of Birth
                                                                                </label>
                                                                                <input
                                                                                    type="date"
                                                                                    value={child.date_of_birth}
                                                                                    onChange={(e) =>
                                                                                        updateChildSibling(index, 'date_of_birth', e.target.value)
                                                                                    }
                                                                                    className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                                                                />
                                                                            </div>
                                                                            <div>
                                                                                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                                                    Occupation/Education
                                                                                </label>
                                                                                <input
                                                                                    type="text"
                                                                                    value={child.occupation_education}
                                                                                    onChange={(e) =>
                                                                                        updateChildSibling(
                                                                                            index,
                                                                                            'occupation_education',
                                                                                            e.target.value,
                                                                                        )
                                                                                    }
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
                                            </div>
                                        )}

                                        {/* Step 6: Legal Agreements */}
                                        {currentStep === 6 && (
                                            <div>
                                                <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">Legal Agreements</h3>
                                                <div className="mb-6">
                                                    <h4 className="mb-2 text-sm font-medium text-gray-900 dark:text-white">Insurance Agreement</h4>
                                                    <div className="mb-4 max-h-40 overflow-y-auto rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm dark:border-gray-600 dark:bg-gray-800">
                                                        <p className="mb-2">
                                                            I HEREBY DECLARE and warrant the answers given above in every respect true and correct,
                                                            and have not withheld any information likely to affect acceptance of this proposal.
                                                        </p>
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

                                                <div>
                                                    <h4 className="mb-2 text-sm font-medium text-gray-900 dark:text-white">Data Privacy Consent</h4>
                                                    <div className="mb-4 max-h-40 overflow-y-auto rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm dark:border-gray-600 dark:bg-gray-800">
                                                        <p className="mb-2">
                                                            I acknowledge that FPG Insurance Co., Inc. may collect, use, process and share my personal
                                                            information for legitimate business purposes.
                                                        </p>
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
                                        )}

                                        {/* Navigation Buttons */}
                                        <div className="flex justify-between pt-6">
                                            <button
                                                type="button"
                                                onClick={prevStep}
                                                disabled={currentStep === 1}
                                                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                                            >
                                                Previous
                                            </button>

                                            <button
                                                type="submit"
                                                disabled={processing || isRedirecting || (currentStep < steps.length && !validateStep(currentStep))}
                                                className="rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                {processing
                                                    ? 'Processing...'
                                                    : currentStep === steps.length
                                                      ? `Submit Application & Pay ${formattedTotal || '₱0.00'}`
                                                      : 'Next'}
                                            </button>
                                        </div>

                                        {currentStep === steps.length && (
                                            <p className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">
                                                Your application will be reviewed and policy will be issued upon payment confirmation.
                                            </p>
                                        )}
                                    </form>
                                </MultiStepForm>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </StorefrontLayout>
    );
}
