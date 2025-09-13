import MerchantLayout from '@/layouts/MerchantLayout';
import { Form, Head, Link } from '@inertiajs/react';

interface Category {
    id: string;
    name: string;
}

interface Store {
    id: string;
    name: string;
    description?: string;
    category_id?: string;
    contact_email?: string;
    contact_phone?: string;
    address?: string;
    status: string;
}

interface Props {
    store: Store;
    categories: Category[];
}

export default function MerchantStoreEdit({ store, categories }: Props) {
    const getStatusBadge = (status: string) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
            approved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
            suspended: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
        };
        return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
    };

    return (
        <MerchantLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl leading-tight font-semibold text-gray-800 dark:text-gray-200">Edit Store</h2>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Update your store information</p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusBadge(store.status)}`}>
                            {store.status}
                        </span>
                        <Link href="/merchant/dashboard" className="rounded bg-gray-600 px-4 py-2 font-bold text-white hover:bg-gray-700">
                            Back to Dashboard
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="Edit Store - Merchant" />

            <div className="max-w-2xl">
                <div className="rounded-lg bg-white shadow dark:bg-gray-800">
                    <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Store Information</h3>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Changes will be reviewed if your store is already approved</p>
                    </div>

                    <Form action="/merchant/store" method="put" className="p-6">
                        {({ errors, hasErrors, processing, wasSuccessful, recentlySuccessful }) => (
                            <div className="space-y-6">
                                {/* Store Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Store Name *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        defaultValue={store.name}
                                        required
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                        placeholder="Enter your store name"
                                    />
                                    {errors.name && <div className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</div>}
                                </div>

                                {/* Store Description */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description *</label>
                                    <textarea
                                        name="description"
                                        rows={4}
                                        defaultValue={store.description || ''}
                                        required
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                        placeholder="Describe your store and what you sell..."
                                    />
                                    {errors.description && <div className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description}</div>}
                                </div>

                                {/* Category */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Store Category *</label>
                                    <select
                                        name="category_id"
                                        defaultValue={store.category_id || ''}
                                        required
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                    >
                                        <option value="">Select a category</option>
                                        {categories.map((category) => (
                                            <option key={category.id} value={category.id}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.category_id && <div className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.category_id}</div>}
                                </div>

                                {/* Contact Email */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Contact Email *</label>
                                    <input
                                        type="email"
                                        name="contact_email"
                                        defaultValue={store.contact_email || ''}
                                        required
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                        placeholder="store@example.com"
                                    />
                                    {errors.contact_email && (
                                        <div className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.contact_email}</div>
                                    )}
                                </div>

                                {/* Contact Phone */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Contact Phone</label>
                                    <input
                                        type="tel"
                                        name="contact_phone"
                                        defaultValue={store.contact_phone || ''}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                        placeholder="+1 (555) 123-4567"
                                    />
                                    {errors.contact_phone && (
                                        <div className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.contact_phone}</div>
                                    )}
                                </div>

                                {/* Address */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Business Address *</label>
                                    <textarea
                                        name="address"
                                        rows={3}
                                        defaultValue={store.address || ''}
                                        required
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                        placeholder="Enter your business address..."
                                    />
                                    {errors.address && <div className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.address}</div>}
                                </div>

                                {/* Form Actions */}
                                <div className="flex justify-end space-x-4 border-t border-gray-200 pt-4 dark:border-gray-700">
                                    <Link
                                        href="/merchant/dashboard"
                                        className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                                    >
                                        Cancel
                                    </Link>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {processing ? 'Updating...' : 'Update Store'}
                                    </button>
                                </div>

                                {/* Success Message */}
                                {wasSuccessful && (
                                    <div className="rounded-md border border-green-200 bg-green-50 p-4 dark:border-green-700 dark:bg-green-900">
                                        <div className="text-sm text-green-800 dark:text-green-200">Store updated successfully!</div>
                                    </div>
                                )}

                                {/* Status Info */}
                                {store.status === 'pending' && (
                                    <div className="rounded-md border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-700 dark:bg-yellow-900">
                                        <div className="flex">
                                            <div className="ml-3">
                                                <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Store Pending Review</h3>
                                                <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                                                    Your store is currently under review. You'll be notified once it's approved.
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {store.status === 'suspended' && (
                                    <div className="rounded-md border border-red-200 bg-red-50 p-4 dark:border-red-700 dark:bg-red-900">
                                        <div className="flex">
                                            <div className="ml-3">
                                                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Store Suspended</h3>
                                                <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                                                    Your store has been suspended. Please contact support for more information.
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </Form>
                </div>
            </div>
        </MerchantLayout>
    );
}
