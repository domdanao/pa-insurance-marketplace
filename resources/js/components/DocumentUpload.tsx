import { useState, useRef } from 'react';
import { router } from '@inertiajs/react';

interface DocumentUploadProps {
    merchantId: string;
    documentType: string;
    documentName: string;
    onUploadSuccess?: () => void;
    disabled?: boolean;
}

export default function DocumentUpload({
    merchantId,
    documentType,
    documentName,
    onUploadSuccess,
    disabled = false,
}: DocumentUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = async (files: FileList) => {
        if (!files.length || disabled || files.length > 1) return;

        const file = files[0];
        const formData = new FormData();
        formData.append('document', file);
        formData.append('document_type', documentType);
        formData.append('document_name', documentName);

        setUploading(true);

        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

            const response = await fetch(`/admin/merchants/${merchantId}/documents/upload`, {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRF-TOKEN': csrfToken || '',
                    'Accept': 'application/json',
                },
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();

            if (result.success) {
                onUploadSuccess?.();
                // Refresh the page to show updated data
                router.reload();
            } else {
                alert('Failed to upload document: ' + result.message);
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert('Failed to upload document. Please try again.');
        } finally {
            setUploading(false);
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
            handleFileUpload(files);
        }
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFileUpload(e.target.files);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    if (disabled) {
        return null;
    }

    return (
        <div className="relative">
            <div
                className={`border-2 border-dashed rounded-lg p-3 transition-colors cursor-pointer ${
                    dragActive
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={triggerFileInput}
            >
                <div className="text-center">
                    <svg
                        className="mx-auto h-8 w-8 text-gray-400"
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
                    <div className="mt-2">
                        <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                            Upload Document
                        </span>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            PDF, DOC, JPG, PNG up to 10MB
                        </p>
                    </div>
                </div>

                <input
                    ref={fileInputRef}
                    type="file"
                    className="sr-only"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={handleFileInputChange}
                />
            </div>

            {uploading && (
                <div className="absolute inset-0 bg-white dark:bg-gray-800 bg-opacity-75 flex items-center justify-center rounded-lg">
                    <div className="text-center">
                        <div className="w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
                        <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                            Uploading...
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}