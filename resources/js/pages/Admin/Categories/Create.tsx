import AdminLayout from '@/layouts/AdminLayout';
import { Form, Head, Link } from '@inertiajs/react';

export default function CreateCategory() {
    return (
        <AdminLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl leading-tight font-semibold text-gray-800 dark:text-gray-200">Create Category</h2>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Add a new product category to the marketplace</p>
                    </div>
                    <Link
                        href="/admin/categories"
                        className="rounded-md bg-gray-600 px-4 py-2 text-white hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:outline-none"
                    >
                        Back to Categories
                    </Link>
                </div>
            }
        >
            <Head title="Create Category - Admin" />

            <div className="rounded-lg bg-white shadow dark:bg-gray-800">
                <div className="px-6 py-6">
                    <Form action="/admin/categories" method="post">
                        {({ errors, processing }) => (
                            <>
                                {/* Category Information */}
                                <div className="mb-8">
                                    <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">Category Information</h3>
                                    <div className="grid grid-cols-1 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category Name *</label>
                                            <input
                                                type="text"
                                                name="name"
                                                required
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                                placeholder="e.g., Electronics, Books, Clothing"
                                            />
                                            {errors.name && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>}
                                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                                The name will be used to create a URL-friendly slug automatically
                                            </p>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Description (Optional)
                                            </label>
                                            <textarea
                                                name="description"
                                                rows={3}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                                placeholder="Brief description of what products belong in this category"
                                            />
                                            {errors.description && (
                                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description}</p>
                                            )}
                                        </div>

                                        <div>
                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    id="is_active"
                                                    name="is_active"
                                                    defaultChecked={true}
                                                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                />
                                                <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900 dark:text-white">
                                                    Active Category
                                                </label>
                                            </div>
                                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                                Only active categories will be available for merchants to choose from
                                            </p>
                                            {errors.is_active && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.is_active}</p>}
                                        </div>
                                    </div>
                                </div>

                                {/* Submit Section */}
                                <div className="flex items-center justify-end space-x-4 border-t border-gray-200 pt-6 dark:border-gray-700">
                                    <Link
                                        href="/admin/categories"
                                        className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                                    >
                                        Cancel
                                    </Link>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none disabled:opacity-50"
                                    >
                                        {processing ? 'Creating Category...' : 'Create Category'}
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
