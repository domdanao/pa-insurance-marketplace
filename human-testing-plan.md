# 🧪 Browser Testing Plan for Marketplace Application

**Base URL:** http://marketplace.test

## 🚀 Quick Start
Start with a completely empty database and create only a single admin user:

```bash
# Start fresh
php artisan migrate:fresh

# Create ONLY the admin user manually
php artisan tinker
```
```php
User::create([
    'name' => 'Admin User',
    'email' => 'admin@example.com',
    'email_verified_at' => now(),
    'password' => Hash::make('password'),
    'role' => 'admin',
]);
```

This creates a completely clean database with only one admin user, ensuring:
- No pre-existing merchant accounts, stores, products, categories, or orders
- Admin must create/manage everything from scratch including merchant accounts
- Realistic testing of the complete marketplace setup process
- Clear view of what gets created during the full testing flow

## 🎯 Testing Objectives
- Verify all user flows work end-to-end
- Test file upload functionality thoroughly 
- Validate role-based access controls
- Ensure payment integration flows properly
- Test responsive design and usability

---

## 🧪 Sequential Testing Flow

This testing plan follows a realistic marketplace setup flow:

### Phase 1: Admin Setup (Start Here)
**Single Admin User:**
- Email: `admin@example.com`
- Password: `password`
- Role: admin (created via tinker above)

### Phase 2: Merchant Account Management & Testing
**No pre-created merchant accounts** - Admin will create them OR approve self-registered applications

### Phase 3: Store & Product Management Testing
**Store creation** - Only after merchant accounts are approved

### Phase 4: Buyer Discovery & Purchase Testing
**No pre-created buyers** - they will register only when ready to purchase

---

## 🧪 Core Testing Scenarios

### Phase 1: Admin Journey (Empty Marketplace Setup)
**Test Steps:**
- [ ] Login as `admin@example.com` (password: `password`)
- [ ] Review empty platform statistics (should show zeros)
- [ ] Access file management dashboard (should be empty)
- [ ] Create initial product categories (required for merchants later)
  - [ ] Electronics
  - [ ] Books
  - [ ] Clothing
  - [ ] Digital Products
- [ ] Explore empty user management (only admin exists)
- [ ] Explore empty store management (no stores yet)
- [ ] Explore empty order management (no orders yet)
- [ ] Explore empty payment management (no payments yet)
- [ ] Test admin navigation and UI with empty data

**Expected Results:**
- Admin dashboard shows empty/zero statistics correctly
- Category creation works properly
- All admin sections handle empty states gracefully
- Admin can navigate and prepare marketplace for merchants

---

### Phase 2: Merchant Account Management Journey

#### 2A. Test Admin-Created Merchant Accounts (Two Methods)

**Method 1: Standalone Merchant Creation (NEW - Recommended)**
- [ ] Login as admin (`admin@example.com`)
- [ ] Navigate to Merchants → "Create Merchant" button
- [ ] Fill comprehensive merchant creation form:
  - [ ] **User Account Information:**
    - [ ] Full Name (required)
    - [ ] Email Address (required)
    - [ ] Password & Confirmation (required)
  - [ ] **Business Information:**
    - [ ] Business Name (required)
    - [ ] Business Type (required - dropdown)
    - [ ] Phone Number (required)
    - [ ] Business Address (required)
    - [ ] Tax ID (optional)
  - [ ] **Banking Information (Optional):**
    - [ ] Bank Name
    - [ ] Account Holder Name
    - [ ] Account Number
    - [ ] Routing Number
  - [ ] **Initial Status:**
    - [ ] Test with "Approved" status
    - [ ] Test with "Pending" status
    - [ ] Test with "Suspended" status
    - [ ] Test with "Rejected" status
- [ ] Submit form and verify redirect to merchant detail page
- [ ] Verify both user account AND merchant profile created
- [ ] Verify merchant account has correct status
- [ ] Verify email is auto-verified for admin-created accounts

**Method 2: Convert Existing User to Merchant (Original)**
- [ ] Navigate to User Management → view existing buyer user
- [ ] Click "Make Merchant" button on user detail page
- [ ] Fill simplified merchant business form:
  - [ ] Business Name (required)
  - [ ] Business Type (optional)
  - [ ] Phone number (optional)
- [ ] Submit form
- [ ] Verify merchant account is created with "approved" status
- [ ] Verify user role changed to "merchant"

#### 2B. Test Self-Registration Merchant Application (Alternative Flow)
**User applies for merchant account:**
- [ ] Register new user account via `/register`
- [ ] Login as that user - verify buyer dashboard
- [ ] **Future**: Test self-application form (not yet implemented)
- [ ] **For now**: Admin must create merchant accounts directly

