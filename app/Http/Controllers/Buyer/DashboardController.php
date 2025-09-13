<?php

namespace App\Http\Controllers\Buyer;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $recentOrders = Order::where('user_id', $user->id)
            ->with(['orderItems.product', 'orderItems.store'])
            ->latest()
            ->limit(5)
            ->get();

        $totalOrders = Order::where('user_id', $user->id)->count();
        $pendingOrders = Order::where('user_id', $user->id)->where('status', 'pending')->count();
        $completedOrders = Order::where('user_id', $user->id)->where('status', 'completed')->count();
        $totalSpent = Order::where('user_id', $user->id)
            ->where('status', 'completed')
            ->sum('total_amount');

        $featuredProducts = Product::published()
            ->with(['store', 'category'])
            ->inRandomOrder()
            ->limit(6)
            ->get();

        return Inertia::render('Buyer/Dashboard', [
            'user' => $user,
            'stats' => [
                'total_orders' => $totalOrders,
                'pending_orders' => $pendingOrders,
                'completed_orders' => $completedOrders,
                'total_spent' => $totalSpent,
            ],
            'recent_orders' => $recentOrders,
            'featured_products' => $featuredProducts,
        ]);
    }
}
