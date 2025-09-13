import StorefrontLayout from '@/layouts/StorefrontLayout';
import { Head } from '@inertiajs/react';

export default function PrivacyPolicy() {
    return (
        <StorefrontLayout>
            <Head title="Privacy Policy" />

            <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
                <h1 className="mb-8 text-3xl font-bold text-gray-900 dark:text-white">Privacy Policy</h1>

                <div className="prose prose-gray dark:prose-invert max-w-none">
                    <div className="mb-8 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
                        <p className="font-medium text-blue-800 dark:text-blue-200">
                            ⚠️ Template Placeholder - This is a placeholder for your Privacy Policy.
                        </p>
                        <p className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                            Replace this content with your actual privacy policy. Ensure compliance with GDPR, CCPA, and other applicable privacy
                            regulations in your jurisdiction.
                        </p>
                    </div>

                    <section className="mb-8">
                        <h2 className="mb-4 text-xl font-semibold">1. Information We Collect</h2>
                        <h3 className="mb-2 text-lg font-medium">Personal Information</h3>
                        <ul className="mb-4 list-disc space-y-1 pl-6">
                            <li>Name, email address, and contact information</li>
                            <li>Shipping and billing addresses</li>
                            <li>Payment information (processed securely by our payment partners)</li>
                            <li>Account preferences and settings</li>
                        </ul>

                        <h3 className="mb-2 text-lg font-medium">Usage Information</h3>
                        <ul className="list-disc space-y-1 pl-6">
                            <li>Pages visited and time spent on our platform</li>
                            <li>Search queries and browsing behavior</li>
                            <li>Device and browser information</li>
                            <li>IP address and location data</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="mb-4 text-xl font-semibold">2. How We Use Your Information</h2>
                        <ul className="list-disc space-y-2 pl-6">
                            <li>To provide and improve our marketplace services</li>
                            <li>To process transactions and communicate about orders</li>
                            <li>To personalize your experience and show relevant products</li>
                            <li>To send important updates about your account or our services</li>
                            <li>To prevent fraud and ensure platform security</li>
                            <li>To comply with legal obligations</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="mb-4 text-xl font-semibold">3. Information Sharing</h2>
                        <p className="mb-4">
                            We do not sell, trade, or rent your personal information to third parties. We may share information in the following
                            circumstances:
                        </p>
                        <ul className="list-disc space-y-2 pl-6">
                            <li>With sellers to fulfill your orders</li>
                            <li>With payment processors to handle transactions</li>
                            <li>With service providers who help us operate our platform</li>
                            <li>When required by law or to protect our rights</li>
                            <li>In connection with a business transfer or sale</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="mb-4 text-xl font-semibold">4. Data Security</h2>
                        <p>
                            We implement industry-standard security measures to protect your personal information, including encryption, secure
                            servers, and regular security audits.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="mb-4 text-xl font-semibold">5. Your Rights</h2>
                        <p className="mb-4">You have the right to:</p>
                        <ul className="list-disc space-y-2 pl-6">
                            <li>Access and review your personal information</li>
                            <li>Correct inaccurate or incomplete information</li>
                            <li>Delete your account and personal information</li>
                            <li>Object to or restrict certain processing</li>
                            <li>Data portability (where applicable)</li>
                            <li>Withdraw consent for marketing communications</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="mb-4 text-xl font-semibold">6. Cookies and Tracking</h2>
                        <p>
                            We use cookies and similar technologies to improve your experience, analyze usage, and provide personalized content. You
                            can control cookie settings through your browser.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="mb-4 text-xl font-semibold">7. Contact Us</h2>
                        <p>
                            For questions about this Privacy Policy or to exercise your rights, contact us at:
                            <br />
                            Email: privacy@[yourdomain].com
                            <br />
                            Address: [Your Business Address]
                        </p>
                    </section>

                    <p className="mt-8 text-sm text-gray-500 dark:text-gray-400">Last updated: [Date]</p>
                </div>
            </div>
        </StorefrontLayout>
    );
}
