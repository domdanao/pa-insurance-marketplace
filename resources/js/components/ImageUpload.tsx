import { useState, useRef } from 'react';
import { router } from '@inertiajs/react';

interface ImageUploadProps {
    productId?: string;
    existingImages?: string[];
    onImagesUpdate?: (images: string[]) => void;
    maxImages?: number;
    disabled?: boolean;
}

export default function ImageUpload({
    productId,
    existingImages = [],
    onImagesUpdate,
    maxImages = 5,
    disabled = false,
}: ImageUploadProps) {
    const [images, setImages] = useState<string[]>(existingImages);
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = async (files: FileList) => {
        if (!files.length || disabled) return;

        const formData = new FormData();
        Array.from(files).forEach((file) => {
            formData.append('images[]', file);
        });

        setUploading(true);

        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            console.log('CSRF Token:', csrfToken);
            
            const response = await fetch('/merchant/products/upload-images', {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRF-TOKEN': csrfToken || '',
                    'Accept': 'application/json',
                },
            });

            console.log('Response status:', response.status);
            console.log('Response headers:', Object.fromEntries(response.headers.entries()));

            if (!response.ok) {
                const errorText = await response.text();
                console.log('Error response:', errorText);
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();

            if (result.success) {
                const newImages = [...images, ...result.images];
                setImages(newImages);
                onImagesUpdate?.(newImages);
            } else {
                alert('Failed to upload images: ' + result.message);
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert('Failed to upload images. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const handleRemoveImage = async (imageUrl: string) => {
        if (!productId || disabled) {
            // For new products, just remove from local state
            const newImages = images.filter(img => img !== imageUrl);
            setImages(newImages);
            onImagesUpdate?.(newImages);
            return;
        }

        try {
            const response = await fetch('/merchant/products/delete-image', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    image_url: imageUrl,
                    product_id: productId,
                }),
            });

            const result = await response.json();

            if (result.success) {
                const newImages = images.filter(img => img !== imageUrl);
                setImages(newImages);
                onImagesUpdate?.(newImages);
            } else {
                alert('Failed to delete image: ' + result.message);
            }
        } catch (error) {
            console.error('Delete error:', error);
            alert('Failed to delete image. Please try again.');
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (disabled) return;

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            handleImageUpload(files);
        }
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            handleImageUpload(e.target.files);
        }
    };

    const canAddMore = images.length < maxImages;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Product Images
                </label>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                    {images.length}/{maxImages} images
                </span>
            </div>

            {/* Upload Area */}
            {canAddMore && !disabled && (
                <div
                    className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
                        dragActive
                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                >
                    <div className="text-center">
                        <svg
                            className="mx-auto h-12 w-12 text-gray-400"
                            stroke="currentColor"
                            fill="none"
                            viewBox="0 0 48 48"
                        >
                            <path
                                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                        <div className="mt-4">
                            <label
                                htmlFor="image-upload"
                                className="cursor-pointer rounded-md bg-white dark:bg-gray-800 font-medium text-indigo-600 dark:text-indigo-400 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:text-indigo-500"
                            >
                                <span>Upload images</span>
                                <input
                                    ref={fileInputRef}
                                    id="image-upload"
                                    type="file"
                                    className="sr-only"
                                    multiple
                                    accept="image/jpeg,image/png,image/gif,image/webp"
                                    onChange={handleFileInputChange}
                                />
                            </label>
                            <span className="text-gray-500 dark:text-gray-400"> or drag and drop</span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            PNG, JPG, GIF, WEBP up to 5MB each, max {maxImages} images
                        </p>
                    </div>

                    {uploading && (
                        <div className="absolute inset-0 bg-white dark:bg-gray-800 bg-opacity-75 flex items-center justify-center rounded-lg">
                            <div className="text-center">
                                <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
                                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                    Uploading images...
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Image Gallery */}
            {images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {images.map((imageUrl, index) => (
                        <div key={imageUrl} className="relative group">
                            <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                                <img
                                    src={imageUrl}
                                    alt={`Product image ${index + 1}`}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            {!disabled && (
                                <button
                                    type="button"
                                    onClick={() => handleRemoveImage(imageUrl)}
                                    className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                            {index === 0 && (
                                <div className="absolute bottom-2 left-2 px-2 py-1 bg-black bg-opacity-50 text-white text-xs rounded">
                                    Main
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {images.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <svg className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="mt-2 text-sm">No images uploaded yet</p>
                </div>
            )}

            {/* Hidden input to store image URLs for form submission */}
            {images.map((imageUrl, index) => (
                <input
                    key={index}
                    type="hidden"
                    name={`images[${index}]`}
                    value={imageUrl}
                />
            ))}
        </div>
    );
}