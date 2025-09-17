import StorefrontLayout from '@/layouts/StorefrontLayout';
import { Head } from '@inertiajs/react';

export default function About() {
    return (
        <StorefrontLayout>
            <Head title="About PA Insurance Marketplace" />

            <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
                {/* Hero Section */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                        About PA Insurance Marketplace
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                        Your trusted platform for finding the right personal accident insurance coverage from top providers across the Philippines.
                    </p>
                </div>

                {/* Main Content */}
                <div className="prose prose-lg max-w-none dark:prose-invert">
                    {/* Our Mission */}
                    <section className="mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Our Mission</h2>
                        <p className="text-gray-700 dark:text-gray-300 mb-4">
                            PA Insurance Marketplace is dedicated to making personal accident insurance accessible,
                            transparent, and easy to understand for every Filipino. We connect you with trusted
                            insurance providers to help you find the coverage that best fits your needs and budget.
                        </p>
                        <p className="text-gray-700 dark:text-gray-300">
                            Life is unpredictable, but your protection doesn't have to be. We believe everyone
                            deserves access to quality personal accident insurance that provides peace of mind
                            and financial security when it matters most.
                        </p>
                    </section>

                    {/* What We Offer */}
                    <section className="mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">What We Offer</h2>
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                                    Wide Selection of Providers
                                </h3>
                                <p className="text-gray-700 dark:text-gray-300">
                                    Compare personal accident insurance policies from multiple trusted providers
                                    in one convenient location. Find the coverage that matches your specific needs.
                                </p>
                            </div>

                            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                                    Transparent Pricing
                                </h3>
                                <p className="text-gray-700 dark:text-gray-300">
                                    No hidden fees or surprise costs. See clear pricing upfront and make
                                    informed decisions about your insurance coverage.
                                </p>
                            </div>

                            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                                    Easy Application Process
                                </h3>
                                <p className="text-gray-700 dark:text-gray-300">
                                    Our streamlined application process makes it simple to apply for and
                                    purchase personal accident insurance online.
                                </p>
                            </div>

                            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                                    Expert Support
                                </h3>
                                <p className="text-gray-700 dark:text-gray-300">
                                    Get help when you need it. Our platform connects you with experienced
                                    insurance professionals who can guide you through your options.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Personal Accident Insurance */}
                    <section className="mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                            Understanding Personal Accident Insurance
                        </h2>
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800 mb-6">
                            <p className="text-blue-900 dark:text-blue-100">
                                Personal accident insurance provides financial protection in case of unexpected
                                accidents that result in injury, disability, or death. It's designed to help
                                you and your family manage the financial impact of unforeseen events.
                            </p>
                        </div>

                        <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                            What's Typically Covered:
                        </h3>
                        <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 mb-6">
                            <li>Accidental death benefits</li>
                            <li>Permanent total disability</li>
                            <li>Permanent partial disability</li>
                            <li>Temporary total disability</li>
                            <li>Medical reimbursement for accident-related injuries</li>
                            <li>Hospital confinement benefits</li>
                        </ul>

                        <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                            Coverage Options Available:
                        </h3>
                        <div className="grid md:grid-cols-3 gap-4">
                            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Class I</h4>
                                <p className="text-gray-700 dark:text-gray-300 text-sm">
                                    Individual coverage for basic accident protection
                                </p>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Class II</h4>
                                <p className="text-gray-700 dark:text-gray-300 text-sm">
                                    Extended coverage including spouse protection
                                </p>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Class III</h4>
                                <p className="text-gray-700 dark:text-gray-300 text-sm">
                                    Comprehensive family coverage including children
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Why Choose Us */}
                    <section className="mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                            Why Choose PA Insurance Marketplace?
                        </h2>
                        <div className="space-y-6">
                            <div className="flex items-start space-x-4">
                                <div className="flex-shrink-0 w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                                    <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Trusted Partners</h3>
                                    <p className="text-gray-700 dark:text-gray-300">
                                        We work only with licensed and reputable insurance providers with proven track records in the Philippines.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-4">
                                <div className="flex-shrink-0 w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                                    <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Easy Comparison</h3>
                                    <p className="text-gray-700 dark:text-gray-300">
                                        Compare features, benefits, and pricing across different providers to make the best choice for your situation.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-4">
                                <div className="flex-shrink-0 w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                                    <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Secure & Reliable</h3>
                                    <p className="text-gray-700 dark:text-gray-300">
                                        Your personal information is protected with industry-standard security measures and encryption.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Get Started */}
                    <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 rounded-lg text-center">
                        <h2 className="text-3xl font-bold mb-4">Ready to Get Protected?</h2>
                        <p className="text-lg mb-6 max-w-2xl mx-auto">
                            Browse our selection of personal accident insurance options and find the coverage
                            that gives you and your family the protection you deserve.
                        </p>
                        <a
                            href="/products"
                            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-gray-50 transition-colors duration-200"
                        >
                            Explore Insurance Options
                        </a>
                    </section>
                </div>
            </div>
        </StorefrontLayout>
    );
}