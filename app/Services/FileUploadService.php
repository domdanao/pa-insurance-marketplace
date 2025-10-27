<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Config;

class FileUploadService
{
    /**
     * Default storage disk for uploads
     */
    protected string $defaultDisk;

    /**
     * Fallback storage disk
     */
    protected string $fallbackDisk;

    /**
     * Constructor
     */
    public function __construct()
    {
        $this->defaultDisk = config('filesystems.default', 'laravel_cloud');
        $this->fallbackDisk = config('filesystems.fallback_disk', 'public');
    }

    /**
     * Get the appropriate storage disk
     */
    protected function getStorageDisk(string $type = 'default'): string
    {
        return match($type) {
            'public' => $this->defaultDisk,
            'private' => $this->defaultDisk,
            'fallback' => $this->fallbackDisk,
            default => $this->defaultDisk
        };
    }

    /**
     * Generate organized path for bucket storage
     */
    protected function generateBucketPath(string $type, string $storeId, string $filename): string
    {
        return match($type) {
            'product_image' => "products/images/{$storeId}/{$filename}",
            'digital_file' => "products/files/{$storeId}/{$filename}",
            'product_document' => "products/documents/{$storeId}/{$filename}",
            'store_asset' => "stores/{$storeId}/{$filename}",
            default => "uploads/{$type}/{$storeId}/{$filename}"
        };
    }

    /**
     * Check if we're using bucket storage
     */
    public function isUsingBucketStorage(): bool
    {
        return $this->defaultDisk === 'laravel_cloud';
    }

    /**
     * Generate public URL for bucket-stored files
     */
    protected function generateBucketUrl(string $path): string
    {
        if ($this->isUsingBucketStorage()) {
            // Check if we have a configured public URL (Laravel Cloud format)
            $configuredUrl = config('filesystems.disks.laravel_cloud.url');
            
            if ($configuredUrl) {
                // Use the configured public URL (Laravel Cloud format)
                $path = ltrim($path, '/');
                $publicUrl = rtrim($configuredUrl, '/') . '/' . $path;
                
                Log::info('Generated Laravel Cloud public URL', [
                    'path' => $path,
                    'configured_url' => $configuredUrl,
                    'final_url' => $publicUrl
                ]);
                
                return $publicUrl;
            }
            
            // Fallback: Try Laravel's Storage facade
            try {
                return Storage::disk($this->defaultDisk)->url($path);
            } catch (\Exception $e) {
                Log::warning('Failed to generate bucket URL using Storage facade', [
                    'path' => $path,
                    'error' => $e->getMessage()
                ]);
                
                // Last resort: Manual URL construction
                $endpoint = config('filesystems.disks.laravel_cloud.endpoint');
                $path = ltrim($path, '/');
                return "{$endpoint}/{$path}";
            }
        }
        
        // Fallback for local storage - direct file serving
        return asset($path);
    }

    /**
     * Generate signed URL for private files
     */
    public function generateSignedUrl(string $path, int $expirationMinutes = 60): string
    {
        if ($this->isUsingBucketStorage()) {
            try {
                // For S3-compatible storage, we'll use public URLs for now
                // In production, implement proper S3 signed URLs using AWS SDK
                return $this->generateBucketUrl($path);
            } catch (\Exception $e) {
                Log::warning('Failed to generate signed URL, falling back to public URL', [
                    'path' => $path,
                    'error' => $e->getMessage()
                ]);
                return $this->generateBucketUrl($path);
            }
        }
        
        // For local storage, return regular URL (no signing available)
        return asset($path);
    }
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
                Log::error('Failed to upload product image', [
                    'store_id' => $storeId,
                    'filename' => $image->getClientOriginalName(),
                    'error' => $e->getMessage()
                ]);
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
     * Upload a single product image with bucket storage support
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
        $disk = $this->getStorageDisk('public');

