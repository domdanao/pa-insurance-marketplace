<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Marketplace Name
    |--------------------------------------------------------------------------
    |
    | This value is the name of your marketplace that will be displayed
    | throughout the application, including the navigation header.
    |
    */
    'name' => env('MARKETPLACE_NAME', 'Marketplace'),

    /*
    |--------------------------------------------------------------------------
    | Marketplace Branding
    |--------------------------------------------------------------------------
    |
    | These values control the visual branding of your marketplace.
    |
    */
    'brand' => [
        'primary_color' => env('BRAND_PRIMARY_COLOR', '#4F46E5'),
        'secondary_color' => env('BRAND_SECONDARY_COLOR', '#059669'),
        'company_name' => env('BRAND_COMPANY_NAME', 'Your Company Name'),
        'tagline' => env('BRAND_TAGLINE', 'Your marketplace tagline'),
        'logo_path' => env('BRAND_LOGO_PATH', '/images/logo.png'),
        'favicon_path' => env('BRAND_FAVICON_PATH', '/favicon.svg'),
    ],
];