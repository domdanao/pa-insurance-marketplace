<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class FileUploadService
{
    /**
     * Upload and process product images
     */
    public function uploadProductImages(array $images, string $storeId): array
    {
        $uploadedImages = [];
        $errors = [];

        foreach ($images as $image) {
            if (!($image instanceof UploadedFile)) {
                $errors[] = 'Invalid file provided';
                continue;
            }

            if (!$this->validateImageFile($image)) {
                $errors[] = "Invalid image file: {$image->getClientOriginalName()}";
                continue;
            }

            try {
                $uploadedImages[] = $this->uploadProductImage($image, $storeId);
            } catch (\Exception $e) {
                $errors[] = "Failed to upload {$image->getClientOriginalName()}: {$e->getMessage()}";
            }
        }

        if (!empty($errors) && empty($uploadedImages)) {
            throw new \Exception('All image uploads failed: ' . implode(', ', $errors));
        }

        if (!empty($errors)) {
            Log::warning('Some images failed to upload', [
                'store_id' => $storeId,
                'errors' => $errors,
                'successful_uploads' => count($uploadedImages)
            ]);
        }

        return $uploadedImages;
    }

    /**
     * Upload a single product image with resizing
     */
    public function uploadProductImage(UploadedFile $image, string $storeId): string
    {
        // Validate the image
        if (!$this->validateImageFile($image)) {
            throw new \Exception('Invalid image file: ' . $image->getClientOriginalName());
        }

        // Generate unique filename with proper extension
        $extension = $image->getClientOriginalExtension();
        if (empty($extension)) {
            $extension = $image->guessExtension() ?? 'jpg';
        }
        
        $filename = Str::uuid() . '.' . strtolower($extension);
        $directory = "products/{$storeId}";

        try {
            // Create directory if it doesn't exist
            Storage::disk('public')->makeDirectory($directory);

            // Store the original image
            $storedPath = Storage::disk('public')->putFileAs($directory, $image, $filename);

            if (!$storedPath) {
                throw new \Exception('Failed to store image file');
            }

            $url = asset('storage/' . $storedPath);
            
            Log::info('Image uploaded successfully', [
                'store_id' => $storeId,
                'filename' => $filename,
                'original_name' => $image->getClientOriginalName(),
                'size' => $image->getSize(),
                'url' => $url
            ]);

            return $url;
        } catch (\Exception $e) {
            Log::error('Failed to upload image', [
                'store_id' => $storeId,
                'filename' => $filename,
                'original_name' => $image->getClientOriginalName(),
                'error' => $e->getMessage()
            ]);
            
            throw new \Exception('Failed to upload image: ' . $e->getMessage());
        }
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
        // Extract path from URL by removing the storage URL prefix
        $storageUrl = asset('storage/');
        $path = str_replace($storageUrl, '', $imageUrl);
        // Remove leading slash if present
        $path = ltrim($path, '/');

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
