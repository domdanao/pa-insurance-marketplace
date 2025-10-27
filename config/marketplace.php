<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Laravel Cloud Bucket Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration settings specific to Laravel Cloud bucket storage
    | for the marketplace application.
    |
    */

    // Bucket storage limits
    'bucket_max_image_size' => env('BUCKET_MAX_IMAGE_SIZE', 10240), // 10MB in KB
    'bucket_max_file_size' => env('BUCKET_MAX_FILE_SIZE', 102400), // 100MB in KB
    'bucket_max_images_per_upload' => env('BUCKET_MAX_IMAGES_PER_UPLOAD', 10),
    'bucket_max_files_per_upload' => env('BUCKET_MAX_FILES_PER_UPLOAD', 5),

    // File organization
    'bucket_folder_structure' => [
        'products' => [
            'images' => 'products/images',
            'files' => 'products/files',
            'documents' => 'products/documents',
        ],
        'stores' => [
            'assets' => 'stores',
        ],
        'temp' => 'temp/uploads',
    ],

    // File access settings
    'bucket_public_files' => [
        'product_images',
        'store_logos',
        'store_banners',
    ],

    'bucket_private_files' => [
        'digital_files',
        'product_documents',
        'merchant_documents',
    ],

    // Signed URL settings
    'signed_url_expiration' => [
        'default' => 60, // 1 hour in minutes
        'download' => 1440, // 24 hours in minutes
        'preview' => 30, // 30 minutes
    ],

    // File cleanup settings
    'cleanup_temp_files_after' => 24, // hours
    'cleanup_failed_uploads_after' => 1, // hours

    // Storage optimization
    'enable_file_compression' => env('BUCKET_ENABLE_COMPRESSION', true),
    'enable_duplicate_detection' => env('BUCKET_ENABLE_DUPLICATE_DETECTION', true),
    'enable_automatic_backup' => env('BUCKET_ENABLE_BACKUP', false),

    // Monitoring and logging
    'log_bucket_operations' => env('BUCKET_LOG_OPERATIONS', true),
    'monitor_storage_usage' => env('BUCKET_MONITOR_USAGE', true),
    'alert_storage_threshold' => env('BUCKET_ALERT_THRESHOLD', 80), // percentage

    // Performance settings
    'enable_cdn' => env('BUCKET_ENABLE_CDN', false),
    'cdn_url' => env('BUCKET_CDN_URL', null),
    'enable_image_optimization' => env('BUCKET_ENABLE_IMAGE_OPTIMIZATION', true),

    // Security settings
    'enable_virus_scanning' => env('BUCKET_ENABLE_VIRUS_SCAN', false),
    'allowed_mime_types' => [
        'images' => [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'image/svg+xml',
        ],
        'documents' => [
            'application/pdf',
            'application/zip',
            'application/x-zip-compressed',
            'text/plain',
            'text/csv',
            'application/json',
            'application/xml',
            'text/xml',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ],
    ],

    // Error handling
    'retry_failed_uploads' => env('BUCKET_RETRY_UPLOADS', 3),
    'fallback_to_local' => env('BUCKET_FALLBACK_LOCAL', true),
    'graceful_degradation' => env('BUCKET_GRACEFUL_DEGRADATION', true),
];