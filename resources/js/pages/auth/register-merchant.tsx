import RegisteredUserController from '@/actions/App/Http/Controllers/Auth/RegisteredUserController';
import { login } from '@/routes';
import { Form, Head } from '@inertiajs/react';
import { LoaderCircle, Plus, Trash2, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { useState } from 'react';

import FlashMessages from '@/components/FlashMessages';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AuthWideLayout from '@/layouts/auth-wide-layout';

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
    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 4;

    const [officers, setOfficers] = useState<Officer[]>([
        { name: '', position: '', id_type: '', id_number: '', date_of_birth: '', nationality: 'Filipino', address: '' }
    ]);

    const [beneficialOwners, setBeneficialOwners] = useState<BeneficialOwner[]>([
        { name: '', ownership_percentage: '', id_type: '', id_number: '', date_of_birth: '', nationality: 'Filipino', address: '', is_politically_exposed: false }
    ]);

    const steps = [
        { number: 1, title: "Basic Information", description: "Personal, business, and contact details" },
        { number: 2, title: "Company Officers", description: "Key company officers and directors" },
        { number: 3, title: "Beneficial Owners", description: "Ultimate beneficial owners (25%+ ownership)" },
        { number: 4, title: "Required Documents", description: "Upload verification documents" }
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

    const nextStep = () => {
        if (currentStep < totalSteps) {
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const goToStep = (step: number) => {
        // Only allow going to steps that are accessible based on current validation
        if (step <= currentStep || canGoToStep(step)) {
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
                    if (!validateStep1(formData)) return false;
                    break;
                case 2:
                    if (!validateStep2()) return false;
                    break;
                case 3:
                    if (!validateStep3()) return false;
                    break;
                case 4:
                    if (!validateStep4(formData)) return false;
                    break;
            }
        }
        return true;
    };

    // Form validation for each step
    const validateStep1 = (formData: FormData): boolean => {
        const requiredFields = [
            'name', 'email',
            'business_name', 'business_type', 'tax_id', 'business_description',
            'phone', 'address_line_1', 'city', 'state', 'postal_code', 'country'
        ];

        return requiredFields.every(field => {
            const value = formData.get(field)?.toString().trim();
            return value && value.length > 0;
        });
    };

    const validateStep2 = (): boolean => {
        return officers.length > 0 && officers.every(officer =>
            officer.name.trim() &&
            officer.position.trim() &&
            officer.id_type &&
            officer.id_number.trim() &&
            officer.date_of_birth &&
            officer.nationality.trim() &&
            officer.address.trim()
        );
    };

    const validateStep3 = (): boolean => {
        return beneficialOwners.length > 0 && beneficialOwners.every(owner =>
            owner.name.trim() &&
            owner.ownership_percentage &&
            parseFloat(owner.ownership_percentage) >= 25 &&
            owner.id_type &&
            owner.id_number.trim() &&
            owner.date_of_birth &&
            owner.nationality.trim() &&
            owner.address.trim()
        );
    };

    const validateStep4 = (formData: FormData): boolean => {
        const requiredFields = [
            'bank_account_holder', 'bank_name', 'bank_account_number', 'bank_routing_number'
        ];

        return requiredFields.every(field => {
            const value = formData.get(field)?.toString().trim();
            return value && value.length > 0;
        });
    };

    const isCurrentStepValid = (): boolean => {
        const form = document.querySelector('form');
        if (!form) return false;

        const formData = new FormData(form);

        switch (currentStep) {
            case 1:
                const isValid = validateStep1(formData);
                console.log('Step 1 validation:', isValid);
                console.log('Form data:', Object.fromEntries(formData.entries()));
                return isValid;
            case 2:
                return validateStep2();
            case 3:
                return validateStep3();
            case 4:
                return validateStep4(formData);
            default:
                return false;
        }
    };
    return (
        <AuthWideLayout
            title="Register as Merchant"
            description="Complete your business information to join our marketplace"
        >
            <Head title="Merchant Registration" />

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
                className="flex flex-col gap-6 w-full max-w-none"
            >
                {({ processing, errors }) => (
                    <>
                        {/* Hidden role field */}
                        <input type="hidden" name="role" value="merchant" />

                        <div className="grid gap-6">
                            {/* Step 1: Basic Information */}
                            {currentStep === 1 && (
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

                                    <div className="grid gap-2">
                                        <Label htmlFor="email">Email Address</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            required
                                            autoComplete="email"
                                            name="email"
                                            placeholder="your@email.com"
                                        />
                                        <InputError message={errors.email} />
                                        <p className="text-xs text-muted-foreground mt-1">
                                            We'll send you a login code to this email address
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

                            {/* Step 2: Company Officers */}
                            {currentStep === 2 && (
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

                            {/* Step 3: Beneficial Owners */}
                            {currentStep === 3 && (
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

                            {/* Step 4: Banking Information & Required Documents */}
                            {currentStep === 4 && (
                                <div className="space-y-8">
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
                                        disabled={!isCurrentStepValid()}
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
        </AuthWideLayout>
    );
}