#### 2C. Test Merchant Account Management
**Admin manages merchant accounts:**
- [ ] Navigate to **NEW**: `/admin/merchants` 
- [ ] Verify "Create Merchant" button is visible in header
- [ ] View merchant list with status filtering
- [ ] Filter by: Pending, Approved, Suspended, Rejected
- [ ] Search merchants by business name or owner
- [ ] Test merchant statistics cards (counts per status)
- [ ] Click "View" on a merchant to see details
- [ ] **Test merchant detail page:**
  - [ ] View complete business information including banking details
  - [ ] View owner information and user account details
  - [ ] View business statistics (stores, products, sales)
  - [ ] Test status action buttons (Approve/Suspend/Reject/Reactivate)
- [ ] **Test merchant creation validation:**
  - [ ] Try submitting empty form (should show validation errors)
  - [ ] Try duplicate email address (should fail)
  - [ ] Try invalid business type (should fail)
  - [ ] Try mismatched passwords (should fail)
- [ ] **Test merchant creation success:**
  - [ ] Fill all required fields correctly
  - [ ] Verify both user and merchant records created in database
  - [ ] Check that approved merchants have correct approval timestamps

#### 2D. Test Merchant Status Management
**Admin controls merchant lifecycle:**
- [ ] **Create merchants in different statuses:** Use standalone creation form to test each status
  - [ ] Create merchant with "Pending" status
  - [ ] Create merchant with "Approved" status  
  - [ ] Create merchant with "Suspended" status
  - [ ] Create merchant with "Rejected" status
- [ ] **Test status transitions from merchant list:**
  - [ ] **Approve pending merchant:** Click approve, verify status change and timestamp
  - [ ] **Suspend approved merchant:** Click suspend, add reason, verify status
  - [ ] **Reject pending merchant:** Click reject, add reason, verify status  
  - [ ] **Reactivate suspended merchant:** Click reactivate, verify status change
  - [ ] **Reactivate rejected merchant:** Click reactivate, verify status change
- [ ] **Test status transitions from merchant detail page:**
  - [ ] Visit individual merchant pages and test status buttons there
  - [ ] Verify status history/audit trail if displayed

#### 2E. Test Merchant Access Control
**Merchant tries to access dashboard with different statuses:**
- [ ] **No merchant account:** Login as user without merchant → see "No Merchant Account" page
- [ ] **Pending merchant:** Access merchant dashboard → see "Under Review" page
- [ ] **Suspended merchant:** Access merchant dashboard → see "Suspended" page  
- [ ] **Rejected merchant:** Access merchant dashboard → see "Rejected" page
- [ ] **Approved merchant:** Access merchant dashboard → proceed to normal dashboard

---

### Phase 3: Store & Product Management Journey

#### 3A. Store Creation (Approved Merchants Only)
**Test with approved merchant:**
- [ ] Login as approved merchant
- [ ] Verify merchant dashboard loads properly
- [ ] Navigate to store creation (first time)
- [ ] Fill store details completely
- [ ] Submit store for approval
- [ ] Verify "pending approval" status

#### 3B. Admin Approves Store
**Switch back to Admin:**
- [ ] Login as admin
- [ ] Navigate to Store Management
- [ ] See the new pending store
- [ ] Approve the store
- [ ] Verify store status changes to approved

#### 3C. Merchant Product Management
**Back to approved merchant with approved store:**
- [ ] Login as merchant
- [ ] Verify store is now approved
- [ ] Navigate to Products section
- [ ] Create first physical product
  - [ ] Upload product images (JPG, PNG, WebP)
  - [ ] Set proper category, price, quantity
  - [ ] Publish product
- [ ] Create digital product
  - [ ] Upload digital files (PDF, ZIP, DOC)
  - [ ] Set download details
  - [ ] Publish digital product
- [ ] Test file upload limits and validation
- [ ] View analytics (should show product stats)

#### 3D. Error Scenarios - Merchant Without Approved Account
**Test access controls:**
- [ ] User without merchant account tries `/merchant/store/create` → error
- [ ] Pending merchant tries to create store → error
- [ ] Suspended merchant tries to manage products → error
- [ ] Rejected merchant tries to access merchant areas → error

**Expected Results:**
- **NEW**: Standalone merchant creation flow works seamlessly (creates both user + merchant)
- **NEW**: Merchant creation form validates all fields properly
- **NEW**: Banking information is optional and stored correctly
- **NEW**: Initial status setting works (approved merchants have timestamps)
- Admin merchant management interface shows all merchants with proper filtering
- Merchant status controls access appropriately
- Store creation requires approved merchant account
- Product creation works for approved merchants with approved stores
- Proper error handling for all edge cases including duplicate emails

---

### Phase 4: Buyer Discovery & Purchase Journey

