import ImageUpload from '@/components/ImageUpload';
import MerchantLayout from '@/layouts/MerchantLayout';
import { Form, Head, Link } from '@inertiajs/react';
import { useState } from 'react';

interface Category {
    id: string;
    name: string;
}

interface Props {
    categories: Category[];
}

export default function MerchantProductCreate({ categories }: Props) {
    const [isDigital, setIsDigital] = useState(false);
    const [images, setImages] = useState<string[]>([]);

    return (
        <MerchantLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl leading-tight font-semibold text-gray-800 dark:text-gray-200">Create Product</h2>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Add a new product to your store</p>
                    </div>
                    <Link href="/merchant/products" className="rounded bg-gray-600 px-4 py-2 font-bold text-white hover:bg-gray-700">
                        Back to Products
                    </Link>
                </div>
            }
        >
            <Head title="Create Product - Merchant" />

            <div className="max-w-2xl">
                <div className="rounded-lg bg-white shadow dark:bg-gray-800">
                    <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Product Information</h3>
                    </div>

                    <Form action="/merchant/products" method="post" className="p-6">
                        {({ errors, hasErrors, processing, wasSuccessful, recentlySuccessful }) => (
                            <div className="space-y-6">
                                {/* Product Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Product Name *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        required
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                        placeholder="Enter product name"
                                    />
                                    {errors.name && <div className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</div>}
                                </div>

                                {/* Product Description */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description *</label>
                                    <textarea
                                        name="description"
                                        rows={4}
                                        required
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                        placeholder="Describe your product in detail..."
                                    />
                                    {errors.description && <div className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description}</div>}
                                </div>

                                {/* Category */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category *</label>
                                    <select
                                        name="category_id"
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

                                {/* Price */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Price ($) *</label>
                                    <input
                                        type="number"
                                        name="price"
                                        min="0.01"
                                        max="999999.99"
                                        step="0.01"
                                        required
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                        placeholder="0.00"
                                    />
                                    {errors.price && <div className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.price}</div>}
                                </div>

                                {/* Digital Product Toggle */}
                                <div>
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            name="digital_product"
                                            value="1"
                                            checked={isDigital}
                                            onChange={(e) => setIsDigital(e.target.checked)}
                                            className="focus:ring-opacity-50 rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200"
                                        />
                                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">This is a digital product</span>
                                    </label>
                                    {errors.digital_product && (
                                        <div className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.digital_product}</div>
                                    )}
                                </div>

                                {/* Conditional Fields Based on Digital Product */}
                                {isDigital ? (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Download URL *</label>
                                        <input
                                            type="url"
                                            name="download_url"
                                            required={isDigital}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                            placeholder="https://example.com/download-link"
                                        />
                                        {errors.download_url && (
                                            <div className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.download_url}</div>
                                        )}
                                    </div>
                                ) : (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Quantity *</label>
                                        <input
                                            type="number"
                                            name="quantity"
                                            min="0"
                                            max="999999"
                                            required={!isDigital}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                            placeholder="0"
                                        />
                                        {errors.quantity && <div className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.quantity}</div>}
                                    </div>
                                )}

                                {/* Product Images */}
                                <ImageUpload existingImages={images} onImagesUpdate={setImages} maxImages={5} />

                                {/* Form Actions */}
                                <div className="flex justify-end space-x-4 border-t border-gray-200 pt-4 dark:border-gray-700">
                                    <Link
                                        href="/merchant/products"
                                        className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                                    >
                                        Cancel
                                    </Link>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {processing ? 'Creating...' : 'Create Product'}
                                    </button>
                                </div>

                                {/* Success Message */}
                                {wasSuccessful && (
                                    <div className="rounded-md border border-green-200 bg-green-50 p-4 dark:border-green-700 dark:bg-green-900">
                                        <div className="text-sm text-green-800 dark:text-green-200">Product created successfully!</div>
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
