<?php

use Illuminate\Support\Facades\Route;

// Public routes
Route::get('/', [App\Http\Controllers\StorefrontController::class, 'index'])->name('home');

// CSRF token endpoint
Route::get('/csrf-token', function () {
    return response()->json(['csrf_token' => csrf_token()]);
})->name('csrf-token');

// Session refresh endpoint for handling 419 errors
Route::get('/refresh-session', function () {
    session()->regenerate();
    if (request()->expectsJson()) {
        return response()->json([
            'csrf_token' => csrf_token(),
            'message' => 'Session refreshed successfully'
        ]);
    }
    return redirect()->back()->with('success', 'Session refreshed. You can now continue.');
})->name('refresh-session');

// Public storefront routes
Route::prefix('products')->name('products.')->group(function () {
    Route::get('/', [App\Http\Controllers\StorefrontController::class, 'index'])->name('index');
    Route::get('/{product:slug}', [App\Http\Controllers\StorefrontController::class, 'show'])->name('show');
});

Route::prefix('stores')->name('stores.')->group(function () {
    Route::get('/', [App\Http\Controllers\StorefrontController::class, 'stores'])->name('index');
    Route::get('/{store:slug}', [App\Http\Controllers\StorefrontController::class, 'store'])->name('show');
});

// Cart routes (authenticated users)
Route::middleware(['auth'])->group(function () {
    Route::prefix('cart')->name('cart.')->group(function () {
        Route::get('/', [App\Http\Controllers\CartController::class, 'index'])->name('index');
        Route::post('/add/{product}', [App\Http\Controllers\CartController::class, 'add'])->name('add');
        Route::put('/{cart}', [App\Http\Controllers\CartController::class, 'update'])->name('update');
        Route::delete('/{cart}', [App\Http\Controllers\CartController::class, 'remove'])->name('remove');
        Route::delete('/', [App\Http\Controllers\CartController::class, 'clear'])->name('clear');
        Route::get('/count', [App\Http\Controllers\CartController::class, 'count'])->name('count');
    });

    Route::prefix('orders')->name('orders.')->group(function () {
        Route::get('/', [App\Http\Controllers\OrderController::class, 'index'])->name('index');
        Route::get('/checkout', [App\Http\Controllers\OrderController::class, 'checkout'])->name('checkout');
        Route::post('/checkout', [App\Http\Controllers\OrderController::class, 'store'])->name('store');
        Route::get('/{order}', [App\Http\Controllers\OrderController::class, 'show'])->name('show');
        Route::delete('/{order}', [App\Http\Controllers\OrderController::class, 'destroy'])->name('destroy');
        Route::patch('/{order}/cancel', [App\Http\Controllers\OrderController::class, 'cancel'])->name('cancel');
    });

    // Payment routes
    Route::prefix('payment')->name('payment.')->group(function () {
        Route::match(['get', 'post'], '/create-session/{order}', [App\Http\Controllers\PaymentController::class, 'createSession'])->name('create-session');
        Route::get('/success/{order}', [App\Http\Controllers\PaymentController::class, 'success'])->name('success');
        Route::get('/cancel/{order}', [App\Http\Controllers\PaymentController::class, 'cancel'])->name('cancel');
    });
});

// Webhook routes (no auth required)
Route::post('/webhooks/magpie', [App\Http\Controllers\PaymentController::class, 'webhook'])->name('webhooks.magpie');

// Authenticated user routing with role-based dashboard redirects
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', function () {
        /** @var \App\Models\User $user */
        $user = auth()->user();

        if ($user->isMerchant()) {
            return redirect()->route('merchant.dashboard');
        }

        if ($user->isAdmin()) {
            return redirect()->route('admin.dashboard');
        }

        // Default to buyer dashboard
        return redirect()->route('buyer.dashboard');
    })->name('dashboard');
});

// Buyer Routes
Route::middleware(['auth', 'verified', 'buyer'])->prefix('buyer')->name('buyer.')->group(function () {
    Route::get('/dashboard', [App\Http\Controllers\Buyer\DashboardController::class, 'index'])->name('dashboard');

    Route::get('/orders', [App\Http\Controllers\OrderController::class, 'index'])->name('orders');

    Route::get('/profile', function () {
        return response()->json(['message' => 'Buyer Profile']);
    })->name('profile');
});

// Merchant Routes
Route::middleware(['auth', 'verified', 'merchant'])->prefix('merchant')->name('merchant.')->group(function () {
    Route::get('/dashboard', [App\Http\Controllers\Merchant\DashboardController::class, 'index'])->name('dashboard');

    // Store management
    Route::get('/store/create', [App\Http\Controllers\Merchant\StoreController::class, 'create'])->name('store.create');
    Route::post('/store', [App\Http\Controllers\Merchant\StoreController::class, 'store'])->name('store.store');
    Route::get('/store/edit', [App\Http\Controllers\Merchant\StoreController::class, 'edit'])->name('store.edit');
    Route::put('/store', [App\Http\Controllers\Merchant\StoreController::class, 'update'])->name('store.update');

    // Product management
    Route::resource('products', App\Http\Controllers\Merchant\ProductController::class);
    Route::post('/products/{product}/publish', [App\Http\Controllers\Merchant\ProductController::class, 'publish'])->name('products.publish');
    Route::post('/products/{product}/unpublish', [App\Http\Controllers\Merchant\ProductController::class, 'unpublish'])->name('products.unpublish');

    // File upload routes
    Route::post('/products/upload-images', [App\Http\Controllers\Merchant\ProductController::class, 'uploadImages'])->name('products.upload-images');
    Route::post('/products/upload-files', [App\Http\Controllers\Merchant\ProductController::class, 'uploadDigitalFiles'])->name('products.upload-files');
    Route::delete('/products/delete-image', [App\Http\Controllers\Merchant\ProductController::class, 'deleteImage'])->name('products.delete-image');
    Route::delete('/products/delete-file', [App\Http\Controllers\Merchant\ProductController::class, 'deleteDigitalFile'])->name('products.delete-file');

    // Order management
    Route::get('/orders', [App\Http\Controllers\Merchant\OrderController::class, 'index'])->name('orders');
    Route::get('/orders/{order}', [App\Http\Controllers\Merchant\OrderController::class, 'show'])->name('orders.show');

    // Analytics
    Route::get('/analytics', [App\Http\Controllers\Merchant\DashboardController::class, 'getAnalytics'])->name('analytics');
});

