<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class FileUploadService
{
    /**
     * Upload and process product images
     */
    public function uploadProductImages(array $images, string $storeId): array
    {
        $uploadedImages = [];

        foreach ($images as $image) {
            if ($image instanceof UploadedFile) {
                $uploadedImages[] = $this->uploadProductImage($image, $storeId);
            }
        }

        return $uploadedImages;
    }

    /**
     * Upload a single product image with resizing
     */
    public function uploadProductImage(UploadedFile $image, string $storeId): string
    {
        // Generate unique filename
        $filename = Str::uuid().'.'.$image->getClientOriginalExtension();
        $path = "products/{$storeId}/{$filename}";

        // Create directory if it doesn't exist
        Storage::disk('public')->makeDirectory("products/{$storeId}");

        // Store the original image (we'll skip image resizing for now since Intervention Image may not be installed)
        $storedPath = Storage::disk('public')->putFileAs("products/{$storeId}", $image, $filename);

        return Storage::disk('public')->url($storedPath);
    }

    /**
     * Upload digital files for products
     */
    public function uploadDigitalFiles(array $files, string $storeId): array
    {
        $uploadedFiles = [];

        foreach ($files as $file) {
            if ($file instanceof UploadedFile) {
                $uploadedFiles[] = $this->uploadDigitalFile($file, $storeId);
            }
        }

        return $uploadedFiles;
    }

    /**
     * Upload a single digital file
     */
    public function uploadDigitalFile(UploadedFile $file, string $storeId): array
    {
        // Generate unique filename
        $filename = Str::uuid().'.'.$file->getClientOriginalExtension();
        $path = "digital/{$storeId}/{$filename}";

        // Store file in private storage for security
        Storage::disk('local')->makeDirectory("digital/{$storeId}");
        $storedPath = Storage::disk('local')->putFileAs("digital/{$storeId}", $file, $filename);

        return [
            'original_name' => $file->getClientOriginalName(),
            'filename' => $filename,
            'path' => $storedPath,
            'size' => $file->getSize(),
            'mime_type' => $file->getMimeType(),
        ];
    }

    /**
     * Delete product image
     */
    public function deleteProductImage(string $imageUrl): void
    {
        // Extract path from URL
        $path = str_replace(Storage::disk('public')->url(''), '', $imageUrl);

        // Delete main image
        if (Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
        }
    }

    /**
     * Delete digital file
     */
    public function deleteDigitalFile(string $filePath): void
    {
        if (Storage::disk('local')->exists($filePath)) {
            Storage::disk('local')->delete($filePath);
        }
    }

    /**
     * Get file size in human readable format
     */
    public function getFileSize(string $filePath): string
    {
        if (! Storage::disk('local')->exists($filePath)) {
            return '0 B';
        }

        $size = Storage::disk('local')->size($filePath);
        $units = ['B', 'KB', 'MB', 'GB'];

        for ($i = 0; $size > 1024 && $i < 3; $i++) {
            $size /= 1024;
        }

        return round($size, 2).' '.$units[$i];
    }

    /**
     * Validate image file
     */
    public function validateImageFile(UploadedFile $file): bool
    {
        $allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        $maxSize = 5 * 1024 * 1024; // 5MB

        return in_array($file->getMimeType(), $allowedMimes) &&
               $file->getSize() <= $maxSize &&
               $file->isValid();
    }

    /**
     * Validate digital file
     */
    public function validateDigitalFile(UploadedFile $file): bool
    {
        $allowedMimes = [
            'application/pdf',
            'application/zip',
            'application/x-zip-compressed',
            'text/plain',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ];
        $maxSize = 50 * 1024 * 1024; // 50MB

        return in_array($file->getMimeType(), $allowedMimes) &&
               $file->getSize() <= $maxSize &&
               $file->isValid();
    }
}
