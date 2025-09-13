# Laravel Marketplace Template Usage Guide

This repository is a template for creating custom marketplace applications. Follow this guide to set up and customize your own marketplace.

## 🚀 Quick Start

### 1. Create New Project from Template

**Option A: Using GitHub Template**
1. Click "Use this template" on GitHub
2. Create your new repository
3. Clone your new repository locally

**Option B: Manual Clone**
```bash
git clone https://github.com/your-username/marketplace-template.git your-marketplace
cd your-marketplace
rm -rf .git
git init
git remote add origin https://github.com/your-username/your-marketplace.git
```

### 2. Initial Setup

```bash
# Install dependencies
composer install
npm install

# Environment setup
cp .env.template .env
# Edit .env with your specific settings

# Generate application key
php artisan key:generate

# Set up database
php artisan migrate
php artisan db:seed

# Build assets
npm run build

# Start development server
php artisan serve
```

## 🎨 Customization Guide

### 1. Basic Configuration

Edit `.env` file with your marketplace details:

```env
APP_NAME="Your Marketplace Name"
BRAND_COMPANY_NAME="Your Company"
BRAND_TAGLINE="Your unique selling proposition"
DEFAULT_CURRENCY=USD  # Change from PHP if needed
```

### 2. Branding Customization

**Logo & Favicon:**
```bash
# Replace these files with your branding
public/images/logo.png
public/images/favicon.ico
```

**Colors & Styling:**
```env
BRAND_PRIMARY_COLOR="#YOUR_PRIMARY_COLOR"
BRAND_SECONDARY_COLOR="#YOUR_SECONDARY_COLOR"
```

Update Tailwind configuration in `tailwind.config.js`:
```javascript
theme: {
  extend: {
    colors: {
      primary: process.env.BRAND_PRIMARY_COLOR || '#4F46E5',
      secondary: process.env.BRAND_SECONDARY_COLOR || '#059669',
    }
  }
}
```

### 3. Feature Configuration

Enable/disable features in `.env`:
```env
FEATURE_DIGITAL_PRODUCTS=true
FEATURE_SUBSCRIPTION_PRODUCTS=false
FEATURE_REVIEWS_RATINGS=true
```

### 4. Payment Gateway Setup

Configure your payment provider:
```env
DEFAULT_PAYMENT_GATEWAY=stripe  # or paypal, square, etc.
STRIPE_KEY=your_stripe_key
STRIPE_SECRET=your_stripe_secret
```

## 📁 Key Files to Customize

### Essential Customization Points

1. **Homepage Hero Section**
   - `resources/js/pages/Welcome.tsx`
   - Update hero content, images, and call-to-action

2. **Email Templates**
   - `resources/views/emails/`
   - Customize all email communications

3. **Legal Pages**
   - Create: `resources/js/pages/Legal/TermsOfService.tsx`
   - Create: `resources/js/pages/Legal/PrivacyPolicy.tsx`
   - Create: `resources/js/pages/Legal/ShippingPolicy.tsx`

4. **Footer Content**
   - `resources/js/components/Footer.tsx`
   - Update links, contact info, social media

5. **Navigation & Layout**
   - `resources/js/Layouts/AppLayout.tsx`
   - `resources/js/Layouts/StorefrontLayout.tsx`

## 🔧 Advanced Customization

### 1. Custom Payment Gateway

Create a new payment service:
```bash
php artisan make:class Services/PaymentGateways/YourGateway
```

Implement the payment interface and register in service container.

### 2. Custom Product Types

Extend the product model:
```php
// In a migration
Schema::table('products', function (Blueprint $table) {
    $table->json('custom_attributes')->nullable();
});
```

### 3. Additional User Roles

Create new middleware and guards:
```bash
php artisan make:middleware CustomRoleMiddleware
```

### 4. Custom Analytics

Extend the analytics service:
```bash
php artisan make:class Services/CustomAnalyticsService
```

## 🚦 Deployment Checklist

Before deploying your customized marketplace:

- [ ] Update all branding elements
- [ ] Configure production database
- [ ] Set up production mail service
- [ ] Configure payment gateway for production
- [ ] Update legal pages (terms, privacy, etc.)
- [ ] Set up SSL certificate
- [ ] Configure backup strategy
- [ ] Set up monitoring and logging
- [ ] Test all critical user flows
- [ ] Run security audit

## 📚 Additional Resources

- [Laravel Documentation](https://laravel.com/docs)
- [Inertia.js Documentation](https://inertiajs.com)
- [React Documentation](https://reactjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## 🤝 Contributing Back to Template

If you create useful features that could benefit other marketplace implementations:

1. Fork the original template repository
2. Create a feature branch
3. Implement the feature in a generic, configurable way
4. Submit a pull request

## 📞 Support

For template-specific issues:
- Open an issue on the template repository
- Check the documentation wiki
- Review existing issues and discussions

---

**Happy building! 🚀**