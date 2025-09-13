import { Head } from '@inertiajs/react';

interface Merchant {
    business_name: string;
    status: string;
    rejection_reason?: string;
}

interface Props {
    merchant: Merchant;
}

export default function MerchantRejected({ merchant }: Props) {
    return (
        <div className="flex min-h-screen flex-col justify-center bg-gray-50 py-12 sm:px-6 lg:px-8 dark:bg-gray-900">
            <Head title="Merchant Application Rejected" />

            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">Application Rejected</h2>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Your merchant application was not approved.</p>
                </div>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10 dark:bg-gray-800">
                    <div className="text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">Application Rejected</h3>
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                            Unfortunately, your merchant application for <strong>{merchant.business_name}</strong> was not approved at this time.
                        </p>
                        {merchant.rejection_reason && (
                            <div className="mt-4 rounded-md bg-red-50 p-4 dark:bg-red-900">
                                <p className="text-sm text-red-700 dark:text-red-300">
                                    <strong>Reason:</strong> {merchant.rejection_reason}
                                </p>
                            </div>
                        )}
                        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                            You can contact support if you believe this was an error or if you'd like to reapply in the future.
                        </p>
                        <div className="mt-6">
                            <button
                                onClick={() => window.history.back()}
                                className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
                            >
                                Go Back
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
