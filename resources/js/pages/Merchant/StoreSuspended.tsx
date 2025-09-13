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

interface StoreSuspendedProps {
    store: Store;
}

export default function StoreSuspended({ store }: StoreSuspendedProps) {
    return (
        <MerchantLayout header={<h2 className="text-xl leading-tight font-semibold text-gray-800 dark:text-gray-200">Store Suspended</h2>}>
            <Head title="Store Suspended" />

            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-gray-800">
                        <div className="p-8 text-center">
                            <div className="mb-6">
                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
                                    <svg className="h-8 w-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z"
                                        />
                                    </svg>
                                </div>
                                <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">Your Store Has Been Suspended</h1>
                                <p className="mb-6 text-gray-600 dark:text-gray-400">
                                    Your store has been temporarily suspended. Please contact our support team for assistance.
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
                                        <span className="inline-flex rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-800 dark:bg-red-900 dark:text-red-200">
                                            Suspended
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

                            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
                                <div className="flex items-center">
                                    <svg className="mr-2 h-5 w-5 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path
                                            fillRule="evenodd"
                                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    <div className="text-left">
                                        <h4 className="text-sm font-medium text-red-800 dark:text-red-200">Why was my store suspended?</h4>
                                        <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                                            Your store may have been suspended due to policy violations, customer complaints, or other issues. Please
                                            contact our support team to resolve this issue and learn about the steps to reinstate your store.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex flex-col justify-center gap-4 sm:flex-row">
                                    <a
                                        href="mailto:support@marketplace.com"
                                        className="inline-flex items-center justify-center rounded-md border border-transparent bg-red-600 px-6 py-3 text-base font-medium text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none"
                                    >
                                        <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M3 8l7.89 7.89a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                            />
                                        </svg>
                                        Contact Support
                                    </a>
                                    <button
                                        type="button"
                                        className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-6 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                                    >
                                        <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                            />
                                        </svg>
                                        View Policies
                                    </button>
                                </div>

                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                    Store suspended on{' '}
                                    {new Date(store.updated_at).toLocaleDateString('en-US', {
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
            </div>
        </MerchantLayout>
    );
}
