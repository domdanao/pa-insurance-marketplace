import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';

export default function OnboardingWelcome() {
    return (
        <AppLayout>
            <Head title="Welcome to the Platform" />

            <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-8 text-center">
                    <h1 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">Welcome to [Your Marketplace]! 🎉</h1>
                    <p className="text-lg text-gray-600 dark:text-gray-300">Let's get you set up and ready to start exploring.</p>
                </div>

                <div className="mb-8 rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                    <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
                        <p className="font-medium text-green-800 dark:text-green-200">⚠️ Template Placeholder - User Onboarding Flow</p>
                        <p className="mt-2 text-sm text-green-700 dark:text-green-300">
                            This is a placeholder for your user onboarding experience. Customize this flow based on your marketplace's specific needs
                            and user journey.
                        </p>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900">
                                    <span className="font-medium text-indigo-600 dark:text-indigo-300">1</span>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Complete Your Profile</h3>
                                <p className="text-gray-600 dark:text-gray-300">
                                    Add your preferences and interests to get personalized recommendations.
                                </p>
                                <Link href="/settings/profile" className="text-sm text-indigo-600 hover:underline dark:text-indigo-400">
                                    Complete Profile →
                                </Link>
                            </div>
                        </div>

                        <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900">
                                    <span className="font-medium text-indigo-600 dark:text-indigo-300">2</span>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Explore Products</h3>
                                <p className="text-gray-600 dark:text-gray-300">
                                    Browse our marketplace and discover amazing products from verified sellers.
                                </p>
                                <Link href="/products" className="text-sm text-indigo-600 hover:underline dark:text-indigo-400">
                                    Browse Products →
                                </Link>
                            </div>
                        </div>

                        <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900">
                                    <span className="font-medium text-indigo-600 dark:text-indigo-300">3</span>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Start Selling (Optional)</h3>
                                <p className="text-gray-600 dark:text-gray-300">
                                    Have something to sell? Join our community of merchants and start earning.
                                </p>
                                <Link href="/merchant/store/create" className="text-sm text-indigo-600 hover:underline dark:text-indigo-400">
                                    Become a Seller →
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-4 text-center">
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
                    >
                        Continue to Dashboard
                    </Link>

                    <div>
                        <Link href="/" className="text-sm text-gray-500 hover:underline dark:text-gray-400">
                            Skip onboarding and go to homepage
                        </Link>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
