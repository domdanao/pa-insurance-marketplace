import RegisteredUserController from '@/actions/App/Http/Controllers/Auth/RegisteredUserController';
import { login } from '@/routes';
import { Form, Head } from '@inertiajs/react';
import { LoaderCircle, Plus, Trash2, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { useState, useEffect } from 'react';

import FlashMessages from '@/components/FlashMessages';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import AuthWideLayout from '@/layouts/auth-wide-layout';
import { ToastContainer } from '@/components/toast-container';
import { useToast } from '@/hooks/use-toast';

interface RegisterMerchantProps {
    flash?: {
        success?: string;
        error?: string;
        warning?: string;
        info?: string;
    };
}

interface Officer {
    name: string;
    position: string;
    id_type: string;
    id_number: string;
    date_of_birth: string;
    nationality: string;
    address: string;
}

interface BeneficialOwner {
    name: string;
    ownership_percentage: string;
    id_type: string;
    id_number: string;
    date_of_birth: string;
    nationality: string;
    address: string;
    is_politically_exposed: boolean;
}

export default function RegisterMerchant({ flash }: RegisterMerchantProps) {
    const { toasts, toast, removeToast } = useToast();
    const [currentStep, setCurrentStep] = useState(1);
    const [showSuccessDialog, setShowSuccessDialog] = useState(false);
    const totalSteps = 5; // Added OTP verification step
    const [otp, setOtp] = useState('');
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [isOtpVerified, setIsOtpVerified] = useState(false);
    const [otpLoading, setOtpLoading] = useState(false);
    const [userEmail, setUserEmail] = useState('');

    const [officers, setOfficers] = useState<Officer[]>([
        { name: '', position: '', id_type: '', id_number: '', date_of_birth: '', nationality: 'Filipino', address: '' }
    ]);

    const [beneficialOwners, setBeneficialOwners] = useState<BeneficialOwner[]>([
        { name: '', ownership_percentage: '', id_type: '', id_number: '', date_of_birth: '', nationality: 'Filipino', address: '', is_politically_exposed: false }
    ]);

    // Store form data in React state to handle multi-step form properly
    const [formData, setFormData] = useState<Record<string, any>>({});

    const steps = [
        { number: 1, title: "Email Verification", description: "Verify your email address" },
        { number: 2, title: "Basic Information", description: "Personal, business, and contact details" },
        { number: 3, title: "Company Officers", description: "Key company officers and directors" },
        { number: 4, title: "Beneficial Owners", description: "Ultimate beneficial owners (25%+ ownership)" },
        { number: 5, title: "Banking & Documents", description: "Banking info and required documents" }
    ];

    const addOfficer = () => {
        setOfficers([...officers, { name: '', position: '', id_type: '', id_number: '', date_of_birth: '', nationality: 'Filipino', address: '' }]);
    };

    const removeOfficer = (index: number) => {
        if (officers.length > 1) {
            setOfficers(officers.filter((_, i) => i !== index));
        }
    };

    const updateOfficer = (index: number, field: keyof Officer, value: string) => {
        const updated = [...officers];
        updated[index] = { ...updated[index], [field]: value };
        setOfficers(updated);
    };

    const addBeneficialOwner = () => {
        setBeneficialOwners([...beneficialOwners, { name: '', ownership_percentage: '', id_type: '', id_number: '', date_of_birth: '', nationality: 'Filipino', address: '', is_politically_exposed: false }]);
    };

    const removeBeneficialOwner = (index: number) => {
        if (beneficialOwners.length > 1) {
            setBeneficialOwners(beneficialOwners.filter((_, i) => i !== index));
        }
    };

    const updateBeneficialOwner = (index: number, field: keyof BeneficialOwner, value: string | boolean) => {
        const updated = [...beneficialOwners];
        updated[index] = { ...updated[index], [field]: value };
        setBeneficialOwners(updated);
    };

    const sendOtp = async () => {
        const form = document.querySelector('form') as HTMLFormElement;
        if (!form) return;

        const formData = new FormData(form);
        const email = formData.get('email') as string;

        if (!email) {
            toast({
                variant: 'warning',
                description: 'Please enter your email address first'
            });
            return;
        }

        setOtpLoading(true);
        try {
            const response = await fetch('/api/send-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ email }),
            });

            if (response.ok) {
                setIsOtpSent(true);
                toast({
                    variant: 'info',
                    description: 'OTP sent to your email address. Please check your inbox.'
                });
            } else {
                toast({
                    variant: 'error',
                    description: 'Failed to send OTP. Please try again.'
                });
            }
        } catch (error) {
            console.error('OTP send error:', error);
            toast({
                variant: 'error',
                description: 'Failed to send OTP. Please try again.'
            });
        } finally {
            setOtpLoading(false);
        }
    };

    const verifyOtp = async () => {
        const form = document.querySelector('form') as HTMLFormElement;
        if (!form) return;

        const formData = new FormData(form);
        const email = formData.get('email') as string;

        if (!email || !otp) {
            toast({
                variant: 'warning',
                description: 'Please enter the OTP code'
            });
            return;
        }

        setOtpLoading(true);
        try {
            const response = await fetch('/api/verify-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ email, otp, role: 'merchant' }),
            });

            if (response.ok) {
                setIsOtpVerified(true);
                setUserEmail(email); // Store the email for later use
                toast({
                    variant: 'success',
                    description: 'Email verified successfully!'
                });
                // Try to load existing draft for this email
                await loadDraft(email);
            } else {
                toast({
                    variant: 'error',
                    description: 'Invalid OTP code. Please try again.'
                });
                setOtp('');
            }
        } catch (error) {
            console.error('OTP verification error:', error);
            toast({
                variant: 'error',
                description: 'Failed to verify OTP. Please try again.'
            });
        } finally {
            setOtpLoading(false);
        }
    };

    const saveDraft = async () => {
        const email = userEmail;

        if (!email || !isOtpVerified) {
            return;
        }

        try {
            // Collect current step form data only
            let currentFormData: any = {};
            let bankingData: any = {};
            const form = document.querySelector('form') as HTMLFormElement;

            const bankingFields = ['bank_account_holder', 'bank_name', 'bank_account_number', 'bank_routing_number'];

            if (form) {
                const formData = new FormData(form);

                // Collect all form fields from current step
                for (const [key, value] of formData.entries()) {
                    if (key && value && value !== '' && String(value).trim() !== '') {
                        // Skip officer and beneficial owner fields as they're handled separately
                        if (!key.startsWith('officers[') && !key.startsWith('beneficial_owners[')) {
                            // Separate banking fields from regular form data
                            if (bankingFields.includes(key)) {
                                bankingData[key] = value;
                            } else {
                                currentFormData[key] = value;
                            }
                        }
                    }
                }

                // Handle checkboxes separately (they won't appear in FormData if unchecked)
                const checkboxes = form.querySelectorAll('input[type="checkbox"]');
                checkboxes.forEach(checkbox => {
                    const input = checkbox as HTMLInputElement;
                    if (input.name && !input.name.startsWith('officers[') && !input.name.startsWith('beneficial_owners[')) {
                        // Separate banking checkboxes from regular form data
                        if (bankingFields.includes(input.name)) {
                            bankingData[input.name] = input.checked;
                        } else {
                            currentFormData[input.name] = input.checked;
                        }
                    }
                });
            }

            // Load existing draft and merge
            let finalFormData = currentFormData;
            let finalBankingData = bankingData;
            try {
                const existingResponse = await fetch('/api/load-draft', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    },
                    body: JSON.stringify({ email }),
                });

                if (existingResponse.ok) {
                    const existingData = await existingResponse.json();
                    const existingFormData = existingData.draft.form_data || {};
                    const existingBankingData = existingData.draft.banking_info || {};

                    // Merge: existing data first, then current step data (current takes precedence)
                    finalFormData = { ...existingFormData, ...currentFormData };
                    finalBankingData = { ...existingBankingData, ...bankingData };
                }
            } catch (error) {
                console.warn('Could not load existing draft:', error);
            }

            // Save the merged data
            const requestData = {
                email,
                current_step: currentStep,
                form_data: finalFormData,
                officers,
                beneficial_owners: beneficialOwners,
                banking_info: Object.keys(finalBankingData).length > 0 ? finalBankingData : null,
            };

            const response = await fetch('/api/save-draft', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify(requestData),
            });

            if (response.ok) {
                // Draft saved successfully - no notification needed
            } else {
                console.error('Failed to save draft:', response.status);
            }
        } catch (error) {
            console.error('Draft save error:', error);
        }
    };

    const loadDraft = async (email: string) => {
        try {
            const response = await fetch('/api/load-draft', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ email }),
            });

            if (response.ok) {
                const data = await response.json();
                const draft = data.draft;

                // Restore step and data
                setCurrentStep(draft.current_step);
                setOfficers(draft.officers.length > 0 ? draft.officers : officers);
                setBeneficialOwners(draft.beneficial_owners.length > 0 ? draft.beneficial_owners : beneficialOwners);

                // Restore email verification status
                if (draft.email_verified) {
                    setIsOtpVerified(true);
                    setIsOtpSent(true);
                }

                // Merge form_data and banking_info for DOM population
                const combinedFormData = {
                    ...(draft.form_data || {}),
                    ...(draft.banking_info || {})
                };

                // Store form data in React state - useEffect will handle DOM population
                setFormData(combinedFormData);
            }
        } catch (error) {
            console.error('Failed to load draft:', error);
        }
    };

    const nextStep = async () => {
        // Validate current step before proceeding
        const validation = checkStepValidity();

        if (!validation.isValid) {
            const missingFields = validation.missingFields || [];
            const fieldsList = missingFields.length > 3
                ? `${missingFields.slice(0, 3).join(', ')} and ${missingFields.length - 3} more fields`
                : missingFields.join(', ');

            toast({
                variant: 'error',
                title: 'Missing Required Fields',
                description: `Please complete: ${fieldsList}`,
            });
            return;
        }

        // Save draft before moving to next step
        await saveDraft();

        if (currentStep < totalSteps) {
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = async () => {
        // Save current state before going back
        await saveDraft();

        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const goToStep = async (step: number) => {
        // Only allow going to steps that are accessible based on current validation
        if (step <= currentStep || canGoToStep(step)) {
            // Save current state before jumping to another step
            await saveDraft();
            setCurrentStep(step);
        }
    };

    const canGoToStep = (targetStep: number): boolean => {
        // Can always go back to previous steps
        if (targetStep <= currentStep) {
            return true;
        }

        // Can only go forward if all previous steps are valid
        const form = document.querySelector('form');
        if (!form) return false;

        const formData = new FormData(form);

        for (let step = 1; step < targetStep; step++) {
            switch (step) {
                case 1:
                    if (!isOtpVerified) return false;
                    break;
                case 2:
                    if (!validateStep2(formData)) return false;
                    break;
                case 3:
                    if (!validateStep3()) return false;
                    break;
                case 4:
                    if (!validateStep4()) return false;
                    break;
                case 5:
                    if (!validateStep5(formData)) return false;
                    break;
            }
        }
        return true;
    };

    // Form validation for each step
    const validateStep2 = (formData?: FormData): boolean => {
        const requiredFields = [
            'name', 'business_name', 'business_type', 'tax_id', 'business_description',
            'phone', 'address_line_1', 'city', 'state', 'postal_code', 'country'
        ];

        console.log('Validating Step 2...');

        const missingFields: string[] = [];
        const validationResults = requiredFields.map(field => {
            // First try to get value from formData if provided
            let value = formData?.get(field)?.toString().trim();

            // If not found in formData, get directly from the input element
            if (!value || value === 'undefined') {
                const input = document.querySelector(`[name="${field}"]`) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
                value = input?.value?.trim() || '';
            }

            const isValid = value && value.length > 0 && value !== 'undefined';
            if (!isValid) {
                missingFields.push(field);
            }
            console.log(`Field "${field}": "${value}" -> ${isValid ? 'VALID' : 'INVALID'}`);
            return isValid;
        });

        const allValid = validationResults.every(result => result);
        console.log('Missing fields:', missingFields);
        console.log('Step 2 validation result:', allValid);

        return allValid;
    };

    const validateStep3 = (): boolean => {
        return officers.length > 0 && officers.every(officer =>
            officer.name && officer.name.trim() &&
            officer.position && officer.position.trim() &&
            officer.id_type &&
            officer.id_number && officer.id_number.trim() &&
            officer.date_of_birth &&
            officer.nationality && officer.nationality.trim() &&
            officer.address && officer.address.trim()
        );
    };

    const validateStep4 = (): boolean => {
        return beneficialOwners.length > 0 && beneficialOwners.every(owner =>
            owner.name && owner.name.trim() &&
            owner.ownership_percentage &&
            parseFloat(owner.ownership_percentage) >= 25 &&
            owner.id_type &&
            owner.id_number && owner.id_number.trim() &&
            owner.date_of_birth &&
            owner.nationality && owner.nationality.trim() &&
            owner.address && owner.address.trim()
        );
    };

    const validateStep5 = (formData?: FormData): boolean => {
        const requiredFields = [
            'bank_account_holder', 'bank_name', 'bank_account_number', 'bank_routing_number'
        ];

        return requiredFields.every(field => {
            // First try to get value from formData if provided
            let value = formData?.get(field)?.toString().trim();

            // If not found in formData, get directly from the input element
            if (!value || value === 'undefined') {
                const input = document.querySelector(`[name="${field}"]`) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
                value = input?.value?.trim() || '';
            }

            return value && value.length > 0 && value !== 'undefined';
        });
    };

    // Detailed validation functions that return missing field information
    const validateStep2Detailed = (): { isValid: boolean; missingFields: string[] } => {
        const requiredFields = [
            { field: 'name', label: 'Full Name' },
            { field: 'business_name', label: 'Business Name' },
            { field: 'business_type', label: 'Business Type' },
            { field: 'tax_id', label: 'Tax ID' },
            { field: 'business_description', label: 'Business Description' },
            { field: 'phone', label: 'Phone Number' },
            { field: 'address_line_1', label: 'Address Line 1' },
            { field: 'city', label: 'City' },
            { field: 'state', label: 'State/Province' },
            { field: 'postal_code', label: 'Postal Code' },
            { field: 'country', label: 'Country' }
        ];

        const missingFields: string[] = [];

        requiredFields.forEach(({ field, label }) => {
            const input = document.querySelector(`[name="${field}"]`) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
            const value = input?.value?.trim() || '';

            if (!value || value === 'undefined') {
                missingFields.push(label);
            }
        });

        return { isValid: missingFields.length === 0, missingFields };
    };

    const validateStep3Detailed = (): { isValid: boolean; missingFields: string[] } => {
        const missingFields: string[] = [];

        if (officers.length === 0) {
            missingFields.push('At least one officer is required');
        } else {
            officers.forEach((officer, index) => {
                const officerNum = index + 1;
                if (!officer.name?.trim()) missingFields.push(`Officer ${officerNum} - Name`);
                if (!officer.position?.trim()) missingFields.push(`Officer ${officerNum} - Position`);
                if (!officer.id_type) missingFields.push(`Officer ${officerNum} - ID Type`);
                if (!officer.id_number?.trim()) missingFields.push(`Officer ${officerNum} - ID Number`);
                if (!officer.date_of_birth) missingFields.push(`Officer ${officerNum} - Date of Birth`);
                if (!officer.nationality?.trim()) missingFields.push(`Officer ${officerNum} - Nationality`);
                if (!officer.address?.trim()) missingFields.push(`Officer ${officerNum} - Address`);
            });
        }

        return { isValid: missingFields.length === 0, missingFields };
    };

    const validateStep4Detailed = (): { isValid: boolean; missingFields: string[] } => {
        const missingFields: string[] = [];

        if (beneficialOwners.length === 0) {
            missingFields.push('At least one beneficial owner is required');
        } else {
            beneficialOwners.forEach((owner, index) => {
                const ownerNum = index + 1;
                if (!owner.name?.trim()) missingFields.push(`Beneficial Owner ${ownerNum} - Name`);
                if (!owner.ownership_percentage || parseFloat(owner.ownership_percentage) < 25) {
                    missingFields.push(`Beneficial Owner ${ownerNum} - Ownership Percentage (minimum 25%)`);
                }
                if (!owner.id_type) missingFields.push(`Beneficial Owner ${ownerNum} - ID Type`);
                if (!owner.id_number?.trim()) missingFields.push(`Beneficial Owner ${ownerNum} - ID Number`);
                if (!owner.date_of_birth) missingFields.push(`Beneficial Owner ${ownerNum} - Date of Birth`);
                if (!owner.nationality?.trim()) missingFields.push(`Beneficial Owner ${ownerNum} - Nationality`);
                if (!owner.address?.trim()) missingFields.push(`Beneficial Owner ${ownerNum} - Address`);
            });
        }

        return { isValid: missingFields.length === 0, missingFields };
    };

    const validateStep5Detailed = (): { isValid: boolean; missingFields: string[] } => {
        const requiredFields = [
            { field: 'bank_account_holder', label: 'Bank Account Holder' },
            { field: 'bank_name', label: 'Bank Name' },
            { field: 'bank_account_number', label: 'Bank Account Number' },
            { field: 'bank_routing_number', label: 'Bank Routing Number' }
        ];

        const missingFields: string[] = [];

        console.log('🔍 Step 5 Validation Debug:');
        requiredFields.forEach(({ field, label }) => {
            const input = document.querySelector(`[name="${field}"]`) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
            const value = input?.value?.trim() || '';
            console.log(`  - ${field}: "${value}" (element found: ${!!input})`);

            if (!value || value === 'undefined') {
                missingFields.push(label);
            }
        });
        console.log(`  - Missing fields: [${missingFields.join(', ')}]`);
        console.log(`  - Is valid: ${missingFields.length === 0}`);

        return { isValid: missingFields.length === 0, missingFields };
    };

    const checkStepValidity = (): { isValid: boolean; missingFields?: string[] } => {
        switch (currentStep) {
            case 1:
                return { isValid: isOtpVerified };
            case 2:
                return validateStep2Detailed();
            case 3:
                return validateStep3Detailed();
            case 4:
                return validateStep4Detailed();
            case 5:
                return validateStep5Detailed();
            default:
                return { isValid: false };
        }
    };

    // Populate form fields when step changes or form data is loaded
    useEffect(() => {
        console.log(`🔄 Form population useEffect triggered (Step ${currentStep})`);
        console.log('  - isOtpVerified:', isOtpVerified);
        console.log('  - formData keys:', Object.keys(formData));

        if (!isOtpVerified || Object.keys(formData).length === 0) {
            console.log('❌ Skipping form population - conditions not met');
            return;
        }

        console.log('✅ Proceeding with form population...');

        // Small delay to ensure DOM is rendered
        const timer = setTimeout(() => {
            console.log(`🎯 Starting field population for Step ${currentStep}...`);

            // Only populate fields that are visible on current step
            const visibleFields: any[] = [];
            const hiddenFields: any[] = [];

            Object.entries(formData).forEach(([key, value]) => {
                const input = document.querySelector(`[name="${key}"]`) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

                if (input && value !== null && value !== undefined) {
                    const stringValue = String(value);
                    input.value = stringValue;
                    visibleFields.push({ key, value: stringValue });
                } else if (!input) {
                    hiddenFields.push({ key, value });
                }
            });

            console.log(`✅ Populated ${visibleFields.length} visible fields:`, visibleFields.map(f => f.key));
            if (hiddenFields.length > 0) {
                console.log(`ℹ️  ${hiddenFields.length} fields stored but not visible on this step:`, hiddenFields.map(f => f.key));
            }
            console.log('🎯 Field population completed');
        }, 100);

        return () => clearTimeout(timer);
    }, [currentStep, formData, isOtpVerified]);

    // Auto-save draft to server periodically
    useEffect(() => {
        if (!isOtpVerified) return;

        const interval = setInterval(() => {
            saveDraft();
        }, 10000); // Save every 10 seconds

        return () => clearInterval(interval);
    }, [currentStep, officers, beneficialOwners, isOtpVerified]);

    // Save draft when officers or beneficial owners change
    useEffect(() => {
        if (isOtpVerified) {
            const timeoutId = setTimeout(() => {
                saveDraft();
            }, 2000); // Debounce saves by 2 seconds

            return () => clearTimeout(timeoutId);
        }
    }, [officers, beneficialOwners, isOtpVerified]);

    // Save draft when form fields change (debounced)
    useEffect(() => {
        if (!isOtpVerified) return;

        const form = document.querySelector('form');
        if (form) {
            const inputs = form.querySelectorAll('input, textarea, select');
            const cleanup: Array<() => void> = [];

            inputs.forEach(input => {
                let timeoutId: NodeJS.Timeout;

                const debouncedSave = () => {
                    clearTimeout(timeoutId);
                    timeoutId = setTimeout(() => {
                        saveDraft();
                    }, 3000);
                };

                input.addEventListener('input', debouncedSave);
                input.addEventListener('change', debouncedSave);

                cleanup.push(() => {
                    input.removeEventListener('input', debouncedSave);
                    input.removeEventListener('change', debouncedSave);
                    clearTimeout(timeoutId);
                });
            });

            return () => cleanup.forEach(fn => fn());
        }
    }, [currentStep, isOtpVerified]);

    // Auto-load draft data when email changes or page loads
    useEffect(() => {
        if (userEmail) {
            loadDraft(userEmail);
        }
    }, [userEmail]);

    // Also try to load draft when page first loads if email is in form
    useEffect(() => {
        const emailInput = document.querySelector('[name="email"]') as HTMLInputElement;
        if (emailInput?.value && !userEmail) {
            setUserEmail(emailInput.value);
        }
    }, []);

    return (
        <AuthWideLayout
            title="Register as Merchant"
            description="Complete your business information to join our marketplace"
        >
            <Head title="Merchant Registration" />
            <ToastContainer toasts={toasts} removeToast={removeToast} />

            <FlashMessages flash={flash} />


            {/* Step Progress Indicator */}
            <div className="mb-8">
                <div className="flex items-center justify-center">
                    {steps.map((step, index) => (
                        <div key={step.number} className="flex items-center">
                            <div
                                className={`flex flex-col items-center text-center ${
                                    canGoToStep(step.number) ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'
                                }`}
                                onClick={() => goToStep(step.number)}
                            >
                                <div
                                    className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors ${
                                        currentStep > step.number
                                            ? 'bg-green-600 border-green-600 text-white'
                                            : currentStep === step.number
                                                ? 'bg-blue-600 border-blue-600 text-white'
                                                : 'border-gray-300 text-gray-500'
                                    }`}
                                >
                                    {currentStep > step.number ? (
                                        <Check className="w-5 h-5" />
                                    ) : (
                                        <span className="text-sm font-bold">{step.number}</span>
                                    )}
                                </div>
                                <p className={`mt-2 text-xs font-medium max-w-20 ${
                                    currentStep >= step.number ? 'text-gray-900 dark:text-white' : 'text-gray-500'
                                }`}>
                                    {step.title}
                                </p>
                            </div>
                            {index < steps.length - 1 && (
                                <div className={`flex-1 h-0.5 mx-6 ${
                                    currentStep > step.number ? 'bg-green-600' : 'bg-gray-300'
                                }`} />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <Form
                {...RegisteredUserController.store.form()}
                disableWhileProcessing
                onSuccess={() => {
                    console.log('🎉 Form submission successful!');
                    setShowSuccessDialog(true);
                }}
                onError={(errors) => {
                    console.error('❌ Form submission failed:', errors);
                }}
                onStart={() => {
                    console.log('🚀 Form submission started');
                }}
                className="flex flex-col gap-6 w-full max-w-none"
            >
                {({ processing, errors }) => (
                    <>
                        {/* Hidden role field */}
                        <input type="hidden" name="role" value="merchant" />

                        <div className="grid gap-6">
                            {/* Step 1: Email Verification */}
                            {currentStep === 1 && (
                                <div className="space-y-6">
                                    <div className="text-center">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Email Verification</h3>
                                        <p className="text-sm text-muted-foreground">
                                            First, let's verify your email address to secure your merchant registration.
                                        </p>
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="email">Email Address</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            required
                                            autoComplete="email"
                                            name="email"
                                            placeholder="your@email.com"
                                            onChange={async (e) => {
                                                const email = e.target.value.trim();
                                                console.log('📧 Email field changed:', email);

                                                if (email && email.includes('@')) {
                                                    console.log('✅ Email looks valid, checking for draft...');

                                                    // Check if this email already has a verified draft
                                                    try {
                                                        console.log('🔍 Calling /api/load-draft for:', email);
                                                        const response = await fetch('/api/load-draft', {
                                                            method: 'POST',
                                                            headers: {
                                                                'Content-Type': 'application/json',
                                                                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                                                            },
                                                            body: JSON.stringify({ email }),
                                                        });

                                                        console.log('📡 API Response status:', response.status);

                                                        if (response.ok) {
                                                            const data = await response.json();
                                                            const draft = data.draft;
                                                            console.log('✅ Draft found:', draft);

                                                            // Email is already verified, skip verification
                                                            setIsOtpVerified(true);
                                                            setIsOtpSent(true);
                                                            setUserEmail(email); // Store the email
                                                            setCurrentStep(draft.current_step);
                                                            setOfficers(draft.officers.length > 0 ? draft.officers : officers);
                                                            setBeneficialOwners(draft.beneficial_owners.length > 0 ? draft.beneficial_owners : beneficialOwners);

                                                            // Store form data in React state - useEffect will handle DOM population
                                                            setFormData(draft.form_data || {});

                                                            console.log('✅ Verified email found, skipping verification');
                                                        } else {
                                                            console.log('❌ No verified draft found');
                                                            // No verified draft found, reset verification state
                                                            setIsOtpVerified(false);
                                                            setIsOtpSent(false);
                                                            setCurrentStep(1);
                                                        }
                                                    } catch (error) {
                                                        console.error('❌ Error checking draft:', error);
                                                        // Reset verification state on error
                                                        setIsOtpVerified(false);
                                                        setIsOtpSent(false);
                                                        setCurrentStep(1);
                                                    }
                                                } else {
                                                    console.log('⏭️  Email not valid yet, skipping draft check');
                                                }
                                            }}
                                        />
                                        <InputError message={errors.email} />
                                    </div>

                                    {!isOtpVerified && (
                                        <>
                                            {!isOtpSent ? (
                                                <div className="text-center space-y-4">
                                                    <Button
                                                        type="button"
                                                        onClick={sendOtp}
                                                        disabled={otpLoading}
                                                        className="w-full"
                                                    >
                                                        {otpLoading && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                                        Send Verification Code
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="space-y-4">
                                                    <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg text-center">
                                                        <p className="text-sm text-green-800 dark:text-green-200">
                                                            Verification code sent! Please check your email and enter the code below.
                                                        </p>
                                                    </div>

                                                    <div className="grid gap-2">
                                                        <Label htmlFor="otp">Verification Code</Label>
                                                        <Input
                                                            id="otp"
                                                            type="text"
                                                            value={otp}
                                                            onChange={(e) => setOtp(e.target.value)}
                                                            placeholder="Enter 6-digit code"
                                                            maxLength={6}
                                                            className="text-center text-2xl tracking-widest"
                                                        />
                                                    </div>

                                                    <Button
                                                        type="button"
                                                        onClick={verifyOtp}
                                                        disabled={otpLoading || otp.length !== 6}
                                                        className="w-full"
                                                    >
                                                        {otpLoading && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                                        Verify Code
                                                    </Button>

                                                    <div className="text-center">
                                                        <button
                                                            type="button"
                                                            onClick={sendOtp}
                                                            disabled={otpLoading}
                                                            className="text-sm text-blue-600 hover:text-blue-800 underline"
                                                        >
                                                            Resend Code
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}

                                    {isOtpVerified && (
                                        <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg text-center">
                                            <div className="flex items-center justify-center space-x-2">
                                                <Check className="w-5 h-5 text-green-600" />
                                                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                                                    Email verified successfully!
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Step 2: Basic Information */}
                            {currentStep === 2 && (
                                <div className="space-y-8">
                                    {/* Personal Information Section */}
                                    <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Personal Information</h3>

                                <div className="space-y-6">
                                    <div className="grid gap-2">
                                        <Label htmlFor="name">Full Name</Label>
                                        <Input
                                            id="name"
                                            type="text"
                                            required
                                            autoFocus
                                            autoComplete="name"
                                            name="name"
                                            placeholder="Your full name"
                                        />
                                        <InputError message={errors.name} />
                                    </div>

                                    <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                                        <p className="text-sm text-blue-800 dark:text-blue-200">
                                            <Check className="inline w-4 h-4 mr-2" />
                                            Email verified: {(() => {
                                                const form = document.querySelector('form') as HTMLFormElement;
                                                if (form) {
                                                    const formData = new FormData(form);
                                                    return formData.get('email') as string || 'your email address';
                                                }
                                                return 'your email address';
                                            })()}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Business Information Section */}
                            <div className="space-y-4 border-t pt-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Business Information</h3>

                                <div className="space-y-6">
                                    <div className="grid gap-2">
                                        <Label htmlFor="business_name">Business Name</Label>
                                        <Input
                                            id="business_name"
                                            type="text"
                                            required
                                            name="business_name"
                                            placeholder="Your registered business name"
                                        />
                                        <InputError message={errors.business_name} />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="grid gap-2">
                                            <Label htmlFor="business_type">Business Type</Label>
                                            <select
                                                id="business_type"
                                                name="business_type"
                                                required
                                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                <option value="">Select business type</option>
                                                <option value="sole_proprietorship">Sole Proprietorship</option>
                                                <option value="partnership">Partnership</option>
                                                <option value="corporation">Corporation</option>
                                                <option value="cooperative">Cooperative</option>
                                            </select>
                                            <InputError message={errors.business_type} />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="tax_id">Tax ID (TIN/EIN)</Label>
                                            <Input
                                                id="tax_id"
                                                type="text"
                                                required
                                                name="tax_id"
                                                placeholder="Your BIR Tax Identification Number"
                                            />
                                            <InputError message={errors.tax_id} />
                                        </div>
                                    </div>

                                    <div className="grid gap-2 md:col-span-3">
                                        <Label htmlFor="business_description">Business Description</Label>
                                        <Textarea
                                            id="business_description"
                                            required
                                            name="business_description"
                                            placeholder="Describe your business activities and services"
                                            rows={4}
                                        />
                                        <InputError message={errors.business_description} />
                                    </div>
                                </div>
                            </div>

                            {/* Contact Information Section */}
                            <div className="space-y-4 border-t pt-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Contact Information</h3>

                                <div className="grid gap-2">
                                    <Label htmlFor="phone">Business Phone</Label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        required
                                        name="phone"
                                        placeholder="+63 XXX XXX XXXX"
                                    />
                                    <InputError message={errors.phone} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="website">Website (Optional)</Label>
                                    <Input
                                        id="website"
                                        type="url"
                                        name="website"
                                        placeholder="https://yourbusiness.com"
                                    />
                                    <InputError message={errors.website} />
                                </div>
                            </div>

                            {/* Business Address Section */}
                            <div className="space-y-4 border-t pt-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Business Address</h3>

                                <div className="grid gap-2">
                                    <Label htmlFor="address_line_1">Address Line 1</Label>
                                    <Input
                                        id="address_line_1"
                                        type="text"
                                        required
                                        name="address_line_1"
                                        placeholder="Street address, building number"
                                    />
                                    <InputError message={errors.address_line_1} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="address_line_2">Address Line 2 (Optional)</Label>
                                    <Input
                                        id="address_line_2"
                                        type="text"
                                        name="address_line_2"
                                        placeholder="Apartment, suite, floor, etc."
                                    />
                                    <InputError message={errors.address_line_2} />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="city">City</Label>
                                        <Input
                                            id="city"
                                            type="text"
                                            required
                                            name="city"
                                            placeholder="City"
                                        />
                                        <InputError message={errors.city} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="state">Province/State</Label>
                                        <Input
                                            id="state"
                                            type="text"
                                            required
                                            name="state"
                                            placeholder="Province or State"
                                        />
                                        <InputError message={errors.state} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="postal_code">Postal Code</Label>
                                        <Input
                                            id="postal_code"
                                            type="text"
                                            required
                                            name="postal_code"
                                            placeholder="Postal/ZIP Code"
                                        />
                                        <InputError message={errors.postal_code} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="country">Country</Label>
                                        <Input
                                            id="country"
                                            type="text"
                                            required
                                            name="country"
                                            defaultValue="Philippines"
                                            placeholder="Country"
                                        />
                                        <InputError message={errors.country} />
                                    </div>
                                </div>
                            </div>

                                </div>
                            )}

                            {/* Step 3: Company Officers */}
                            {currentStep === 3 && (
                                <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Company Officers</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Provide information about key company officers (CEO, President, Directors, etc.)
                                        </p>
                                    </div>
                                    <Button type="button" variant="outline" size="sm" onClick={addOfficer}>
                                        <Plus className="w-4 h-4 mr-1" />
                                        Add Officer
                                    </Button>
                                </div>

                                {officers.map((officer, index) => (
                                    <div key={index} className="border rounded-lg p-4 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-medium text-gray-900 dark:text-white">Officer {index + 1}</h4>
                                            {officers.length > 1 && (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => removeOfficer(index)}
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            )}
                                        </div>

                                        <input
                                            type="hidden"
                                            name={`officers[${index}][name]`}
                                            value={officer.name}
                                        />
                                        <input
                                            type="hidden"
                                            name={`officers[${index}][position]`}
                                            value={officer.position}
                                        />
                                        <input
                                            type="hidden"
                                            name={`officers[${index}][id_type]`}
                                            value={officer.id_type}
                                        />
                                        <input
                                            type="hidden"
                                            name={`officers[${index}][id_number]`}
                                            value={officer.id_number}
                                        />
                                        <input
                                            type="hidden"
                                            name={`officers[${index}][date_of_birth]`}
                                            value={officer.date_of_birth}
                                        />
                                        <input
                                            type="hidden"
                                            name={`officers[${index}][nationality]`}
                                            value={officer.nationality}
                                        />
                                        <input
                                            type="hidden"
                                            name={`officers[${index}][address]`}
                                            value={officer.address}
                                        />

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="grid gap-2">
                                                <Label>Full Name</Label>
                                                <Input
                                                    type="text"
                                                    required
                                                    value={officer.name}
                                                    onChange={(e) => updateOfficer(index, 'name', e.target.value)}
                                                    placeholder="Officer's full name"
                                                />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label>Position</Label>
                                                <Input
                                                    type="text"
                                                    required
                                                    value={officer.position}
                                                    onChange={(e) => updateOfficer(index, 'position', e.target.value)}
                                                    placeholder="e.g., CEO, President, Director"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="grid gap-2">
                                                <Label>ID Type</Label>
                                                <select
                                                    required
                                                    value={officer.id_type}
                                                    onChange={(e) => updateOfficer(index, 'id_type', e.target.value)}
                                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    <option value="">Select ID type</option>
                                                    <option value="passport">Passport</option>
                                                    <option value="drivers_license">Driver's License</option>
                                                    <option value="sss_id">SSS ID</option>
                                                    <option value="philhealth_id">PhilHealth ID</option>
                                                    <option value="postal_id">Postal ID</option>
                                                    <option value="voters_id">Voter's ID</option>
                                                    <option value="prc_id">PRC ID</option>
                                                </select>
                                            </div>
                                            <div className="grid gap-2">
                                                <Label>ID Number</Label>
                                                <Input
                                                    type="text"
                                                    required
                                                    value={officer.id_number}
                                                    onChange={(e) => updateOfficer(index, 'id_number', e.target.value)}
                                                    placeholder="ID number"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="grid gap-2">
                                                <Label>Date of Birth</Label>
                                                <Input
                                                    type="date"
                                                    required
                                                    value={officer.date_of_birth}
                                                    onChange={(e) => updateOfficer(index, 'date_of_birth', e.target.value)}
                                                />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label>Nationality</Label>
                                                <Input
                                                    type="text"
                                                    required
                                                    value={officer.nationality}
                                                    onChange={(e) => updateOfficer(index, 'nationality', e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid gap-2">
                                            <Label>Address</Label>
                                            <Textarea
                                                required
                                                value={officer.address}
                                                onChange={(e) => updateOfficer(index, 'address', e.target.value)}
                                                placeholder="Officer's current address"
                                                rows={2}
                                            />
                                        </div>
                                    </div>
                                ))}
                                </div>
                            )}

                            {/* Step 4: Beneficial Owners */}
                            {currentStep === 4 && (
                                <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Beneficial Owners</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Individuals who own 25% or more of the company (Ultimate Beneficial Owners)
                                        </p>
                                    </div>
                                    <Button type="button" variant="outline" size="sm" onClick={addBeneficialOwner}>
                                        <Plus className="w-4 h-4 mr-1" />
                                        Add Beneficial Owner
                                    </Button>
                                </div>

                                {beneficialOwners.map((owner, index) => (
                                    <div key={index} className="border rounded-lg p-4 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-medium text-gray-900 dark:text-white">Beneficial Owner {index + 1}</h4>
                                            {beneficialOwners.length > 1 && (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => removeBeneficialOwner(index)}
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            )}
                                        </div>

                                        <input
                                            type="hidden"
                                            name={`beneficial_owners[${index}][name]`}
                                            value={owner.name}
                                        />
                                        <input
                                            type="hidden"
                                            name={`beneficial_owners[${index}][ownership_percentage]`}
                                            value={owner.ownership_percentage}
                                        />
                                        <input
                                            type="hidden"
                                            name={`beneficial_owners[${index}][id_type]`}
                                            value={owner.id_type}
                                        />
                                        <input
                                            type="hidden"
                                            name={`beneficial_owners[${index}][id_number]`}
                                            value={owner.id_number}
                                        />
                                        <input
                                            type="hidden"
                                            name={`beneficial_owners[${index}][date_of_birth]`}
                                            value={owner.date_of_birth}
                                        />
                                        <input
                                            type="hidden"
                                            name={`beneficial_owners[${index}][nationality]`}
                                            value={owner.nationality}
                                        />
                                        <input
                                            type="hidden"
                                            name={`beneficial_owners[${index}][address]`}
                                            value={owner.address}
                                        />
                                        <input
                                            type="hidden"
                                            name={`beneficial_owners[${index}][is_politically_exposed]`}
                                            value={owner.is_politically_exposed ? '1' : '0'}
                                        />

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="grid gap-2">
                                                <Label>Full Name</Label>
                                                <Input
                                                    type="text"
                                                    required
                                                    value={owner.name}
                                                    onChange={(e) => updateBeneficialOwner(index, 'name', e.target.value)}
                                                    placeholder="Beneficial owner's full name"
                                                />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label>Ownership Percentage</Label>
                                                <Input
                                                    type="number"
                                                    min="25"
                                                    max="100"
                                                    step="0.01"
                                                    required
                                                    value={owner.ownership_percentage}
                                                    onChange={(e) => updateBeneficialOwner(index, 'ownership_percentage', e.target.value)}
                                                    placeholder="e.g., 25.5"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="grid gap-2">
                                                <Label>ID Type</Label>
                                                <select
                                                    required
                                                    value={owner.id_type}
                                                    onChange={(e) => updateBeneficialOwner(index, 'id_type', e.target.value)}
                                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    <option value="">Select ID type</option>
                                                    <option value="passport">Passport</option>
                                                    <option value="drivers_license">Driver's License</option>
                                                    <option value="sss_id">SSS ID</option>
                                                    <option value="philhealth_id">PhilHealth ID</option>
                                                    <option value="postal_id">Postal ID</option>
                                                    <option value="voters_id">Voter's ID</option>
                                                    <option value="prc_id">PRC ID</option>
                                                </select>
                                            </div>
                                            <div className="grid gap-2">
                                                <Label>ID Number</Label>
                                                <Input
                                                    type="text"
                                                    required
                                                    value={owner.id_number}
                                                    onChange={(e) => updateBeneficialOwner(index, 'id_number', e.target.value)}
                                                    placeholder="ID number"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="grid gap-2">
                                                <Label>Date of Birth</Label>
                                                <Input
                                                    type="date"
                                                    required
                                                    value={owner.date_of_birth}
                                                    onChange={(e) => updateBeneficialOwner(index, 'date_of_birth', e.target.value)}
                                                />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label>Nationality</Label>
                                                <Input
                                                    type="text"
                                                    required
                                                    value={owner.nationality}
                                                    onChange={(e) => updateBeneficialOwner(index, 'nationality', e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid gap-2">
                                            <Label>Address</Label>
                                            <Textarea
                                                required
                                                value={owner.address}
                                                onChange={(e) => updateBeneficialOwner(index, 'address', e.target.value)}
                                                placeholder="Beneficial owner's current address"
                                                rows={2}
                                            />
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                id={`politically_exposed_${index}`}
                                                checked={owner.is_politically_exposed}
                                                onChange={(e) => updateBeneficialOwner(index, 'is_politically_exposed', e.target.checked)}
                                                className="rounded border-gray-300"
                                            />
                                            <Label htmlFor={`politically_exposed_${index}`} className="text-sm">
                                                This person is a Politically Exposed Person (PEP) or related to one
                                            </Label>
                                        </div>
                                    </div>
                                ))}
                                </div>
                            )}

                            {/* Step 5: Banking Information & Required Documents */}
                            {currentStep === 5 && (
                                <div className="space-y-8">
                                    {/* Hidden input to reference the draft registration */}
                                    <input type="hidden" name="email" value={userEmail} />
                                    <input type="hidden" name="submit_from_draft" value="1" />

                                    {/* Banking Information Section */}
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Banking Information</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Required for payment processing and payouts
                                        </p>

                                        <div className="space-y-6">
                                            <div className="grid gap-2">
                                                <Label htmlFor="bank_account_holder">Account Holder Name</Label>
                                                <Input
                                                    id="bank_account_holder"
                                                    type="text"
                                                    required
                                                    name="bank_account_holder"
                                                    placeholder="Name as registered with the bank"
                                                />
                                                <InputError message={errors.bank_account_holder} />
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor="bank_name">Bank Name</Label>
                                                <Input
                                                    id="bank_name"
                                                    type="text"
                                                    required
                                                    name="bank_name"
                                                    placeholder="Your bank's name"
                                                />
                                                <InputError message={errors.bank_name} />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="grid gap-2">
                                                    <Label htmlFor="bank_account_number">Account Number</Label>
                                                    <Input
                                                        id="bank_account_number"
                                                        type="text"
                                                        required
                                                        name="bank_account_number"
                                                        placeholder="Account number"
                                                    />
                                                    <InputError message={errors.bank_account_number} />
                                                </div>

                                                <div className="grid gap-2">
                                                    <Label htmlFor="bank_routing_number">Routing Number</Label>
                                                    <Input
                                                        id="bank_routing_number"
                                                        type="text"
                                                        required
                                                        name="bank_routing_number"
                                                        placeholder="Bank routing number"
                                                    />
                                                    <InputError message={errors.bank_routing_number} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Required Documents Section */}
                                    <div className="space-y-4 border-t pt-6">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Required Documents</h3>
                                <p className="text-sm text-muted-foreground">
                                    The following documents will be required after registration. You can upload them from your merchant dashboard.
                                </p>

                                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md">
                                    <ul className="text-sm space-y-2">
                                        <li>• SEC/DTI Registration Certificate</li>
                                        <li>• BIR Certificate of Registration</li>
                                        <li>• Mayor's Permit / Business Permit</li>
                                        <li>• Valid Government ID of Owner/Officers</li>
                                        <li>• Bank Certificate</li>
                                        <li>• Articles of Incorporation (if corporation)</li>
                                    </ul>
                                    </div>
                                </div>
                                </div>
                            )}

                            {/* Navigation Buttons */}
                            <div className="flex justify-between mt-8">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={prevStep}
                                    disabled={currentStep === 1}
                                    className="flex items-center"
                                >
                                    <ChevronLeft className="w-4 h-4 mr-2" />
                                    Previous
                                </Button>

                                {currentStep < totalSteps ? (
                                    <Button
                                        type="button"
                                        onClick={nextStep}
                                        className="flex items-center"
                                    >
                                        Next
                                        <ChevronRight className="w-4 h-4 ml-2" />
                                    </Button>
                                ) : (
                                    <Button type="submit" disabled={processing} className="flex items-center">
                                        {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                        Submit Application
                                    </Button>
                                )}
                            </div>
                        </div>

                        <div className="text-center text-sm text-muted-foreground">
                            Already have an account?{' '}
                            <TextLink href={login()}>
                                Log in
                            </TextLink>
                        </div>

                        <div className="text-center text-sm text-muted-foreground">
                            Want to register as a buyer instead?{' '}
                            <TextLink href="/register">
                                Register as Buyer
                            </TextLink>
                        </div>
                    </>
                )}
            </Form>

            {/* Success Dialog */}
            <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                                <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                            </div>
                            Application Submitted Successfully!
                        </DialogTitle>
                        <DialogDescription className="text-left space-y-3">
                            <p>
                                Thank you for submitting your merchant registration application to PA Insurance Marketplace.
                            </p>
                            <p>
                                Your application has been received and is now under review by our team. We will evaluate your information and documentation to ensure compliance with our marketplace standards.
                            </p>
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                                    What happens next?
                                </p>
                                <ul className="text-sm text-blue-800 dark:text-blue-200 mt-2 space-y-1">
                                    <li>• Our team will review your application within 3-5 business days</li>
                                    <li>• You will receive an email notification with the approval status</li>
                                    <li>• Once approved, you can start listing your insurance products</li>
                                </ul>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                You can now access your merchant dashboard to track your application status.
                            </p>
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col sm:flex-row gap-3 mt-6">
                        <Button
                            onClick={() => window.location.href = '/merchant/dashboard'}
                            className="flex-1"
                        >
                            Go to Dashboard
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => setShowSuccessDialog(false)}
                            className="flex-1"
                        >
                            Close
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </AuthWideLayout>
    );
}