#### 4A. Anonymous Browsing (No Account)
**Test Steps:**
- [ ] Visit homepage (not logged in)
- [ ] Browse available products created by merchants
- [ ] Use search functionality
- [ ] Filter by category and price range
- [ ] View individual product pages
- [ ] Try to add to cart (should prompt for login/register)

#### 4B. Buyer Registration & Shopping
**Test Steps:**
- [ ] Register new buyer account via `/register`
- [ ] Browse products as authenticated user
- [ ] Add physical products to cart
- [ ] Add digital products to cart
- [ ] Update cart quantities
- [ ] Remove items from cart
- [ ] View cart count and totals
- [ ] Proceed to checkout
- [ ] Fill complete billing information
- [ ] Complete order (test payment flow)
- [ ] View order confirmation

#### 4C. Post-Purchase Testing
**Test Steps:**
- [ ] View order history in buyer dashboard
- [ ] Download purchased digital products
- [ ] Verify stock updates for physical products
- [ ] Test order cancellation (if pending)

#### 4D. Admin Views Complete System
**Switch back to Admin:**
- [ ] Review platform statistics (now with real data)
- [ ] View all merchant accounts and their status
- [ ] View all orders and payments
- [ ] Check file management with uploaded files
- [ ] Run orphaned file cleanup test
- [ ] View complete platform analytics

**Expected Results:**
- Anonymous browsing works properly
- Buyer registration and shopping flow works
- Payment processing completes successfully
- Digital downloads work for purchased items
- Admin can see complete marketplace activity including merchant management

---

### 5. File Upload Testing (Critical)
**Test Different File Types:**

**Product Images:**
- [ ] Upload JPG files (< 5MB)
- [ ] Upload PNG files (< 5MB) 
- [ ] Upload WebP files (< 5MB)
- [ ] Upload GIF files (< 5MB)
- [ ] Try uploading oversized files (> 5MB) - should fail
- [ ] Try uploading invalid formats (TXT, PDF) - should fail
- [ ] Delete uploaded images
- [ ] Verify images display correctly on product pages

**Digital Files:**
- [ ] Upload PDF files (< 50MB)
- [ ] Upload ZIP files (< 50MB)
- [ ] Upload DOC/DOCX files (< 50MB)
- [ ] Upload Excel files (< 50MB)
- [ ] Try uploading oversized files (> 50MB) - should fail
- [ ] Try uploading invalid formats (EXE, DMG) - should fail
- [ ] Delete uploaded files
- [ ] Verify file download works for authorized users

---

### 6. Security & Access Control Testing
**Test Steps:**
- [ ] Try accessing admin routes as buyer/merchant (should fail)
- [ ] Try accessing merchant routes as buyer (should fail)
- [ ] **NEW**: Try accessing merchant routes without merchant account (should fail)
- [ ] **NEW**: Try accessing merchant routes as pending merchant (should show "Under Review")
- [ ] **NEW**: Try accessing merchant routes as suspended merchant (should show "Suspended")  
- [ ] **NEW**: Try accessing merchant routes as rejected merchant (should show "Rejected")
- [ ] Try downloading digital files without purchase (should fail)
- [ ] Try modifying other users' products/orders (should fail)
- [ ] **NEW**: Try creating stores without approved merchant account (should fail)
- [ ] Verify suspended stores cannot add products
- [ ] **NEW**: Verify suspended merchants cannot manage stores/products
- [ ] Test CSRF protection on forms
- [ ] **NEW**: Test merchant status changes reflect immediately in access control

---

### 7. Edge Cases & Error Handling
**Test Steps:**
- [ ] Empty cart checkout attempt
- [ ] Add out-of-stock items to cart
- [ ] Add unpublished products to cart
- [ ] Upload malformed/corrupted files
- [ ] Extremely long product names/descriptions
- [ ] Special characters in search queries
- [ ] Navigation with browser back/forward buttons
- [ ] Refresh pages during form submissions
- [ ] **NEW**: Try creating merchant account for user who already has one
- [ ] **NEW**: Test merchant account creation with invalid business information
- [ ] **NEW**: Try accessing `/admin/merchants/{invalid_id}` (should 404)
- [ ] **NEW**: Test merchant status changes while merchant is logged in
- [ ] **NEW**: Test very long business names/descriptions in merchant forms
- [ ] **NEW**: Test merchant search with special characters
- [ ] **NEW**: Try creating merchant with existing email address (should fail)
- [ ] **NEW**: Test standalone merchant creation form with missing required fields
- [ ] **NEW**: Test merchant creation form with invalid business types
- [ ] **NEW**: Test merchant creation with mismatched password confirmation
- [ ] **NEW**: Try accessing `/admin/merchants/create` as non-admin (should fail)

---

### 8. Payment Flow Testing
**Test Steps:**
- [ ] Add items to cart and checkout
- [ ] Test payment success scenario
- [ ] Test payment cancellation
- [ ] Verify order status updates correctly
- [ ] Test webhook handling (if possible)
- [ ] Verify stock updates after purchase
- [ ] Test refund scenarios (if implemented)

