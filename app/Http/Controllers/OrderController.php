<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $orders = Order::where('user_id', $request->user()->id)
            ->with(['orderItems.product', 'orderItems.store'])
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return Inertia::render('Orders/Index', [
            'orders' => $orders,
        ]);
    }

    public function show(Order $order)
    {
        $this->authorize('view', $order);

        $order->load(['orderItems.product', 'orderItems.store', 'payment']);

        return Inertia::render('Orders/Show', [
            'order' => $order,
        ]);
    }

    public function checkout(Request $request)
    {
        $cartItems = Cart::where('user_id', $request->user()->id)
            ->with(['product.store'])
            ->get();

        if ($cartItems->isEmpty()) {
            return redirect()->route('cart.index')
                ->with('error', 'Your cart is empty.');
        }

        // Group by store for separate order items
        $storeGroups = $cartItems->groupBy('product.store_id');
        $totalAmount = $cartItems->sum('total_price');

        // Get user's last billing info from most recent order
        $lastOrder = Order::where('user_id', $request->user()->id)
            ->whereNotNull('billing_info')
            ->latest()
            ->first();

        $defaultBillingInfo = $lastOrder?->billing_info ?? [];

        return Inertia::render('Checkout/Index', [
            'cartItems' => $cartItems,
            'storeGroups' => $storeGroups,
            'totalAmount' => $totalAmount,
            'formattedTotal' => '₱'.number_format($totalAmount / 100, 2),
            'defaultBillingInfo' => $defaultBillingInfo,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'billing_name' => ['required', 'string', 'max:255'],
            'billing_email' => ['required', 'email', 'max:255'],
            'billing_address' => ['required', 'string', 'max:500'],
            'billing_city' => ['required', 'string', 'max:100'],
            'billing_postal_code' => ['required', 'string', 'max:20'],
            'billing_country' => ['required', 'string', 'max:100'],
        ]);

        $cartItems = Cart::where('user_id', $request->user()->id)
            ->with(['product'])
            ->get();

        if ($cartItems->isEmpty()) {
            return redirect()->route('cart.index')
                ->with('error', 'Your cart is empty.');
        }

        // Validate stock availability
        foreach ($cartItems as $cartItem) {
            if (! $cartItem->product->isPublished()) {
                return back()->with('error', "Product '{$cartItem->product->name}' is no longer available.");
            }

            if (! $cartItem->product->digital_product && $cartItem->quantity > $cartItem->product->quantity) {
                return back()->with('error', "Not enough stock for '{$cartItem->product->name}'.");
            }
        }

        return DB::transaction(function () use ($request, $cartItems) {
            $totalAmount = $cartItems->sum('total_price');

            // Check for recent duplicate orders (within last 30 seconds)
            $recentOrder = Order::where('user_id', $request->user()->id)
                ->where('status', 'pending')
                ->where('total_amount', $totalAmount)
                ->where('created_at', '>', now()->subSeconds(30))
                ->first();

            if ($recentOrder) {
                // Return existing order instead of creating duplicate
                return redirect()->route('payment.create-session', ['order' => $recentOrder->id]);
            }

            // Create main order
            $order = Order::create([
                'user_id' => $request->user()->id,
                'order_number' => 'ORD-'.strtoupper(uniqid()),
                'status' => 'pending',
                'subtotal' => $totalAmount,
                'total_amount' => $totalAmount,
                'billing_info' => [
                    'name' => $request->billing_name,
                    'email' => $request->billing_email,
                    'address' => $request->billing_address,
                    'city' => $request->billing_city,
                    'postal_code' => $request->billing_postal_code,
                    'country' => $request->billing_country,
                ],
            ]);

            // Create order items for each cart item
            foreach ($cartItems as $cartItem) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $cartItem->product_id,
                    'store_id' => $cartItem->product->store_id,
                    'product_name' => $cartItem->product->name,
                    'product_price' => $cartItem->product->price,
                    'quantity' => $cartItem->quantity,
                    'total_price' => $cartItem->total_price,
                ]);

                // Update product stock for physical products
                if (! $cartItem->product->digital_product) {
                    $cartItem->product->decrement('quantity', $cartItem->quantity);
                }
            }

            // Create payment record
            Payment::create([
                'order_id' => $order->id,
                'amount' => $totalAmount / 100, // Convert centavos to pesos
                'currency' => 'PHP',
                'status' => 'pending',
            ]);

            // Redirect to payment session creation (cart will be cleared after successful payment creation)
            return redirect()->route('payment.create-session', ['order' => $order->id]);
        });
    }

    public function cancel(Order $order)
    {
        $this->authorize('update', $order);

        if ($order->status !== 'pending') {
            return back()->with('error', 'Only pending orders can be cancelled.');
        }

        return DB::transaction(function () use ($order) {
            // Restore stock for physical products
            foreach ($order->orderItems as $orderItem) {
                if (! $orderItem->product->digital_product) {
                    $orderItem->product->increment('quantity', $orderItem->quantity);
                }
            }

            $order->update(['status' => 'cancelled']);

            return back()->with('success', 'Order cancelled successfully.');
        });
    }

    public function destroy(Order $order)
    {
        $this->authorize('delete', $order);

        if ($order->status !== 'pending') {
            return back()->with('error', 'Only pending orders can be deleted.');
        }

        return DB::transaction(function () use ($order) {
            // Restore stock for physical products
            foreach ($order->orderItems as $orderItem) {
                if ($orderItem->product && ! $orderItem->product->digital_product) {
                    $orderItem->product->increment('quantity', $orderItem->quantity);
                }
            }

            // Delete related records first to avoid foreign key constraints
            if ($order->payment) {
                $order->payment->delete();
            }

            // Delete order items
            $order->orderItems()->delete();

            // Delete the order
            $order->delete();

            return redirect()->route('orders.index')
                ->with('success', 'Order deleted successfully.');
        });
    }
}
