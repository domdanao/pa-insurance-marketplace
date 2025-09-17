import StorefrontLayout from '@/layouts/StorefrontLayout';
import { Head } from '@inertiajs/react';

export default function Contact() {
    return (
        <StorefrontLayout>
            <Head title="Contact Us - PA Insurance Marketplace" />

            <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
                {/* Hero Section */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                        Contact Us
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                        Get in touch with our team for assistance with personal accident insurance inquiries, technical support, or partnership opportunities.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Contact Information */}
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                            Get In Touch
                        </h2>

                        <div className="space-y-6">
                            {/* Customer Support */}
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                                <div className="flex items-start space-x-4">
                                    <div className="flex-shrink-0">
                                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                                            <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                            Customer Support
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-300 mb-2">
                                            Need help with your insurance application or have questions about coverage?
                                        </p>
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                Email: <a href="mailto:support@painsurance.ph" className="text-blue-600 dark:text-blue-400 hover:underline">support@painsurance.ph</a>
                                            </p>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                Phone: <a href="tel:+63281234567" className="text-blue-600 dark:text-blue-400 hover:underline">+63 (2) 8123-4567</a>
                                            </p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Monday - Friday: 8:00 AM - 6:00 PM (PHT)
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Business Inquiries */}
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                                <div className="flex items-start space-x-4">
                                    <div className="flex-shrink-0">
                                        <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                                            <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                            Business & Partnerships
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-300 mb-2">
                                            Insurance providers interested in joining our marketplace or business partnerships.
                                        </p>
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                Email: <a href="mailto:partnerships@painsurance.ph" className="text-blue-600 dark:text-blue-400 hover:underline">partnerships@painsurance.ph</a>
                                            </p>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                Phone: <a href="tel:+63281234568" className="text-blue-600 dark:text-blue-400 hover:underline">+63 (2) 8123-4568</a>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Technical Support */}
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                                <div className="flex items-start space-x-4">
                                    <div className="flex-shrink-0">
                                        <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                                            <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                            Technical Support
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-300 mb-2">
                                            Experiencing technical issues with the website or application process?
                                        </p>
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                Email: <a href="mailto:tech@painsurance.ph" className="text-blue-600 dark:text-blue-400 hover:underline">tech@painsurance.ph</a>
                                            </p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                24/7 Technical Support Available
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Office Address */}
                        <div className="mt-8">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                                Office Address
                            </h3>
                            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                                <div className="flex items-start space-x-3">
                                    <svg className="w-5 h-5 text-gray-600 dark:text-gray-400 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <div>
                                        <p className="text-gray-900 dark:text-white font-medium">
                                            PA Insurance Marketplace
                                        </p>
                                        <p className="text-gray-600 dark:text-gray-300">
                                            Unit 2501, One Global Place<br />
                                            25th Street, Bonifacio Global City<br />
                                            Taguig City, Metro Manila 1634<br />
                                            Philippines
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                            Send Us a Message
                        </h2>

                        <form className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        First Name *
                                    </label>
                                    <input
                                        type="text"
                                        id="firstName"
                                        name="firstName"
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Last Name *
                                    </label>
                                    <input
                                        type="text"
                                        id="lastName"
                                        name="lastName"
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Email Address *
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                />
                            </div>

                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                />
                            </div>

                            <div>
                                <label htmlFor="inquiry" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Type of Inquiry *
                                </label>
                                <select
                                    id="inquiry"
                                    name="inquiry"
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                >
                                    <option value="">Select inquiry type</option>
                                    <option value="general">General Information</option>
                                    <option value="support">Customer Support</option>
                                    <option value="technical">Technical Issue</option>
                                    <option value="partnership">Business Partnership</option>
                                    <option value="claims">Claims Assistance</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Message *
                                </label>
                                <textarea
                                    id="message"
                                    name="message"
                                    rows={6}
                                    required
                                    placeholder="Please provide details about your inquiry..."
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                ></textarea>
                            </div>

                            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                                <p className="text-sm text-blue-800 dark:text-blue-200">
                                    <strong>Note:</strong> This contact form is currently for display purposes. For immediate assistance,
                                    please use the direct contact information provided above.
                                </p>
                            </div>

                            <button
                                type="button"
                                className="w-full bg-gray-400 text-white py-3 px-4 rounded-md font-medium cursor-not-allowed"
                                disabled
                            >
                                Send Message (Demo)
                            </button>
                        </form>
                    </div>
                </div>

                {/* FAQ Section */}
                <div className="mt-16">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-8">
                        Frequently Asked Questions
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                How do I apply for personal accident insurance?
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300 text-sm">
                                Browse our marketplace, compare different insurance options, and click "Add to Cart"
                                on your preferred policy. Follow the checkout process to complete your application.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                How long does the approval process take?
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300 text-sm">
                                Most applications are processed within 24-48 hours. You'll receive email updates
                                throughout the process and can track your application status in your account.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                Can I compare different insurance providers?
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300 text-sm">
                                Yes! Our marketplace allows you to easily compare coverage options, benefits,
                                and pricing from multiple trusted insurance providers in one place.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                What payment methods do you accept?
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300 text-sm">
                                We accept various payment methods including credit cards, debit cards,
                                bank transfers, and digital wallets for your convenience.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </StorefrontLayout>
    );
}