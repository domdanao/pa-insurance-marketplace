import { useRef, useState } from 'react';

interface ImageUploadProps {
    productId?: string;
    existingImages?: string[];
    onImagesUpdate?: (images: string[]) => void;
    maxImages?: number;
    disabled?: boolean;
}

export default function ImageUpload({ productId, existingImages = [], onImagesUpdate, maxImages = 5, disabled = false }: ImageUploadProps) {
    const [images, setImages] = useState<string[]>(existingImages);
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const getCsrfToken = (): string => {
        const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        if (!token) {
            console.warn('CSRF token not found in meta tag');
            // Try to get from cookie as fallback
            const cookies = document.cookie.split(';');
            for (const cookie of cookies) {
                const [name, value] = cookie.trim().split('=');
                if (name === 'XSRF-TOKEN') {
                    return decodeURIComponent(value);
                }
            }
        }
        return token || '';
    };

    const validateFiles = (files: FileList): { valid: File[]; errors: string[] } => {
        const valid: File[] = [];
        const errors: string[] = [];
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        const maxSize = 5 * 1024 * 1024; // 5MB

        Array.from(files).forEach((file) => {
            if (!allowedTypes.includes(file.type)) {
                errors.push(`${file.name}: Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.`);
                return;
            }
            if (file.size > maxSize) {
                errors.push(`${file.name}: File too large. Maximum size is 5MB.`);
                return;
            }
            if (images.length + valid.length >= maxImages) {
                errors.push(`Maximum ${maxImages} images allowed.`);
                return;
            }
            valid.push(file);
        });

        return { valid, errors };
    };

    const handleImageUpload = async (files: FileList) => {
        if (!files.length || disabled) return;

        setUploadError(null);
        const { valid, errors } = validateFiles(files);

        if (errors.length > 0) {
            setUploadError(errors.join('\n'));
            return;
        }

        if (valid.length === 0) return;

        const formData = new FormData();
        valid.forEach((file) => {
            formData.append('images[]', file);
        });

        setUploading(true);

        try {
            const csrfToken = getCsrfToken();

            const response = await fetch('/merchant/products/upload-images', {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRF-TOKEN': csrfToken,
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin',
            });

            if (response.status === 419) {
                // CSRF token mismatch - refresh the page
                setUploadError('Session expired. Please refresh the page and try again.');
                return;
            }

            if (!response.ok) {
                let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
                try {
                    const errorData = await response.json();
                    if (errorData.message) {
                        errorMessage = errorData.message;
                    } else if (errorData.errors) {
                        errorMessage = Object.values(errorData.errors).flat().join(', ');
                    }
                } catch {
                    // If we can't parse JSON, use the text response
                    const errorText = await response.text();
                    if (errorText) {
                        errorMessage = errorText;
                    }
                }
                throw new Error(errorMessage);
            }

            const result = await response.json();

            if (result.success) {
                const newImages = [...images, ...result.images];
                setImages(newImages);
                onImagesUpdate?.(newImages);
                setUploadError(null);

                // Clear the file input
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            } else {
                throw new Error(result.message || 'Upload failed');
            }
        } catch (error) {
            console.error('Upload error:', error);
            setUploadError(error instanceof Error ? error.message : 'Failed to upload images. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const handleRemoveImage = async (imageUrl: string) => {
        if (!productId || disabled) {
            // For new products, just remove from local state
            const newImages = images.filter((img) => img !== imageUrl);
            setImages(newImages);
            onImagesUpdate?.(newImages);
            return;
        }

        try {
            const response = await fetch('/merchant/products/delete-image', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    image_url: imageUrl,
                    product_id: productId,
                }),
            });

            const result = await response.json();

            if (result.success) {
                const newImages = images.filter((img) => img !== imageUrl);
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Product Images</label>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                    {images.length}/{maxImages} images
                </span>
            </div>

            {/* Error Message */}
            {uploadError && (
                <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/20">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Upload Error</h3>
                            <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                                <pre className="whitespace-pre-wrap">{uploadError}</pre>
                            </div>
                        </div>
                        <div className="ml-auto pl-3">
                            <div className="-mx-1.5 -my-1.5">
                                <button
                                    type="button"
                                    onClick={() => setUploadError(null)}
                                    className="inline-flex rounded-md bg-red-50 p-1.5 text-red-500 hover:bg-red-100 focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-red-50 focus:outline-none dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40"
                                >
                                    <span className="sr-only">Dismiss</span>
                                    <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                        <path
                                            fillRule="evenodd"
                                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Upload Area */}
            {canAddMore && !disabled && (
                <div
                    className={`relative rounded-lg border-2 border-dashed p-6 transition-colors ${
                        dragActive
                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                            : 'border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                >
                    <div className="text-center">
                        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
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
                                className="cursor-pointer rounded-md bg-white font-medium text-indigo-600 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 focus-within:outline-none hover:text-indigo-500 dark:bg-gray-800 dark:text-indigo-400"
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
                        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">PNG, JPG, GIF, WEBP up to 5MB each, max {maxImages} images</p>
                    </div>

                    {uploading && (
                        <div className="bg-opacity-75 absolute inset-0 flex items-center justify-center rounded-lg bg-white dark:bg-gray-800">
                            <div className="text-center">
                                <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600"></div>
                                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Uploading images...</p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Image Gallery */}
            {images.length > 0 && (
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                    {images.map((imageUrl, index) => (
                        <div key={imageUrl} className="group relative">
                            <div className="aspect-square overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
                                <img src={imageUrl} alt={`Product image ${index + 1}`} className="h-full w-full object-cover" />
                            </div>
                            {!disabled && (
                                <button
                                    type="button"
                                    onClick={() => handleRemoveImage(imageUrl)}
                                    className="absolute top-2 right-2 rounded-full bg-red-600 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-700"
                                >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                            {index === 0 && (
                                <div className="bg-opacity-50 absolute bottom-2 left-2 rounded bg-black px-2 py-1 text-xs text-white">Main</div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {images.length === 0 && (
                <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                    <svg className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                    </svg>
                    <p className="mt-2 text-sm">No images uploaded yet</p>
                </div>
            )}

            {/* Hidden input to store image URLs for form submission */}
            {images.map((imageUrl, index) => (
                <input key={index} type="hidden" name={`images[${index}]`} value={imageUrl} />
            ))}
        </div>
    );
}