// Admin Routes
Route::middleware(['auth', 'verified', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', [App\Http\Controllers\Admin\AdminDashboardController::class, 'index'])->name('dashboard');

    // User management
    Route::get('/users', [App\Http\Controllers\Admin\AdminDashboardController::class, 'users'])->name('users');
    Route::get('/users/{user}', [App\Http\Controllers\Admin\AdminDashboardController::class, 'showUser'])->name('users.show');
    Route::post('/users/{user}/make-merchant', [App\Http\Controllers\Admin\AdminDashboardController::class, 'createMerchant'])->name('users.make-merchant');

    // Merchant management
    Route::get('/merchants', [App\Http\Controllers\Admin\AdminDashboardController::class, 'merchants'])->name('merchants');
    Route::get('/merchants/create', [App\Http\Controllers\Admin\AdminDashboardController::class, 'createMerchantForm'])->name('merchants.create');
    Route::get('/merchants/{merchant}', [App\Http\Controllers\Admin\AdminDashboardController::class, 'showMerchant'])->name('merchants.show');
    Route::post('/merchants', [App\Http\Controllers\Admin\AdminDashboardController::class, 'storeMerchant'])->name('merchants.store');
    Route::patch('/merchants/{merchant}/approve', [App\Http\Controllers\Admin\AdminDashboardController::class, 'approveMerchant'])->name('merchants.approve');
    Route::patch('/merchants/{merchant}/suspend', [App\Http\Controllers\Admin\AdminDashboardController::class, 'suspendMerchant'])->name('merchants.suspend');
    Route::patch('/merchants/{merchant}/reject', [App\Http\Controllers\Admin\AdminDashboardController::class, 'rejectMerchant'])->name('merchants.reject');
    Route::patch('/merchants/{merchant}/reactivate', [App\Http\Controllers\Admin\AdminDashboardController::class, 'reactivateMerchant'])->name('merchants.reactivate');

    // Store management
    Route::get('/stores', [App\Http\Controllers\Admin\AdminDashboardController::class, 'stores'])->name('stores');
    Route::patch('/stores/{store}/approve', [App\Http\Controllers\Admin\AdminDashboardController::class, 'approveStore'])->name('stores.approve');
    Route::patch('/stores/{store}/suspend', [App\Http\Controllers\Admin\AdminDashboardController::class, 'suspendStore'])->name('stores.suspend');

    // Order management
    Route::get('/orders', [App\Http\Controllers\Admin\AdminDashboardController::class, 'orders'])->name('orders');

    // Payment management
    Route::get('/payments', [App\Http\Controllers\Admin\AdminDashboardController::class, 'payments'])->name('payments');

    // Category management
    Route::get('/categories', [App\Http\Controllers\Admin\AdminDashboardController::class, 'categories'])->name('categories');
    Route::get('/categories/create', [App\Http\Controllers\Admin\AdminDashboardController::class, 'createCategoryForm'])->name('categories.create');
    Route::post('/categories', [App\Http\Controllers\Admin\AdminDashboardController::class, 'storeCategory'])->name('categories.store');
    Route::get('/categories/{category}/edit', [App\Http\Controllers\Admin\AdminDashboardController::class, 'editCategoryForm'])->name('categories.edit');
    Route::patch('/categories/{category}', [App\Http\Controllers\Admin\AdminDashboardController::class, 'updateCategory'])->name('categories.update');
    Route::delete('/categories/{category}', [App\Http\Controllers\Admin\AdminDashboardController::class, 'deleteCategory'])->name('categories.delete');

    // Analytics
    Route::get('/analytics', [App\Http\Controllers\Admin\AdminDashboardController::class, 'analytics'])->name('analytics');

    // File management
    Route::get('/files', [App\Http\Controllers\Admin\AdminDashboardController::class, 'files'])->name('files');
    Route::post('/files/cleanup', [App\Http\Controllers\Admin\AdminDashboardController::class, 'cleanupFiles'])->name('files.cleanup');
});

// Digital File Downloads (authenticated users only)
Route::middleware('auth')->group(function () {
    Route::get('/digital-files/{productId}/{filename}', [App\Http\Controllers\DigitalFileController::class, 'download'])
        ->name('digital-files.download')
        ->where(['productId' => '[0-9a-f-]{36}', 'filename' => '.*']);
    Route::get('/digital-files/{productId}/{filename}/preview', [App\Http\Controllers\DigitalFileController::class, 'preview'])
        ->name('digital-files.preview')
        ->where(['productId' => '[0-9a-f-]{36}', 'filename' => '.*']);
});

// Documentation/Markdown viewer routes (public access)
Route::prefix('docs')->name('docs.')->group(function () {
    Route::get('/', [App\Http\Controllers\MarkdownController::class, 'index'])->name('index');
    Route::get('/{filename}', [App\Http\Controllers\MarkdownController::class, 'show'])->name('show');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
