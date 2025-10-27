<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
use App\Services\FileUploadService;

class Product extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'store_id',
        'category_id',
        'name',
        'slug',
        'description',
        'price',
        'quantity',
        'digital_product',
        'download_url',
        'images',
        'digital_files',
        'status',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'integer',
            'digital_product' => 'boolean',
            'images' => 'array',
            'digital_files' => 'array',
            'metadata' => 'array',
        ];
    }

    protected function price(): \Illuminate\Database\Eloquent\Casts\Attribute
    {
        return \Illuminate\Database\Eloquent\Casts\Attribute::make(
            get: fn ($value) => $value / 100,
            set: fn ($value) => $value * 100,
        );
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($product) {
            if (empty($product->slug)) {
                $product->slug = Str::slug($product->name);
            }
        });
    }

    public function store()
    {
        return $this->belongsTo(Store::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function isPublished(): bool
    {
        return $this->status === 'published';
    }

    public function isDraft(): bool
    {
        return $this->status === 'draft';
    }

    public function isArchived(): bool
    {
        return $this->status === 'archived';
    }

    public function isInStock(): bool
    {
        return $this->quantity > 0;
    }

    public function isDigital(): bool
    {
        return ! empty($this->digital_files);
    }

    /**
     * Get processed image URLs with bucket support
     */
    public function getImageUrls(): array
    {
        if (empty($this->images)) {
            return [];
        }

        $fileUploadService = app(FileUploadService::class);
        $processedImages = [];

        foreach ($this->images as $image) {
            if (is_string($image)) {
                // Legacy format: just URL string
                $processedImages[] = [
                    'url' => $image,
                    'storage_type' => $this->detectStorageType($image),
                    'alt' => $this->name,
                ];
            } elseif (is_array($image)) {
                // New format: array with metadata
                $processedImages[] = array_merge([
                    'alt' => $this->name,
                    'storage_type' => $image['storage_type'] ?? $this->detectStorageType($image['url'] ?? ''),
                ], $image);
            }
        }

        return $processedImages;
    }

    /**
     * Get processed digital files with bucket support
     */
    public function getDigitalFiles(): array
    {
        if (empty($this->digital_files)) {
            return [];
        }

        $fileUploadService = app(FileUploadService::class);
        $processedFiles = [];

        foreach ($this->digital_files as $file) {
            if (is_array($file)) {
                $processedFile = $file;
                
                // Generate signed URL for private files if using bucket storage
                if (isset($file['storage_type']) && $file['storage_type'] === 'bucket' && isset($file['path'])) {
                    $processedFile['download_url'] = $fileUploadService->generateSignedUrl($file['path']);
                }
                
                $processedFiles[] = $processedFile;
            }
        }

        return $processedFiles;
    }

    /**
     * Detect storage type from URL
     */
    protected function detectStorageType(string $url): string
    {
        $bucketEndpoint = config('filesystems.disks.laravel_cloud.endpoint');
        
        if ($bucketEndpoint && str_contains($url, $bucketEndpoint)) {
            return 'bucket';
        }
        
        return 'local';
    }

    /**
     * Add image to product with metadata
     */
    public function addImage(string $url, array $metadata = []): void
    {
        $images = $this->images ?? [];
        
        $imageData = array_merge([
            'url' => $url,
            'storage_type' => $this->detectStorageType($url),
            'uploaded_at' => now()->toISOString(),
        ], $metadata);
        
        $images[] = $imageData;
        $this->update(['images' => $images]);
    }

    /**
     * Remove image from product
     */
    public function removeImage(string $url): void
    {
        $images = $this->images ?? [];
        
        $updatedImages = array_filter($images, function ($image) use ($url) {
            if (is_string($image)) {
                return $image !== $url;
            }
            if (is_array($image) && isset($image['url'])) {
                return $image['url'] !== $url;
            }
            return true;
        });
        
        $this->update(['images' => array_values($updatedImages)]);
    }

    /**
     * Add digital file to product with metadata
     */
    public function addDigitalFile(array $fileData): void
    {
        $files = $this->digital_files ?? [];
        
        $fileData['uploaded_at'] = $fileData['uploaded_at'] ?? now()->toISOString();
        $files[] = $fileData;
        
        $this->update(['digital_files' => $files]);
    }

    /**
     * Remove digital file from product
     */
    public function removeDigitalFile(string $path): void
    {
        $files = $this->digital_files ?? [];
        
        $updatedFiles = array_filter($files, function ($file) use ($path) {
            return isset($file['path']) && $file['path'] !== $path;
        });
        
        $this->update(['digital_files' => array_values($updatedFiles)]);
    }

    /**
     * Get primary image URL
     */
    public function getPrimaryImageUrl(): ?string
    {
        $images = $this->getImageUrls();
        
        if (empty($images)) {
            return null;
        }
        
        return $images[0]['url'] ?? null;
    }

    /**
     * Check if product has bucket-stored files
     */
    public function hasBucketFiles(): bool
    {
        $images = $this->getImageUrls();
        $files = $this->getDigitalFiles();
        
        foreach ($images as $image) {
            if (($image['storage_type'] ?? '') === 'bucket') {
                return true;
            }
        }
        
        foreach ($files as $file) {
            if (($file['storage_type'] ?? '') === 'bucket') {
                return true;
            }
        }
        
        return false;
    }

    public function scopePublished($query)
    {
        return $query->where('status', 'published');
    }

    public function scopeDraft($query)
    {
        return $query->where('status', 'draft');
    }

    public function scopeInStock($query)
    {
        return $query->where('quantity', '>', 0);
    }
}
