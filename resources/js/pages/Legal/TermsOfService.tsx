import StorefrontLayout from '@/layouts/StorefrontLayout';
import { Head } from '@inertiajs/react';

export default function TermsOfService() {
    return (
        <StorefrontLayout>
            <Head title="Terms of Service" />

            <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
                <h1 className="mb-8 text-3xl font-bold text-gray-900 dark:text-white">Terms of Service</h1>

                <div className="prose prose-gray dark:prose-invert max-w-none">
                    <div className="mb-8 rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
                        <p className="font-medium text-yellow-800 dark:text-yellow-200">
                            ⚠️ Template Placeholder - This is a placeholder for your Terms of Service.
                        </p>
                        <p className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                            Replace this content with your actual terms of service. Consider consulting with a legal professional to ensure compliance
                            with your jurisdiction's requirements.
                        </p>
                    </div>

                    <section className="mb-8">
                        <h2 className="mb-4 text-xl font-semibold">1. Acceptance of Terms</h2>
                        <p>
                            By accessing and using [Your Marketplace Name], you accept and agree to be bound by the terms and provision of this
                            agreement.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="mb-4 text-xl font-semibold">2. Marketplace Services</h2>
                        <p>
                            [Your Marketplace Name] provides a platform for buyers and sellers to connect and conduct transactions. We are not a party
                            to the actual transactions between buyers and sellers.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="mb-4 text-xl font-semibold">3. User Responsibilities</h2>
                        <ul className="list-disc space-y-2 pl-6">
                            <li>Provide accurate and complete information</li>
                            <li>Maintain the security of your account</li>
                            <li>Comply with all applicable laws and regulations</li>
                            <li>Respect the rights of other users</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="mb-4 text-xl font-semibold">4. Seller Obligations</h2>
                        <p>
                            Sellers must provide accurate product descriptions, fulfill orders promptly, and handle customer service for their
                            products.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="mb-4 text-xl font-semibold">5. Payment and Fees</h2>
                        <p>
                            Our marketplace charges a commission on successful transactions. Payment processing is handled by our approved payment
                            partners.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="mb-4 text-xl font-semibold">6. Limitation of Liability</h2>
                        <p>[Your Marketplace Name] shall not be liable for any indirect, incidental, special, consequential, or punitive damages.</p>
                    </section>

                    <section className="mb-8">
                        <h2 className="mb-4 text-xl font-semibold">7. Contact Information</h2>
                        <p>
                            For questions about these Terms of Service, please contact us at:
                            <br />
                            Email: legal@[yourdomain].com
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
