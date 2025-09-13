import MerchantLayout from '@/layouts/MerchantLayout';
import { Head } from '@inertiajs/react';

interface Store {
    id: string;
    name: string;
    description: string;
    status: 'pending' | 'approved' | 'suspended';
    contact_email: string;
    contact_phone?: string;
    address: string;
    created_at: string;
    updated_at: string;
}

interface StoreUnderReviewProps {
    store: Store;
}

export default function StoreUnderReview({ store }: StoreUnderReviewProps) {
    return (
        <MerchantLayout header={<h2 className="text-xl leading-tight font-semibold text-gray-800 dark:text-gray-200">Store Under Review</h2>}>
            <Head title="Store Under Review" />

            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-gray-800">
                        <div className="p-8 text-center">
                            <div className="mb-6">
                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900">
                                    <svg
                                        className="h-8 w-8 text-yellow-600 dark:text-yellow-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                </div>
                                <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">Your Store is Under Review</h1>
                                <p className="mb-6 text-gray-600 dark:text-gray-400">
                                    Thank you for submitting your store information. Our team is currently reviewing your application.
                                </p>
                            </div>

                            <div className="mb-6 rounded-lg bg-gray-50 p-6 dark:bg-gray-700">
                                <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Store Details</h3>
                                <div className="grid grid-cols-1 gap-4 text-left md:grid-cols-2">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Store Name</label>
                                        <p className="text-gray-900 dark:text-white">{store.name}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                                        <span className="inline-flex rounded-full bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                                            Pending Review
                                        </span>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Contact Email</label>
                                        <p className="text-gray-900 dark:text-white">{store.contact_email}</p>
                                    </div>
                                    {store.contact_phone && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Contact Phone</label>
                                            <p className="text-gray-900 dark:text-white">{store.contact_phone}</p>
                                        </div>
                                    )}
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Address</label>
                                        <p className="text-gray-900 dark:text-white">{store.address}</p>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                                        <p className="text-gray-900 dark:text-white">{store.description}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
                                <div className="flex items-center">
                                    <svg className="mr-2 h-5 w-5 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path
                                            fillRule="evenodd"
                                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    <div className="text-left">
                                        <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200">What happens next?</h4>
                                        <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                                            Our team will review your store information and get back to you within 24-48 hours. You'll receive an
                                            email notification once your store is approved.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                Submitted on{' '}
                                {new Date(store.created_at).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MerchantLayout>
    );
}
