<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Marketplace Configuration
    |--------------------------------------------------------------------------
    |
    | This file contains marketplace-specific settings and feature flags that
    | can be customized for each marketplace implementation.
    |
    */

    'name' => env('MARKETPLACE_NAME', 'Laravel Marketplace Template'),
    'version' => '1.0.0',
    'description' => 'A comprehensive Laravel marketplace template for e-commerce applications',

    /*
    |--------------------------------------------------------------------------
    | Branding Configuration
    |--------------------------------------------------------------------------
    |
    | Configure the default branding elements that can be easily customized
    | for each marketplace implementation.
    |
    */

    'branding' => [
        'primary_color' => env('BRAND_PRIMARY_COLOR', '#4F46E5'), // Indigo-600
        'secondary_color' => env('BRAND_SECONDARY_COLOR', '#059669'), // Emerald-600
        'logo_path' => env('BRAND_LOGO_PATH', '/images/logo.png'),
        'favicon_path' => env('BRAND_FAVICON_PATH', '/favicon.svg'),
        'company_name' => env('BRAND_COMPANY_NAME', 'Your Marketplace'),
        'tagline' => env('BRAND_TAGLINE', 'Your trusted marketplace for everything'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Feature Flags
    |--------------------------------------------------------------------------
    |
    | Enable or disable features that can be toggled per implementation.
    |
    */

    'features' => [
        'digital_products' => env('FEATURE_DIGITAL_PRODUCTS', true),
        'physical_products' => env('FEATURE_PHYSICAL_PRODUCTS', true),
        'subscription_products' => env('FEATURE_SUBSCRIPTION_PRODUCTS', false),
        'multi_vendor' => env('FEATURE_MULTI_VENDOR', true),
        'reviews_and_ratings' => env('FEATURE_REVIEWS_RATINGS', true),
        'wishlist' => env('FEATURE_WISHLIST', true),
        'advanced_search' => env('FEATURE_ADVANCED_SEARCH', true),
        'analytics_dashboard' => env('FEATURE_ANALYTICS_DASHBOARD', true),
        'email_notifications' => env('FEATURE_EMAIL_NOTIFICATIONS', true),
        'sms_notifications' => env('FEATURE_SMS_NOTIFICATIONS', false),
    ],

    /*
    |--------------------------------------------------------------------------
    | Payment Configuration
    |--------------------------------------------------------------------------
    |
    | Default payment gateway configurations that can be customized.
    |
    */

    'payments' => [
        'default_gateway' => env('DEFAULT_PAYMENT_GATEWAY', 'magpie'),
        'supported_currencies' => explode(',', env('SUPPORTED_CURRENCIES', 'PHP,USD,EUR')),
        'default_currency' => env('DEFAULT_CURRENCY', 'PHP'),
        'commission_rate' => env('MARKETPLACE_COMMISSION_RATE', 5.0), // Percentage
    ],

    /*
    |--------------------------------------------------------------------------
    | Localization
    |--------------------------------------------------------------------------
    |
    | Default localization settings for the marketplace.
    |
    */

    'localization' => [
        'default_locale' => env('DEFAULT_LOCALE', 'en'),
        'supported_locales' => explode(',', env('SUPPORTED_LOCALES', 'en,es,fr')),
        'default_timezone' => env('DEFAULT_TIMEZONE', 'Asia/Manila'),
        'date_format' => env('DATE_FORMAT', 'Y-m-d'),
        'time_format' => env('TIME_FORMAT', 'H:i:s'),
    ],

    /*
    |--------------------------------------------------------------------------
    | File Upload Settings
    |--------------------------------------------------------------------------
    |
    | Default file upload configurations.
    |
    */

    'uploads' => [
        'max_file_size' => env('MAX_FILE_SIZE', 10), // MB
        'allowed_image_types' => explode(',', env('ALLOWED_IMAGE_TYPES', 'jpg,jpeg,png,gif,webp')),
        'allowed_document_types' => explode(',', env('ALLOWED_DOCUMENT_TYPES', 'pdf,doc,docx,txt')),
        'max_images_per_product' => env('MAX_IMAGES_PER_PRODUCT', 10),
        'max_files_per_product' => env('MAX_FILES_PER_PRODUCT', 5),
    ],

    /*
    |--------------------------------------------------------------------------
    | Customization Points
    |--------------------------------------------------------------------------
    |
    | Define key areas that should be customized for each marketplace implementation.
    | Each point represents a critical area that needs marketplace-specific content.
    | Access these settings in your code using: config('store-settings.customization_points')
    |
    */

    'customization_points' => [
        
        // Frontend & User Experience
        'homepage_hero_section' => [
            'priority' => 'critical',
            'description' => 'Main hero section with marketplace value proposition',
            'files' => ['resources/js/pages/welcome.tsx'],
            'includes' => [
                'Hero headline and tagline',
                'Call-to-action buttons',
                'Featured categories or products',
                'Hero background image/video',
                'Value proposition messaging'
            ],
            'considerations' => [
                'Target audience messaging',
                'Marketplace positioning (B2B, B2C, niche)',
                'Brand voice and tone',
                'Mobile-first design approach'
            ]
        ],

        'navigation_structure' => [
            'priority' => 'high',
            'description' => 'Main navigation, categories, and site structure',
            'files' => [
                'resources/js/Layouts/StorefrontLayout.tsx',
                'resources/js/components/nav-main.tsx'
            ],
            'includes' => [
                'Primary navigation menu',
                'Category navigation',
                'User account menu',
                'Search functionality placement',
                'Mobile navigation design'
            ],
            'considerations' => [
                'Product categorization strategy',
                'User journey optimization',
                'Accessibility standards',
                'Multi-language support if needed'
            ]
        ],

        'product_discovery' => [
            'priority' => 'high',
            'description' => 'Search, filtering, and product browsing experience',
            'files' => [
                'resources/js/pages/Products/',
                'resources/js/components/ProductGrid.tsx',
                'resources/js/components/ProductFilters.tsx'
            ],
            'includes' => [
                'Search algorithms and relevance',
                'Filter options and categories',
                'Sort options and defaults',
                'Product grid layout',
                'Infinite scroll or pagination'
            ],
            'considerations' => [
                'Product catalog size and performance',
                'Advanced search features needed',
                'Filter complexity for your industry',
                'Mobile browsing experience'
            ]
        ],

        'checkout_experience' => [
            'priority' => 'critical',
            'description' => 'Complete purchase flow from cart to completion',
            'files' => [
                'resources/js/pages/Checkout/',
                'resources/js/pages/Cart/',
                'app/Http/Controllers/OrderController.php'
            ],
            'includes' => [
                'Cart design and functionality',
                'Guest vs. account checkout',
                'Shipping options and rates',
                'Tax calculation logic',
                'Order confirmation flow'
            ],
            'considerations' => [
                'Payment gateway integration',
                'Shipping zones and methods',
                'Tax compliance requirements',
                'Abandoned cart recovery',
                'Order modification policies'
            ]
        ],

        // Content & Legal
        'footer_content' => [
            'priority' => 'medium',
            'description' => 'Footer links, contact info, and secondary navigation',
            'files' => ['resources/js/components/nav-footer.tsx'],
            'includes' => [
                'Company information and contact',
                'Legal page links',
                'Social media links',
                'Newsletter signup',
                'Secondary navigation'
            ],
            'considerations' => [
                'Legal compliance requirements',
                'Customer support channels',
                'Brand consistency',
                'SEO optimization'
            ]
        ],

        'legal_pages' => [
            'priority' => 'critical',
            'description' => 'All legal documentation and policy pages',
            'files' => ['resources/js/pages/Legal/'],
            'includes' => [
                'Terms of Service',
                'Privacy Policy', 
                'Cookie Policy',
                'Refund/Return Policy',
                'Shipping Policy',
                'Acceptable Use Policy'
            ],
            'considerations' => [
                'Local jurisdiction requirements',
                'GDPR/CCPA compliance if applicable',
                'Industry-specific regulations',
                'Regular legal review schedule',
                'Multi-language versions if needed'
            ]
        ],

        // Communication & Notifications
        'email_templates' => [
            'priority' => 'high',
            'description' => 'All automated email communications',
            'files' => [
                'resources/views/emails/',
                'app/Mail/',
                'app/Notifications/'
            ],
            'includes' => [
                'Welcome and registration emails',
                'Order confirmation and updates',
                'Shipping notifications',
                'Password reset emails',
                'Merchant notifications',
                'Admin alerts'
            ],
            'considerations' => [
                'Brand voice in communications',
                'Email deliverability setup',
                'Transactional vs. marketing emails',
                'Multi-language support',
                'Email frequency preferences'
            ]
        ],

        'notification_system' => [
            'priority' => 'medium',
            'description' => 'In-app notifications and alert system',
            'files' => [
                'resources/js/components/Notifications.tsx',
                'app/Notifications/'
            ],
            'includes' => [
                'Real-time notifications',
                'Notification preferences',
                'Push notification setup',
                'SMS notifications (optional)',
                'Notification history'
            ],
            'considerations' => [
                'User notification preferences',
                'Critical vs. informational alerts',
                'Notification delivery methods',
                'Opt-out mechanisms'
            ]
        ],

        // User Experience Flows
        'user_onboarding' => [
            'priority' => 'high',
            'description' => 'New customer registration and first-time experience',
            'files' => [
                'resources/js/pages/Auth/',
                'resources/js/pages/Onboarding/',
                'app/Http/Controllers/Auth/'
            ],
            'includes' => [
                'Registration process design',
                'Email verification flow',
                'Profile completion prompts',
                'First purchase incentives',
                'Tutorial or product tour'
            ],
            'considerations' => [
                'Reduce friction in signup',
                'Social login options',
                'Age verification if needed',
                'Welcome series automation',
                'Mobile-first onboarding'
            ]
        ],

        'merchant_onboarding' => [
            'priority' => 'critical',
            'description' => 'Seller registration, verification, and store setup',
            'files' => [
                'resources/js/pages/Merchant/Onboarding/',
                'app/Http/Controllers/Merchant/',
                'app/Models/Merchant.php'
            ],
            'includes' => [
                'Merchant application process',
                'Business verification requirements',
                'Store setup wizard',
                'Product listing tutorials',
                'Payment account connection'
            ],
            'considerations' => [
                'KYC/verification requirements',
                'Merchant approval criteria',
                'Time to first sale optimization',
                'Training and support resources',
                'Commission structure communication'
            ]
        ],

        // Business Logic & Operations
        'payment_integration' => [
            'priority' => 'critical',
            'description' => 'Payment processing, gateways, and financial flows',
            'files' => [
                'app/Http/Controllers/PaymentController.php',
                'app/Services/PaymentService.php',
                'config/services.php'
            ],
            'includes' => [
                'Primary payment gateway setup',
                'Alternative payment methods',
                'Split payment logic (marketplace)',
                'Refund and dispute handling',
                'Payout schedules to merchants'
            ],
            'considerations' => [
                'Local payment preferences',
                'Currency support requirements',
                'Fraud prevention measures',
                'PCI compliance requirements',
                'Cross-border payment regulations'
            ]
        ],

        'search_and_discovery' => [
            'priority' => 'high',
            'description' => 'Product search, recommendations, and discovery features',
            'files' => [
                'app/Http/Controllers/SearchController.php',
                'resources/js/components/SearchResults.tsx'
            ],
            'includes' => [
                'Search algorithm customization',
                'Autocomplete and suggestions',
                'Related products logic',
                'Recently viewed items',
                'Personalized recommendations'
            ],
            'considerations' => [
                'Search performance at scale',
                'Elasticsearch/Algolia integration',
                'A/B testing search results',
                'Voice search capabilities',
                'Visual search features'
            ]
        ],

        'analytics_and_tracking' => [
            'priority' => 'medium',
            'description' => 'Analytics implementation and data tracking',
            'files' => [
                'resources/js/hooks/useAnalytics.tsx',
                'resources/views/app.blade.php'
            ],
            'includes' => [
                'Google Analytics setup',
                'E-commerce event tracking',
                'Conversion funnel analysis',
                'Custom dashboard metrics',
                'GDPR-compliant tracking'
            ],
            'considerations' => [
                'Privacy regulations compliance',
                'Customer data protection',
                'Performance impact of tracking',
                'Custom vs. third-party analytics',
                'Real-time vs. batch processing'
            ]
        ],

        // Security & Compliance
        'security_measures' => [
            'priority' => 'critical',
            'description' => 'Security implementations and compliance measures',
            'files' => [
                'app/Http/Middleware/',
                'config/auth.php',
                'config/security.php'
            ],
            'includes' => [
                'Two-factor authentication',
                'Rate limiting configuration',
                'CSRF protection customization',
                'API security measures',
                'Data encryption requirements'
            ],
            'considerations' => [
                'Industry security standards',
                'Penetration testing schedule',
                'Security incident response plan',
                'Regular security audits',
                'Staff security training'
            ]
        ],

        'internationalization' => [
            'priority' => 'low',
            'description' => 'Multi-language and multi-region support',
            'files' => [
                'resources/lang/',
                'config/app.php',
                'resources/js/hooks/useTranslation.tsx'
            ],
            'includes' => [
                'Language detection and switching',
                'Content translation workflow',
                'Currency conversion',
                'Local shipping and payment methods',
                'Cultural design adaptations'
            ],
            'considerations' => [
                'Target market languages',
                'Right-to-left language support',
                'Local compliance requirements',
                'Cultural color and design preferences',
                'Local customer support hours'
            ]
        ]
    ],
];