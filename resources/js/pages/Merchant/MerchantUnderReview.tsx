import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface Merchant {
    business_name: string;
    status: string;
    created_at: string;
}

interface Props {
    merchant: Merchant;
}

export default function MerchantUnderReview({ merchant }: Props) {
    return (
        <div className="flex min-h-screen flex-col justify-center bg-gray-50 py-12 sm:px-6 lg:px-8 dark:bg-gray-900">
            <Head title="Merchant Account Under Review" />

            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">Account Under Review</h2>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Your merchant application is being reviewed by our team.</p>
                </div>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10 dark:bg-gray-800">
                    <div className="text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
                            <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">{merchant.business_name}</h3>
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                            Your merchant account application is currently under review. You'll receive an email notification once it has been
                            approved or if additional information is needed.
                        </p>
                        <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                            Applied on {new Date(merchant.created_at).toLocaleDateString()}
                        </p>
                        <div className="mt-6 space-y-3">
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Need to register a different business?
                            </p>
                            <Dialog>
                                <DialogTrigger asChild>
                                    <button className="flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">
                                        Sign Out & Register New Business
                                    </button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Sign out and register new business?</DialogTitle>
                                        <DialogDescription>
                                            You will be signed out of your current account. You can sign back in anytime to check your application status for <strong>{merchant.business_name}</strong>.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <DialogFooter>
                                        <Button variant="outline">Cancel</Button>
                                        <Button
                                            onClick={() => {
                                                router.post('/logout');
                                            }}
                                            variant="destructive"
                                        >
                                            Sign Out
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                            <p className="text-xs text-center text-gray-400 dark:text-gray-500">
                                Or simply wait for our team to review your application. You'll receive an email notification.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
