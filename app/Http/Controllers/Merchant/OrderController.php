<?php

namespace App\Http\Controllers\Merchant;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OrderController extends Controller
{
    use \Illuminate\Foundation\Auth\Access\AuthorizesRequests;

    public function index(Request $request)
    {
        $user = $request->user();

        if (! $user->hasApprovedMerchant()) {
            return redirect()->route('merchant.dashboard')
                ->with('error', 'You need an approved merchant account to view orders.');
        }

        $store = $user->merchant->store;

        if (! $store) {
            return redirect()->route('merchant.store.create');
        }

        // Get orders that contain items from this merchant's store
        $orders = Order::whereHas('orderItems', function ($query) use ($store) {
            $query->where('store_id', $store->id);
        })
            ->with([
                'user:id,name,email',
                'orderItems' => function ($query) use ($store) {
                    $query->where('store_id', $store->id)
                        ->with('product:id,name,slug');
                },
            ])
            ->when($request->status, function ($query, $status) {
                $query->where('status', $status);
            })
            ->when($request->search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('order_number', 'like', "%{$search}%")
                        ->orWhereHas('user', function ($userQuery) use ($search) {
                            $userQuery->where('name', 'like', "%{$search}%")
                                ->orWhere('email', 'like', "%{$search}%");
                        });
                });
            })
            ->orderBy('created_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        // Calculate totals for this store from each order
        $orders->getCollection()->transform(function ($order) use ($store) {
            $storeItems = $order->orderItems->where('store_id', $store->id);
            $order->store_total = $storeItems->sum('total_price');
            $order->store_items_count = $storeItems->count();

            return $order;
        });

        return Inertia::render('Merchant/Orders/Index', [
            'orders' => $orders,
            'filters' => [
                'search' => $request->search,
                'status' => $request->status,
            ],
            'statusOptions' => [
                'pending' => 'Pending',
                'processing' => 'Processing',
                'completed' => 'Completed',
                'cancelled' => 'Cancelled',
                'refunded' => 'Refunded',
            ],
        ]);
    }

    public function show(Request $request, Order $order)
    {
        $user = $request->user();
        $store = $user->merchant->store;

        // Check if this order contains items from merchant's store
        $hasStoreItems = $order->orderItems()->where('store_id', $store->id)->exists();

        if (! $hasStoreItems) {
            abort(404, 'Order not found');
        }

        $order->load([
            'user:id,name,email',
            'orderItems' => function ($query) use ($store) {
                $query->where('store_id', $store->id)
                    ->with('product:id,name,slug,images');
            },
        ]);

        return Inertia::render('Merchant/Orders/Show', [
            'order' => $order,
        ]);
    }
}
