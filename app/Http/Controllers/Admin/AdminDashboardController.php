<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Merchant;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\Product;
use App\Models\Store;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class AdminDashboardController extends Controller
{
    public function index()
    {
        $stats = $this->getPlatformStats();

        return Inertia::render('Admin/Dashboard', [
            'stats' => $stats,
        ]);
    }

    public function users(Request $request)
    {
        $query = User::query();

        // Filter by role
        if ($request->filled('role')) {
            $query->where('role', $request->role);
        }

        // Search by name or email
        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                    ->orWhere('email', 'like', "%{$request->search}%");
            });
        }

        $users = $query->withCount(['orders', 'store'])
            ->latest()
            ->paginate(20);

        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
            'filters' => $request->only(['role', 'search']),
        ]);
    }

    public function showUser(User $user)
    {
        $user->load(['orders.orderItems.product', 'store.products', 'merchant']);

        $userStats = [
            'total_orders' => $user->orders->count(),
            'total_spent' => $user->orders->where('status', 'completed')->sum('total'),
            'pending_orders' => $user->orders->where('status', 'pending')->count(),
            'completed_orders' => $user->orders->where('status', 'completed')->count(),
            'cancelled_orders' => $user->orders->where('status', 'cancelled')->count(),
        ];

        // If user is a merchant, get store stats
        $storeStats = null;
        if ($user->isMerchant() && $user->store) {
            $storeStats = [
                'total_products' => $user->store->products->count(),
                'published_products' => $user->store->products->where('status', 'published')->count(),
                'total_sales' => $user->store->products->sum(function ($product) {
                    return $product->orderItems->where('order.status', 'completed')->sum('total_price');
                }),
                'orders_received' => $user->store->products->sum(function ($product) {
                    return $product->orderItems->count();
                }),
            ];
        }

        return Inertia::render('Admin/Users/Show', [
            'user' => $user,
            'userStats' => $userStats,
            'storeStats' => $storeStats,
        ]);
    }

    public function createMerchant(User $user, Request $request)
    {
        $request->validate([
            'business_name' => 'required|string|max:255',
            'business_type' => 'nullable|string|max:100',
            'phone' => 'nullable|string|max:20',
        ]);

        // Update user role if not already merchant
        if (! $user->isMerchant()) {
            $user->update(['role' => 'merchant']);
        }

        // Create merchant profile
        $merchant = $user->merchant()->create([
            'business_name' => $request->business_name,
            'business_type' => $request->business_type,
            'phone' => $request->phone,
            'status' => 'approved', // Admin-created merchants are auto-approved
            'approved_at' => now(),
            'approved_by' => auth()->id(),
        ]);

        return back()->with('success', 'Merchant profile created successfully.');
    }

    public function merchants(Request $request)
    {
        $query = Merchant::with(['user', 'store']);

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Search by business name or user details
        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('business_name', 'like', "%{$request->search}%")
                    ->orWhereHas('user', function ($userQuery) use ($request) {
                        $userQuery->where('name', 'like', "%{$request->search}%")
                            ->orWhere('email', 'like', "%{$request->search}%");
                    });
            });
        }

        $merchants = $query->latest()
            ->paginate(20);

        return Inertia::render('Admin/Merchants/Index', [
            'merchants' => $merchants,
            'filters' => $request->only(['status', 'search']),
        ]);
    }

    public function showMerchant(Merchant $merchant)
    {
        $merchant->load(['user', 'store.products', 'approvedBy']);

        $merchantStats = [
            'total_products' => $merchant->store ? $merchant->store->products->count() : 0,
            'published_products' => $merchant->store ? $merchant->store->products->where('status', 'published')->count() : 0,
            'total_sales' => $merchant->store ? $merchant->store->orderItems->where('order.status', 'completed')->sum('total_price') : 0,
            'orders_received' => $merchant->store ? $merchant->store->orderItems->count() : 0,
        ];

        return Inertia::render('Admin/Merchants/Show', [
            'merchant' => $merchant,
            'merchantStats' => $merchantStats,
        ]);
    }

    public function approveMerchant(Merchant $merchant)
    {
        $merchant->approve(auth()->user());

        return back()->with('success', 'Merchant approved successfully.');
    }

    public function suspendMerchant(Merchant $merchant, Request $request)
    {
        $request->validate([
            'reason' => 'nullable|string|max:1000',
        ]);

        $merchant->suspend($request->reason);

        return back()->with('success', 'Merchant suspended successfully.');
    }

    public function rejectMerchant(Merchant $merchant, Request $request)
    {
        $request->validate([
            'reason' => 'required|string|max:1000',
        ]);

        $merchant->reject($request->reason);

        return back()->with('success', 'Merchant rejected successfully.');
    }

    public function reactivateMerchant(Merchant $merchant)
    {
        $merchant->reactivate();

        return back()->with('success', 'Merchant reactivated successfully.');
    }

    public function createMerchantForm()
    {
        return Inertia::render('Admin/Merchants/Create');
    }

    public function storeMerchant(Request $request)
    {
        $request->validate([
            // User information
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8|confirmed',

            // Merchant business information
            'business_name' => 'required|string|max:255',
            'business_type' => 'required|string|in:sole_proprietorship,partnership,llc,corporation,other',
            'phone' => 'required|string|max:20',
            'business_address' => 'required|string|max:500',
            'tax_id' => 'nullable|string|max:50',

            // Banking information (optional)
            'bank_name' => 'nullable|string|max:255',
            'account_holder_name' => 'nullable|string|max:255',
            'account_number' => 'nullable|string|max:255',
            'routing_number' => 'nullable|string|max:255',

            // Status
            'status' => 'required|string|in:pending,approved,suspended,rejected',
        ]);

        try {
            // Create user account
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => bcrypt($request->password),
                'role' => 'merchant',
                'email_verified_at' => now(), // Admin-created accounts are auto-verified
            ]);

            // Create merchant profile
            $merchantData = [
                'user_id' => $user->id,
                'business_name' => $request->business_name,
                'business_type' => $request->business_type,
                'phone' => $request->phone,
                'business_address' => $request->business_address,
                'tax_id' => $request->tax_id,
                'status' => $request->status,
            ];

            // Add banking information if provided
            if ($request->filled('bank_name')) {
                $merchantData['bank_name'] = $request->bank_name;
                $merchantData['account_holder_name'] = $request->account_holder_name;
                $merchantData['account_number'] = $request->account_number;
                $merchantData['routing_number'] = $request->routing_number;
            }

            // Set approval fields if status is approved
            if ($request->status === 'approved') {
                $merchantData['approved_at'] = now();
                $merchantData['approved_by'] = auth()->id();
            }

            $merchant = Merchant::create($merchantData);

            return redirect()
                ->route('admin.merchants.show', $merchant)
                ->with('success', 'Merchant account created successfully.');

        } catch (\Exception $e) {
            return back()
                ->withInput()
                ->with('error', 'Failed to create merchant account: '.$e->getMessage());
        }
    }

    public function stores(Request $request)
    {
        $query = Store::with(['user', 'products']);

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Search by name or description
        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                    ->orWhere('description', 'like', "%{$request->search}%");
            });
        }

        $stores = $query->withCount(['products', 'orderItems'])
            ->latest()
            ->paginate(20);

        return Inertia::render('Admin/Stores/Index', [
            'stores' => $stores,
            'filters' => $request->only(['status', 'search']),
        ]);
    }

    public function approveStore(Store $store)
    {
        $store->update(['status' => 'approved']);

        return back()->with('success', 'Store approved successfully.');
    }

    public function suspendStore(Store $store)
    {
        $store->update(['status' => 'suspended']);

        return back()->with('success', 'Store suspended successfully.');
    }

    public function orders(Request $request)
    {
        $query = Order::with(['user', 'orderItems.product', 'payment']);

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter by date range
        if ($request->filled('start_date')) {
            $query->whereDate('created_at', '>=', $request->start_date);
        }
        if ($request->filled('end_date')) {
            $query->whereDate('created_at', '<=', $request->end_date);
        }

        // Search by order number or user
        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('order_number', 'like', "%{$request->search}%")
                    ->orWhereHas('user', function ($userQuery) use ($request) {
                        $userQuery->where('name', 'like', "%{$request->search}%")
                            ->orWhere('email', 'like', "%{$request->search}%");
                    });
            });
        }

        $orders = $query->latest()
            ->paginate(20);

        return Inertia::render('Admin/Orders/Index', [
            'orders' => $orders,
            'filters' => $request->only(['status', 'start_date', 'end_date', 'search']),
        ]);
    }

    public function analytics(Request $request)
    {
        $dateRange = $this->getDateRange($request);
        $analytics = $this->getPlatformAnalytics($dateRange);

        return Inertia::render('Admin/Analytics', [
            'analytics' => $analytics,
            'dateRange' => [
                'start' => $dateRange['start']->format('Y-m-d'),
                'end' => $dateRange['end']->format('Y-m-d'),
            ],
        ]);
    }

    public function categories()
    {
        $categories = Category::withCount(['products'])
            ->latest()
            ->paginate(20);

        return Inertia::render('Admin/Categories/Index', [
            'categories' => $categories,
        ]);
    }

    public function createCategoryForm()
    {
        return Inertia::render('Admin/Categories/Create');
    }

    public function storeCategory(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:categories,name',
            'description' => 'nullable|string|max:1000',
            'is_active' => 'boolean',
        ]);

        try {
            $category = Category::create([
                'name' => $request->name,
                'description' => $request->description,
                'is_active' => $request->get('is_active', true),
            ]);

            return redirect()
                ->route('admin.categories')
                ->with('success', 'Category created successfully.');

        } catch (\Exception $e) {
            return back()
                ->withInput()
                ->with('error', 'Failed to create category: '.$e->getMessage());
        }
    }

    public function editCategoryForm(Category $category)
    {
        return Inertia::render('Admin/Categories/Edit', [
            'category' => $category,
        ]);
    }

    public function updateCategory(Request $request, Category $category)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:categories,name,'.$category->id,
            'description' => 'nullable|string|max:1000',
            'is_active' => 'boolean',
        ]);

        try {
            $category->update([
                'name' => $request->name,
                'slug' => \Illuminate\Support\Str::slug($request->name), // Update slug if name changes
                'description' => $request->description,
                'is_active' => $request->get('is_active', true),
            ]);

            return redirect()
                ->route('admin.categories')
                ->with('success', 'Category updated successfully.');

        } catch (\Exception $e) {
            return back()
                ->withInput()
                ->with('error', 'Failed to update category: '.$e->getMessage());
        }
    }

    public function deleteCategory(Category $category)
    {
        try {
            // Check if category has products
            if ($category->products()->count() > 0) {
                return back()->with('error', 'Cannot delete category that has products. Please reassign products first.');
            }

            // Check if category is used by stores
            if ($category->stores()->count() > 0) {
                return back()->with('error', 'Cannot delete category that is used by stores. Please reassign stores first.');
            }

            $category->delete();

            return redirect()
                ->route('admin.categories')
                ->with('success', 'Category deleted successfully.');

        } catch (\Exception $e) {
            return back()->with('error', 'Failed to delete category: '.$e->getMessage());
        }
    }

    public function payments(Request $request)
    {
        $query = Payment::with(['order.user']);

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter by date range
        if ($request->filled('start_date')) {
            $query->whereDate('created_at', '>=', $request->start_date);
        }
        if ($request->filled('end_date')) {
            $query->whereDate('created_at', '<=', $request->end_date);
        }

        $payments = $query->latest()
            ->paginate(20);

        $paymentStats = [
            'total_payments' => Payment::count(),
            'completed_payments' => Payment::where('status', 'completed')->count(),
            'failed_payments' => Payment::where('status', 'failed')->count(),
            'total_revenue' => Payment::where('status', 'completed')->sum('amount'),
        ];

        return Inertia::render('Admin/Payments/Index', [
            'payments' => $payments,
            'paymentStats' => $paymentStats,
            'filters' => $request->only(['status', 'start_date', 'end_date']),
        ]);
    }

    private function getPlatformStats(): array
    {
        $currentMonth = Carbon::now()->startOfMonth();
        $previousMonth = Carbon::now()->subMonth()->startOfMonth();

        // User stats
        $totalUsers = User::count();
        $merchantsCount = User::where('role', 'merchant')->count();
        $buyersCount = User::where('role', 'buyer')->count();
        $adminCount = User::where('role', 'admin')->count();
        $newUsersThisMonth = User::where('created_at', '>=', $currentMonth)->count();

        // Store stats
        $totalStores = Store::count();
        $activeStores = Store::where('status', 'approved')->count();
        $pendingStores = Store::where('status', 'pending')->count();
        $suspendedStores = Store::where('status', 'suspended')->count();

        // Product stats
        $totalProducts = Product::count();
        $publishedProducts = Product::where('status', 'published')->count();
        $lowStockProducts = Product::where('quantity', '<=', 5)
            ->where('digital_product', false)
            ->count();

        // Order stats
        $totalOrders = Order::count();
        $ordersThisMonth = Order::where('created_at', '>=', $currentMonth)->count();
        $ordersLastMonth = Order::whereBetween('created_at', [
            $previousMonth,
            $previousMonth->copy()->endOfMonth(),
        ])->count();

        // Revenue stats
        $totalRevenue = OrderItem::whereHas('order', function ($query) {
            $query->whereIn('status', ['processing', 'completed']);
        })->sum('total_price');

        $revenueThisMonth = OrderItem::whereHas('order', function ($query) use ($currentMonth) {
            $query->whereIn('status', ['processing', 'completed'])
                ->where('created_at', '>=', $currentMonth);
        })->sum('total_price');

        $revenueLastMonth = OrderItem::whereHas('order', function ($query) use ($previousMonth) {
            $query->whereIn('status', ['processing', 'completed'])
                ->whereBetween('created_at', [
                    $previousMonth,
                    $previousMonth->copy()->endOfMonth(),
                ]);
        })->sum('total_price');

        // Payment stats
        $completedPayments = Payment::where('status', 'completed')->count();
        $failedPayments = Payment::where('status', 'failed')->count();
        $totalPayments = $completedPayments + $failedPayments;
        $paymentSuccessRate = $totalPayments > 0
            ? ($completedPayments / $totalPayments) * 100
            : 0;

        // Recent activities
        $recentOrders = Order::with(['user', 'orderItems'])
            ->latest()
            ->limit(5)
            ->get();

        $recentUsers = User::latest()
            ->limit(5)
            ->get();

        $recentStores = Store::with(['user'])
            ->latest()
            ->limit(5)
            ->get();

        return [
            'users' => [
                'total' => $totalUsers,
                'merchants' => $merchantsCount,
                'buyers' => $buyersCount,
                'admins' => $adminCount,
                'new_this_month' => $newUsersThisMonth,
            ],
            'stores' => [
                'total' => $totalStores,
                'approved' => $activeStores,
                'pending' => $pendingStores,
                'suspended' => $suspendedStores,
            ],
            'products' => [
                'total' => $totalProducts,
                'published' => $publishedProducts,
                'low_stock' => $lowStockProducts,
            ],
            'orders' => [
                'total' => $totalOrders,
                'this_month' => $ordersThisMonth,
                'last_month' => $ordersLastMonth,
                'growth_percentage' => $ordersLastMonth > 0
                    ? (($ordersThisMonth - $ordersLastMonth) / $ordersLastMonth) * 100
                    : 0,
            ],
            'revenue' => [
                'total' => $totalRevenue,
                'this_month' => $revenueThisMonth,
                'last_month' => $revenueLastMonth,
                'growth_percentage' => $revenueLastMonth > 0
                    ? (($revenueThisMonth - $revenueLastMonth) / $revenueLastMonth) * 100
                    : 0,
            ],
            'payments' => [
                'completed' => $completedPayments,
                'failed' => $failedPayments,
                'success_rate' => round($paymentSuccessRate, 2),
            ],
            'recent_activities' => [
                'orders' => $recentOrders,
                'users' => $recentUsers,
                'stores' => $recentStores,
            ],
        ];
    }

    private function getPlatformAnalytics(array $dateRange): array
    {
        $startDate = $dateRange['start'];
        $endDate = $dateRange['end'];

        // Daily metrics
        $dailyStats = Order::selectRaw('
                DATE(created_at) as date,
                COUNT(*) as orders_count,
                COUNT(DISTINCT user_id) as unique_customers
            ')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->keyBy('date');

        $dailyRevenue = OrderItem::join('orders', 'order_items.order_id', '=', 'orders.id')
            ->selectRaw('
                DATE(orders.created_at) as date,
                SUM(order_items.total_price) as revenue
            ')
            ->whereBetween('orders.created_at', [$startDate, $endDate])
            ->whereIn('orders.status', ['processing', 'completed'])
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->keyBy('date');

        // Fill missing dates
        $analytics = collect();
        $current = $startDate->copy();
        while ($current->lte($endDate)) {
            $dateKey = $current->format('Y-m-d');
            $analytics->put($dateKey, [
                'date' => $dateKey,
                'orders' => $dailyStats->get($dateKey)?->orders_count ?? 0,
                'customers' => $dailyStats->get($dateKey)?->unique_customers ?? 0,
                'revenue' => $dailyRevenue->get($dateKey)?->revenue ?? 0,
            ]);
            $current->addDay();
        }

        // Top performing stores
        $topStores = Store::select('stores.*')
            ->selectRaw('SUM(order_items.total_price) as total_revenue')
            ->selectRaw('COUNT(DISTINCT orders.id) as total_orders')
            ->join('order_items', 'stores.id', '=', 'order_items.store_id')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->whereBetween('orders.created_at', [$startDate, $endDate])
            ->whereIn('orders.status', ['processing', 'completed'])
            ->groupBy('stores.id', 'stores.name', 'stores.slug', 'stores.description', 'stores.logo', 'stores.status', 'stores.user_id', 'stores.created_at', 'stores.updated_at')
            ->orderByDesc('total_revenue')
            ->limit(10)
            ->get();

        // Category performance
        $categoryStats = Category::select('categories.*')
            ->selectRaw('COUNT(DISTINCT products.id) as products_count')
            ->selectRaw('SUM(order_items.total_price) as revenue')
            ->selectRaw('SUM(order_items.quantity) as units_sold')
            ->leftJoin('products', 'categories.id', '=', 'products.category_id')
            ->leftJoin('order_items', 'products.id', '=', 'order_items.product_id')
            ->leftJoin('orders', 'order_items.order_id', '=', 'orders.id')
            ->whereBetween('orders.created_at', [$startDate, $endDate])
            ->whereIn('orders.status', ['processing', 'completed'])
            ->groupBy('categories.id', 'categories.name', 'categories.slug', 'categories.description', 'categories.created_at', 'categories.updated_at')
            ->orderByDesc('revenue')
            ->get();

        return [
            'daily_data' => $analytics->values(),
            'top_stores' => $topStores,
            'category_performance' => $categoryStats,
            'summary' => [
                'total_revenue' => $analytics->sum('revenue'),
                'total_orders' => $analytics->sum('orders'),
                'total_customers' => $analytics->sum('customers'),
                'average_daily_revenue' => $analytics->avg('revenue'),
            ],
        ];
    }

    private function getDateRange(Request $request): array
    {
        $start = $request->input('start_date')
            ? Carbon::parse($request->input('start_date'))->startOfDay()
            : Carbon::now()->startOfMonth();

        $end = $request->input('end_date')
            ? Carbon::parse($request->input('end_date'))->endOfDay()
            : Carbon::now()->endOfMonth();

        return [
            'start' => $start,
            'end' => $end,
        ];
    }

    /**
     * File Management Dashboard
     */
    public function files(Request $request)
    {
        // Get storage statistics
        $publicStorageSize = $this->getDirectorySize(storage_path('app/public'));
        $privateStorageSize = $this->getDirectorySize(storage_path('app/private'));

        // Get file counts and types
        $imageFiles = Product::whereNotNull('images')
            ->get()
            ->flatMap(fn ($product) => $product->images ?? [])
            ->count();

        $digitalFiles = Product::whereNotNull('digital_files')
            ->get()
            ->flatMap(fn ($product) => $product->digital_files ?? [])
            ->count();

        // Get recent uploads (products with recent images/files)
        $recentUploads = Product::where('updated_at', '>=', now()->subDays(7))
            ->where(function ($query) {
                $query->whereNotNull('images')
                    ->orWhereNotNull('digital_files');
            })
            ->with(['store.user'])
            ->orderBy('updated_at', 'desc')
            ->take(20)
            ->get();

        // Get storage usage by store
        $storageByStore = Product::with('store')
            ->get()
            ->groupBy('store_id')
            ->map(function ($products) {
                $imageCount = $products->sum(function ($product) {
                    return count($product->images ?? []);
                });
                $fileCount = $products->sum(function ($product) {
                    return count($product->digital_files ?? []);
                });

                return [
                    'store' => $products->first()->store,
                    'image_count' => $imageCount,
                    'file_count' => $fileCount,
                    'total_files' => $imageCount + $fileCount,
                ];
            })
            ->sortByDesc('total_files')
            ->take(10);

        return Inertia::render('Admin/Files/Index', [
            'storage_stats' => [
                'public_size' => $this->formatBytes($publicStorageSize),
                'private_size' => $this->formatBytes($privateStorageSize),
                'total_size' => $this->formatBytes($publicStorageSize + $privateStorageSize),
                'image_files' => $imageFiles,
                'digital_files' => $digitalFiles,
                'total_files' => $imageFiles + $digitalFiles,
            ],
            'recent_uploads' => $recentUploads,
            'storage_by_store' => $storageByStore->values(),
            'filters' => [
                'search' => $request->search,
                'type' => $request->type,
            ],
        ]);
    }

    /**
     * Clean up orphaned files
     */
    public function cleanupFiles(Request $request)
    {
        $deletedCount = 0;
        $errors = [];

        try {
            // Get all referenced images and digital files from products
            $referencedImages = Product::whereNotNull('images')
                ->get()
                ->flatMap(fn ($product) => $product->images ?? [])
                ->map(fn ($url) => str_replace(Storage::disk('public')->url(''), '', $url))
                ->toArray();

            $referencedFiles = Product::whereNotNull('digital_files')
                ->get()
                ->flatMap(fn ($product) => $product->digital_files ?? [])
                ->pluck('path')
                ->toArray();

            // Scan public storage for orphaned images
            $allImages = collect(Storage::disk('public')->allFiles('products'))
                ->filter(fn ($file) => ! in_array($file, $referencedImages));

            foreach ($allImages as $file) {
                if (Storage::disk('public')->delete($file)) {
                    $deletedCount++;
                }
            }

            // Scan private storage for orphaned digital files
            $allFiles = collect(Storage::disk('local')->allFiles('digital'))
                ->filter(fn ($file) => ! in_array($file, $referencedFiles));

            foreach ($allFiles as $file) {
                if (Storage::disk('local')->delete($file)) {
                    $deletedCount++;
                }
            }

        } catch (\Exception $e) {
            $errors[] = $e->getMessage();
        }

        if (count($errors) > 0) {
            return back()->with('error', 'File cleanup completed with errors: '.implode(', ', $errors));
        }

        return back()->with('success', "File cleanup completed. Deleted {$deletedCount} orphaned files.");
    }

    /**
     * Get directory size in bytes
     */
    private function getDirectorySize(string $directory): int
    {
        $size = 0;
        if (is_dir($directory)) {
            foreach (new \RecursiveIteratorIterator(new \RecursiveDirectoryIterator($directory)) as $file) {
                if ($file->isFile()) {
                    $size += $file->getSize();
                }
            }
        }

        return $size;
    }

    /**
     * Format bytes to human readable format
     */
    private function formatBytes(int $bytes): string
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];

        for ($i = 0; $bytes > 1024 && $i < 4; $i++) {
            $bytes /= 1024;
        }

        return round($bytes, 2).' '.$units[$i];
    }
}