        try {
            if ($this->isUsingBucketStorage()) {
                // Upload to bucket with organized path
                $bucketPath = $this->generateBucketPath('product_image', $storeId, $filename);
                $storedPath = Storage::disk($disk)->putFileAs(
                    dirname($bucketPath),
                    $image,
                    basename($bucketPath),
                    [
                        'visibility' => 'public',
                        'CacheControl' => 'max-age=31536000',
                        'ACL' => 'public-read'
                    ]
                );

                if (!$storedPath) {
                    throw new \Exception('Failed to store image file in bucket');
                }

                // Generate public URL for bucket storage
                $url = $this->generateBucketUrl($storedPath);
            } else {
                // Fallback to local storage
                $directory = "products/{$storeId}";
                Storage::disk($disk)->makeDirectory($directory);
                $storedPath = Storage::disk($disk)->putFileAs($directory, $image, $filename);

                if (!$storedPath) {
                    throw new \Exception('Failed to store image file locally');
                }

                $url = asset($storedPath);
            }
            
            Log::info('Product image uploaded successfully', [
                'store_id' => $storeId,
                'filename' => $filename,
                'original_name' => $image->getClientOriginalName(),
                'size' => $image->getSize(),
                'storage_type' => $this->isUsingBucketStorage() ? 'bucket' : 'local',
                'url' => $url,
                'path' => $storedPath
            ]);

            return $url;
        } catch (\Exception $e) {
            Log::error('Failed to upload product image', [
                'store_id' => $storeId,
                'filename' => $filename,
                'original_name' => $image->getClientOriginalName(),
                'storage_type' => $this->isUsingBucketStorage() ? 'bucket' : 'local',
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
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
        $errors = [];

        foreach ($files as $file) {
            if (!($file instanceof UploadedFile)) {
                $errors[] = 'Invalid file provided';
                continue;
            }

            if (!$this->validateDigitalFile($file)) {
                $errors[] = "Invalid digital file: {$file->getClientOriginalName()}";
                continue;
            }

            try {
                $uploadedFiles[] = $this->uploadDigitalFile($file, $storeId);
            } catch (\Exception $e) {
                Log::error('Failed to upload digital file', [
                    'store_id' => $storeId,
                    'filename' => $file->getClientOriginalName(),
                    'error' => $e->getMessage()
                ]);
                $errors[] = "Failed to upload {$file->getClientOriginalName()}: {$e->getMessage()}";
            }
        }

        if (!empty($errors) && empty($uploadedFiles)) {
            throw new \Exception('All digital file uploads failed: ' . implode(', ', $errors));
        }

        if (!empty($errors)) {
            Log::warning('Some digital files failed to upload', [
                'store_id' => $storeId,
                'errors' => $errors,
                'successful_uploads' => count($uploadedFiles)
            ]);
        }

        return $uploadedFiles;
    }

    /**
     * Upload a single digital file with bucket storage support
     */
    public function uploadDigitalFile(UploadedFile $file, string $storeId): array
    {
        // Validate the file
        if (!$this->validateDigitalFile($file)) {
            throw new \Exception('Invalid digital file: ' . $file->getClientOriginalName());
        }

        // Generate unique filename
        $extension = $file->getClientOriginalExtension();
        if (empty($extension)) {
            $extension = $file->guessExtension() ?? 'bin';
        }
        
        $filename = Str::uuid() . '.' . strtolower($extension);
        $disk = $this->getStorageDisk('private');

        try {
            if ($this->isUsingBucketStorage()) {
                // Upload to bucket with organized path (private)
                $bucketPath = $this->generateBucketPath('digital_file', $storeId, $filename);
                $storedPath = Storage::disk($disk)->putFileAs(
                    dirname($bucketPath),
                    $file,
                    basename($bucketPath),
                    [
                        'visibility' => 'private'
                    ]
                );

                if (!$storedPath) {
                    throw new \Exception('Failed to store digital file in bucket');
                }

                // For private files, we'll generate signed URLs when needed
                $url = $this->generateSignedUrl($storedPath);
            } else {
                // Fallback to local private storage
                $directory = "digital/{$storeId}";
                Storage::disk('local')->makeDirectory($directory);
                $storedPath = Storage::disk('local')->putFileAs($directory, $file, $filename);

                if (!$storedPath) {
                    throw new \Exception('Failed to store digital file locally');
                }

                $url = null; // Private files don't have direct URLs
            }

            Log::info('Digital file uploaded successfully', [
                'store_id' => $storeId,
                'filename' => $filename,
                'original_name' => $file->getClientOriginalName(),
                'size' => $file->getSize(),
                'storage_type' => $this->isUsingBucketStorage() ? 'bucket' : 'local',
                'path' => $storedPath
            ]);

            return [
                'original_name' => $file->getClientOriginalName(),
                'filename' => $filename,
                'path' => $storedPath,
                'size' => $file->getSize(),
                'mime_type' => $file->getMimeType(),
                'storage_type' => $this->isUsingBucketStorage() ? 'bucket' : 'local',
                'url' => $url, // Only for bucket storage, null for local
            ];
        } catch (\Exception $e) {
            Log::error('Failed to upload digital file', [
                'store_id' => $storeId,
                'filename' => $filename,
                'original_name' => $file->getClientOriginalName(),
                'storage_type' => $this->isUsingBucketStorage() ? 'bucket' : 'local',
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            throw new \Exception('Failed to upload digital file: ' . $e->getMessage());
        }
    }

    /**
     * Delete product image with bucket storage support
     */
    public function deleteProductImage(string $imageUrl): void
    {
        try {
            if ($this->isUsingBucketStorage()) {
                // Extract path from bucket URL
                $path = $this->extractPathFromBucketUrl($imageUrl);
                $disk = $this->getStorageDisk('public');
                
                if (Storage::disk($disk)->exists($path)) {
                    Storage::disk($disk)->delete($path);
                    Log::info('Product image deleted from bucket', [
                        'path' => $path,
                        'url' => $imageUrl
                    ]);
                }
            } else {
                // Extract path from local URL
                $baseUrl = asset('');
                $path = str_replace($baseUrl . '/', '', $imageUrl);
                $path = ltrim($path, '/');

                if (Storage::disk('public')->exists($path)) {
                    Storage::disk('public')->delete($path);
                    Log::info('Product image deleted from local storage', [
                        'path' => $path,
                        'url' => $imageUrl
                    ]);
                }
            }
        } catch (\Exception $e) {
            Log::error('Failed to delete product image', [
                'url' => $imageUrl,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Delete digital file with bucket storage support
     */
    public function deleteDigitalFile(string $filePath): void
    {
        try {
            if ($this->isUsingBucketStorage()) {
                $disk = $this->getStorageDisk('private');
                
                if (Storage::disk($disk)->exists($filePath)) {
                    Storage::disk($disk)->delete($filePath);
                    Log::info('Digital file deleted from bucket', [
                        'path' => $filePath
                    ]);
                }
            } else {
                if (Storage::disk('local')->exists($filePath)) {
                    Storage::disk('local')->delete($filePath);
                    Log::info('Digital file deleted from local storage', [
                        'path' => $filePath
                    ]);
                }
            }
        } catch (\Exception $e) {
            Log::error('Failed to delete digital file', [
                'path' => $filePath,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Extract file path from bucket URL
     */
    protected function extractPathFromBucketUrl(string $url): string
    {
        if ($this->isUsingBucketStorage()) {
            $endpoint = config('filesystems.disks.laravel_cloud.endpoint');
            
            // For Cloudflare R2, remove only the endpoint to get the path
            $baseUrl = "{$endpoint}/";
            $path = str_replace($baseUrl, '', $url);
            
            return ltrim($path, '/');
        }
        
        // Fallback for local URLs
        $baseUrl = asset('');
        $path = str_replace($baseUrl . '/', '', $url);
        return ltrim($path, '/');
    }

    /**
     * Get file size in human readable format with bucket support
     */
    public function getFileSize(string $filePath): string
    {
        try {
            $disk = $this->isUsingBucketStorage() ? $this->defaultDisk : 'local';
            
            if (!Storage::disk($disk)->exists($filePath)) {
                return '0 B';
            }

            $size = Storage::disk($disk)->size($filePath);
            $units = ['B', 'KB', 'MB', 'GB'];

            for ($i = 0; $size > 1024 && $i < 3; $i++) {
                $size /= 1024;
            }

            return round($size, 2) . ' ' . $units[$i];
        } catch (\Exception $e) {
            Log::warning('Failed to get file size', [
                'path' => $filePath,
                'error' => $e->getMessage()
            ]);
            return '0 B';
        }
    }

    /**
     * Copy file from one location to another within bucket
     */
    public function copyFile(string $sourcePath, string $destinationPath): bool
    {
        try {
            $disk = $this->getStorageDisk();
            
            if (!Storage::disk($disk)->exists($sourcePath)) {
                throw new \Exception("Source file does not exist: {$sourcePath}");
            }
            
            $success = Storage::disk($disk)->copy($sourcePath, $destinationPath);
            
            if ($success) {
                Log::info('File copied successfully', [
                    'source' => $sourcePath,
                    'destination' => $destinationPath,
                    'storage_type' => $this->isUsingBucketStorage() ? 'bucket' : 'local'
                ]);
            }
            
            return $success;
        } catch (\Exception $e) {
            Log::error('Failed to copy file', [
                'source' => $sourcePath,
                'destination' => $destinationPath,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    /**
     * Move file from one location to another within bucket
     */
    public function moveFile(string $sourcePath, string $destinationPath): bool
    {
        try {
            $disk = $this->getStorageDisk();
            
            if (!Storage::disk($disk)->exists($sourcePath)) {
                throw new \Exception("Source file does not exist: {$sourcePath}");
            }
            
            $success = Storage::disk($disk)->move($sourcePath, $destinationPath);
            
            if ($success) {
                Log::info('File moved successfully', [
                    'source' => $sourcePath,
                    'destination' => $destinationPath,
                    'storage_type' => $this->isUsingBucketStorage() ? 'bucket' : 'local'
                ]);
            }
            
            return $success;
        } catch (\Exception $e) {
            Log::error('Failed to move file', [
                'source' => $sourcePath,
                'destination' => $destinationPath,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    /**
     * Check if file exists in storage
     */
    public function fileExists(string $filePath): bool
    {
        try {
            $disk = $this->getStorageDisk();
            return Storage::disk($disk)->exists($filePath);
        } catch (\Exception $e) {
            Log::warning('Failed to check file existence', [
                'path' => $filePath,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    /**
     * Get file metadata
     */
    public function getFileMetadata(string $filePath): array
    {
        try {
            $disk = $this->getStorageDisk();
            
            if (!Storage::disk($disk)->exists($filePath)) {
                return [];
            }
            
            return [
                'size' => Storage::disk($disk)->size($filePath),
                'last_modified' => Storage::disk($disk)->lastModified($filePath),
                'exists' => true,
                'storage_type' => $this->isUsingBucketStorage() ? 'bucket' : 'local',
            ];
        } catch (\Exception $e) {
            Log::warning('Failed to get file metadata', [
                'path' => $filePath,
                'error' => $e->getMessage()
            ]);
            return ['exists' => false];
        }
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
