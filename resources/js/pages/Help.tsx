import StorefrontLayout from '@/layouts/StorefrontLayout';
import { Head, Link } from '@inertiajs/react';

export default function Help() {
    return (
        <StorefrontLayout>
            <Head title="Help Center - PA Insurance Marketplace" />

            <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
                {/* Hero Section */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                        Help Center
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                        Find answers to your questions about personal accident insurance and our marketplace.
                    </p>
                </div>

                {/* Quick Links */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 text-center">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                            <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            General Questions
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">
                            Learn about personal accident insurance and how our marketplace works
                        </p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 text-center">
                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                            <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            Application Help
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">
                            Get assistance with your insurance application and documentation
                        </p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 text-center">
                        <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                            <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            Technical Support
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">
                            Get help with website issues and technical problems
                        </p>
                    </div>
                </div>

                {/* Frequently Asked Questions */}
                <div className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-8">
                        Frequently Asked Questions
                    </h2>

                    <div className="space-y-8">
                        {/* General Information */}
                        <div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
                                General Information
                            </h3>
                            <div className="space-y-6">
                                <div>
                                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                        What is personal accident insurance?
                                    </h4>
                                    <p className="text-gray-700 dark:text-gray-300">
                                        Personal accident insurance provides financial protection in case of unexpected accidents that result in injury, disability, or death. It covers accidental death benefits, permanent and temporary disability, and medical expenses related to accidents.
                                    </p>
                                </div>

                                <div>
                                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                        What coverage classes are available?
                                    </h4>
                                    <p className="text-gray-700 dark:text-gray-300 mb-2">
                                        We offer three classes of coverage:
                                    </p>
                                    <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1 ml-4">
                                        <li><strong>Class I:</strong> Individual coverage for basic accident protection</li>
                                        <li><strong>Class II:</strong> Extended coverage including spouse protection</li>
                                        <li><strong>Class III:</strong> Comprehensive family coverage including children</li>
                                    </ul>
                                </div>

                                <div>
                                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                        How do I compare different insurance providers?
                                    </h4>
                                    <p className="text-gray-700 dark:text-gray-300">
                                        Our marketplace allows you to easily compare coverage options, benefits, and pricing from multiple trusted insurance providers in one place. Browse the products page to see all available options side by side.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Application Process */}
                        <div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
                                Application Process
                            </h3>
                            <div className="space-y-6">
                                <div>
                                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                        How do I apply for personal accident insurance?
                                    </h4>
                                    <p className="text-gray-700 dark:text-gray-300">
                                        Browse our marketplace, compare different insurance options, and click "Add to Cart" on your preferred policy. Follow the checkout process to complete your application with the required personal and occupational information.
                                    </p>
                                </div>

                                <div>
                                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                        How long does the approval process take?
                                    </h4>
                                    <p className="text-gray-700 dark:text-gray-300">
                                        Most applications are processed within 24-48 hours. You'll receive email updates throughout the process and can track your application status in your account dashboard.
                                    </p>
                                </div>

                                <div>
                                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                        What documents do I need to provide?
                                    </h4>
                                    <p className="text-gray-700 dark:text-gray-300">
                                        You'll typically need to provide valid identification, proof of income, and occupational details. Specific requirements may vary depending on the coverage level and provider you choose.
                                    </p>
                                </div>

                                <div>
                                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                        Can I save my application and complete it later?
                                    </h4>
                                    <p className="text-gray-700 dark:text-gray-300">
                                        Yes, our system automatically saves your progress as you complete the application. You can return at any time to finish where you left off.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Payment & Coverage */}
                        <div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
                                Payment & Coverage
                            </h3>
                            <div className="space-y-6">
                                <div>
                                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                        What payment methods do you accept?
                                    </h4>
                                    <p className="text-gray-700 dark:text-gray-300">
                                        We accept various payment methods including credit cards, debit cards, bank transfers, and digital wallets for your convenience.
                                    </p>
                                </div>

                                <div>
                                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                        When does my coverage begin?
                                    </h4>
                                    <p className="text-gray-700 dark:text-gray-300">
                                        Coverage typically begins immediately after your application is approved and payment is processed. You'll receive your policy documents via email confirmation.
                                    </p>
                                </div>

                                <div>
                                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                        How do I file a claim?
                                    </h4>
                                    <p className="text-gray-700 dark:text-gray-300">
                                        Contact your insurance provider directly using the contact information provided in your policy documents. Each provider has their own claims process and requirements.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contact Information */}
                <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-lg">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-6">
                        Still Need Help?
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 text-center mb-8">
                        Can't find what you're looking for? Our support team is here to help.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center">
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                Email Support
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">
                                Get help via email
                            </p>
                            <a href="mailto:support@painsurance.ph" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                                support@painsurance.ph
                            </a>
                        </div>

                        <div className="text-center">
                            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                Phone Support
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">
                                Monday - Friday: 8:00 AM - 6:00 PM (PHT)
                            </p>
                            <a href="tel:+63281234567" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                                +63 (2) 8123-4567
                            </a>
                        </div>

                        <div className="text-center">
                            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                Contact Form
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">
                                Send us a detailed message
                            </p>
                            <Link href="/contact" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                                Contact Us
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </StorefrontLayout>
    );
}