import AdminLayout from '@/layouts/AdminLayout';
import { Form, Head, Link } from '@inertiajs/react';

export default function CreateMerchant() {
    return (
        <AdminLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl leading-tight font-semibold text-gray-800 dark:text-gray-200">Create Merchant Account</h2>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Create a new merchant account with user profile</p>
                    </div>
                    <Link
                        href="/admin/merchants"
                        className="rounded-md bg-gray-600 px-4 py-2 text-white hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:outline-none"
                    >
                        Back to Merchants
                    </Link>
                </div>
            }
        >
            <Head title="Create Merchant - Admin" />

            <div className="rounded-lg bg-white shadow dark:bg-gray-800">
                <div className="px-6 py-6">
                    <Form action="/admin/merchants" method="post">
                        {({ errors, processing }) => (
                            <>
                                {/* User Information Section */}
                                <div className="mb-8">
                                    <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">User Account Information</h3>
                                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name *</label>
                                            <input
                                                type="text"
                                                name="name"
                                                required
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                                placeholder="Enter full name"
                                            />
                                            {errors.name && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Address *</label>
                                            <input
                                                type="email"
                                                name="email"
                                                required
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                                placeholder="Enter email address"
                                            />
                                            {errors.email && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password *</label>
                                            <input
                                                type="password"
                                                name="password"
                                                required
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                                placeholder="Enter password"
                                            />
                                            {errors.password && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Confirm Password *</label>
                                            <input
                                                type="password"
                                                name="password_confirmation"
                                                required
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                                placeholder="Confirm password"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Business Information Section */}
                                <div className="mb-8 border-t border-gray-200 pt-8 dark:border-gray-700">
                                    <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">Business Information</h3>
                                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Business Name *</label>
                                            <input
                                                type="text"
                                                name="business_name"
                                                required
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                                placeholder="Enter business name"
                                            />
                                            {errors.business_name && (
                                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.business_name}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Business Type *</label>
                                            <select
                                                name="business_type"
                                                required
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                            >
                                                <option value="">Select business type</option>
                                                <option value="sole_proprietorship">Sole Proprietorship</option>
                                                <option value="partnership">Partnership</option>
                                                <option value="llc">LLC</option>
                                                <option value="corporation">Corporation</option>
                                                <option value="other">Other</option>
                                            </select>
                                            {errors.business_type && (
                                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.business_type}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number *</label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                required
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                                placeholder="Enter phone number"
                                            />
                                            {errors.phone && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.phone}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tax ID (Optional)</label>
                                            <input
                                                type="text"
                                                name="tax_id"
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                                placeholder="Enter tax ID"
                                            />
                                            {errors.tax_id && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.tax_id}</p>}
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Business Address *</label>
                                            <textarea
                                                name="business_address"
                                                required
                                                rows={3}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                                placeholder="Enter full business address"
                                            />
                                            {errors.business_address && (
                                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.business_address}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Banking Information Section */}
                                <div className="mb-8 border-t border-gray-200 pt-8 dark:border-gray-700">
                                    <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">Banking Information (Optional)</h3>
                                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Bank Name</label>
                                            <input
                                                type="text"
                                                name="bank_name"
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                                placeholder="Enter bank name"
                                            />
                                            {errors.bank_name && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.bank_name}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Account Holder Name</label>
                                            <input
                                                type="text"
                                                name="account_holder_name"
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                                placeholder="Enter account holder name"
                                            />
                                            {errors.account_holder_name && (
                                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.account_holder_name}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Account Number</label>
                                            <input
                                                type="text"
                                                name="account_number"
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                                placeholder="Enter account number"
                                            />
                                            {errors.account_number && (
                                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.account_number}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Routing Number</label>
                                            <input
                                                type="text"
                                                name="routing_number"
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                                placeholder="Enter routing number"
                                            />
                                            {errors.routing_number && (
                                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.routing_number}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Status Section */}
                                <div className="mb-8 border-t border-gray-200 pt-8 dark:border-gray-700">
                                    <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">Account Status</h3>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Initial Status</label>
                                        <select
                                            name="status"
                                            defaultValue="pending"
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 md:w-64 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                        >
                                            <option value="pending">Pending Review</option>
                                            <option value="approved">Approved</option>
                                            <option value="suspended">Suspended</option>
                                            <option value="rejected">Rejected</option>
                                        </select>
                                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                            The merchant account will be created with this initial status.
                                        </p>
                                        {errors.status && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.status}</p>}
                                    </div>
                                </div>

                                {/* Submit Section */}
                                <div className="flex items-center justify-end space-x-4 border-t border-gray-200 pt-6 dark:border-gray-700">
                                    <Link
                                        href="/admin/merchants"
                                        className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                                    >
                                        Cancel
                                    </Link>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none disabled:opacity-50"
                                    >
                                        {processing ? 'Creating Merchant...' : 'Create Merchant Account'}
                                    </button>
                                </div>
                            </>
                        )}
                    </Form>
                </div>
            </div>
        </AdminLayout>
    );
}