---

### 9. Mobile/Responsive Testing
**Test on Different Devices:**
- [ ] iPhone/Android - Portrait mode
- [ ] iPhone/Android - Landscape mode  
- [ ] Tablet - Portrait/Landscape
- [ ] Desktop - Various screen sizes
- [ ] Test touch interactions
- [ ] Verify all buttons/links are accessible

---

### 10. Performance & Usability
**Test Steps:**
- [ ] Page load times (especially with images)
- [ ] File upload progress indicators
- [ ] Large file upload handling
- [ ] Search response times
- [ ] Navigation smoothness
- [ ] Form validation feedback
- [ ] Error message clarity

---

## 🚨 Critical Test Points

### Must Work Flawlessly:
1. **Standalone Merchant Creation** - Admin can create complete merchant accounts from scratch
2. **Merchant Account Management** - Admin can create, approve, suspend, reject merchants  
3. **Merchant Access Control** - Status-based access works correctly
4. **Bootstrapping Problem Solved** - Can create first merchant account with empty database
5. **File Upload Security** - Only authorized file types
6. **Digital File Access** - Purchase verification required
7. **Role-Based Access** - Users can only access appropriate areas
8. **Payment Processing** - Orders complete successfully  
9. **Stock Management** - Inventory updates correctly

### Common Issues to Watch For:
- **NEW**: Standalone merchant creation form validation issues
- **NEW**: Duplicate email addresses not being caught  
- **NEW**: Banking information not being stored/displayed correctly
- **NEW**: Initial merchant status not being set properly
- **NEW**: Auto-approved merchants missing approval timestamps
- **NEW**: Merchant creation form accessible to non-admins
- **NEW**: User account not being created alongside merchant profile
- **NEW**: Email verification not set for admin-created accounts
- **NEW**: Merchant status changes not reflected immediately
- **NEW**: Users without merchant accounts accessing merchant areas
- **NEW**: Pending/suspended merchants bypassing restrictions
- **NEW**: Store creation without approved merchant account
- **NEW**: Merchant management UI not showing correct data
- File upload timeouts on large files
- Image display issues after upload
- Digital download links not working
- Cart not persisting between sessions
- Payment redirects failing
- Admin actions not taking effect

---

## 📋 Testing Checklist Summary

**Pre-Testing Setup:**
- [ ] Application running at http://marketplace.test
- [ ] Fresh database migrated (`php artisan migrate:fresh`)
- [ ] Single admin user created (via tinker - see Quick Start)
- [ ] Storage directories writable
- [ ] Test payment credentials configured
- [ ] **NO** pre-created merchant accounts, buyers, stores, products, or categories

**Core Functionality:**
- [ ] User registration/authentication
- [ ] **NEW**: Standalone merchant account creation (admin creates user + merchant in one form)
- [ ] **NEW**: Merchant account management (create, approve, suspend, reject) 
- [ ] **NEW**: Merchant access control by status
- [ ] **NEW**: Comprehensive merchant creation validation
- [ ] **NEW**: Banking information storage (optional)
- [ ] Store creation and management (approved merchants only)
- [ ] Product browsing and search
- [ ] Shopping cart operations
- [ ] Order placement and management
- [ ] File upload/download system
- [ ] Admin panel functionality

**Security & Performance:**
- [ ] Access control enforcement
- [ ] File type validation
- [ ] Error handling
- [ ] Responsive design
- [ ] Performance under load

---

## 📝 Testing Notes

### File Upload Specifications:
- **Product Images**: JPG, PNG, GIF, WebP (max 5MB each)
- **Digital Files**: PDF, ZIP, DOC, DOCX, XLS, XLSX, TXT (max 50MB each)
- **Storage Locations**: 
  - Images: `storage/app/public/products/{store_id}/`
  - Digital files: `storage/app/digital/{store_id}/`

### Test Data Requirements:
- Categories with products
- **NEW**: Merchant accounts in different status states (pending, approved, suspended, rejected)
- **NEW**: Users with and without merchant accounts
- Stores in different approval states (linked to approved merchants)
- Products (both physical and digital)
- Sample images and digital files for upload testing

### Debugging Tips:
- Check Laravel logs: `storage/logs/laravel.log`
- Monitor browser console for JavaScript errors
- Use browser dev tools to inspect network requests
- Verify database records after operations

---

**Happy Testing! 🎉**

Remember to test systematically and document any issues you encounter. Focus especially on:
1. **Merchant account management system** - This is completely new
2. **Status-based access control** - Critical for security
3. **File upload system** - Continue testing thoroughly
4. **Admin → Merchant → Store → Product workflow** - End-to-end flow has changed significantly