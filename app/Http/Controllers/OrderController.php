<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\DraftPolicyApplication;
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

        // Check for existing draft
        $draft = DraftPolicyApplication::forUser($request->user())
            ->incomplete()
            ->recent()
            ->first();

        $draftData = null;
        if ($draft && ! $draft->isExpired()) {
            $draftData = [
                'id' => $draft->id,
                'current_step' => $draft->current_step,
                'form_data' => $draft->form_data,
                'last_accessed_at' => $draft->last_accessed_at->format('M j, Y g:i A'),
            ];
        }

        return Inertia::render('Checkout/Index', [
            'cartItems' => $cartItems,
            'storeGroups' => $storeGroups,
            'totalAmount' => $totalAmount,
            'formattedTotal' => '₱'.number_format($totalAmount / 100, 2),
            'defaultBillingInfo' => $defaultBillingInfo,
            'draftData' => $draftData,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            // Application Type
            'application_type' => ['required', 'in:new,renewal'],
            'existing_policy_number' => ['required_if:application_type,renewal', 'nullable', 'string', 'max:100'],

            // Applicant's Information - Name
            'last_name' => ['required', 'string', 'max:100'],
            'first_name' => ['required', 'string', 'max:100'],
            'middle_name' => ['nullable', 'string', 'max:100'],
            'suffix' => ['nullable', 'string', 'max:20'],

            // Mailing Address
            'block_lot_phase_floor_unit' => ['nullable', 'string', 'max:200'],
            'street' => ['required', 'string', 'max:200'],
            'village_subdivision_condo' => ['nullable', 'string', 'max:200'],
            'barangay' => ['required', 'string', 'max:100'],
            'city_municipality' => ['required', 'string', 'max:100'],
            'province_state' => ['required', 'string', 'max:100'],
            'zip_code' => ['required', 'string', 'max:20'],

            // Contact & Personal Info
            'mobile_no' => ['required', 'string', 'max:20'],
            'email_address' => ['required', 'email', 'max:255'],
            'tin_sss_gsis_no' => ['nullable', 'string', 'max:50'],
            'gender' => ['required', 'in:male,female'],
            'civil_status' => ['required', 'in:single,married'],
            'date_of_birth' => ['required', 'date'],
            'place_of_birth' => ['required', 'string', 'max:200'],
            'citizenship_nationality' => ['required', 'string', 'max:100'],
            'source_of_funds' => ['required', 'in:self_employed,salary'],

            // Employment Information
            'name_of_employer_business' => ['nullable', 'string', 'max:255'],
            'occupation' => ['required', 'string', 'max:200'],
            'occupational_classification' => ['required', 'in:class_1,class_2,class_3,class_4'],
            'nature_of_employment_business' => ['nullable', 'string', 'max:300'],
            'employer_business_address' => ['nullable', 'string', 'max:500'],

            // Choice of Plan
            'choice_of_plan' => ['required', 'in:class_i,class_ii,class_iii'],

            // Agreement and Privacy
            'agreement_accepted' => ['required', 'accepted'],
            'data_privacy_consent' => ['required', 'accepted'],
        ]);

        // Additional validation for Class II and III plans
        if (in_array($request->choice_of_plan, ['class_ii', 'class_iii'])) {
            $request->validate([
                'family_members' => ['required', 'array', 'min:1'],
                'family_members.*.relationship' => ['required', 'in:spouse,parent'],
                'family_members.*.last_name' => ['required', 'string', 'max:100'],
                'family_members.*.first_name' => ['required', 'string', 'max:100'],
                'family_members.*.middle_name' => ['nullable', 'string', 'max:100'],
                'family_members.*.suffix' => ['nullable', 'string', 'max:20'],
                'family_members.*.gender' => ['nullable', 'in:male,female'],
                'family_members.*.date_of_birth' => ['required', 'date'],
                'family_members.*.occupation_education' => ['nullable', 'string', 'max:200'],
            ]);
        }

        if ($request->choice_of_plan === 'class_iii') {
            $request->validate([
                'children_siblings' => ['required', 'array', 'min:1'],
                'children_siblings.*.full_name' => ['required', 'string', 'max:200'],
                'children_siblings.*.relationship' => ['required', 'in:child,sibling'],
                'children_siblings.*.date_of_birth' => ['required', 'date'],
                'children_siblings.*.occupation_education' => ['nullable', 'string', 'max:200'],
            ]);
        }

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

            // Create main order with PA insurance application data
            $order = Order::create([
                'user_id' => $request->user()->id,
                'order_number' => 'ORD-'.strtoupper(uniqid()),
                'status' => 'pending',
                'subtotal' => $totalAmount,
                'total_amount' => $totalAmount,
                'billing_info' => [
                    // Application Type
                    'application_type' => $request->application_type,
                    'existing_policy_number' => $request->existing_policy_number,

                    // Applicant's Information - Name
                    'last_name' => $request->last_name,
                    'first_name' => $request->first_name,
                    'middle_name' => $request->middle_name,
                    'suffix' => $request->suffix,

                    // Mailing Address
                    'block_lot_phase_floor_unit' => $request->block_lot_phase_floor_unit,
                    'street' => $request->street,
                    'village_subdivision_condo' => $request->village_subdivision_condo,
                    'barangay' => $request->barangay,
                    'city_municipality' => $request->city_municipality,
                    'province_state' => $request->province_state,
                    'zip_code' => $request->zip_code,

                    // Contact & Personal Info
                    'mobile_no' => $request->mobile_no,
                    'email_address' => $request->email_address,
                    'tin_sss_gsis_no' => $request->tin_sss_gsis_no,
                    'gender' => $request->gender,
                    'civil_status' => $request->civil_status,
                    'date_of_birth' => $request->date_of_birth,
                    'place_of_birth' => $request->place_of_birth,
                    'citizenship_nationality' => $request->citizenship_nationality,
                    'source_of_funds' => $request->source_of_funds,

                    // Employment Information
                    'name_of_employer_business' => $request->name_of_employer_business,
                    'occupation' => $request->occupation,
                    'occupational_classification' => $request->occupational_classification,
                    'nature_of_employment_business' => $request->nature_of_employment_business,
                    'employer_business_address' => $request->employer_business_address,

                    // Choice of Plan
                    'choice_of_plan' => $request->choice_of_plan,

                    // Agreement and Privacy
                    'agreement_accepted' => $request->agreement_accepted,
                    'data_privacy_consent' => $request->data_privacy_consent,

                    // Family member data for Class II and III
                    'family_members' => $request->family_members ?? [],
                    'children_siblings' => $request->children_siblings ?? [],

                    // Keep legacy fields for backward compatibility
                    'name' => $request->first_name.' '.$request->last_name,
                    'email' => $request->email_address,
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

            // Mark any existing draft as completed
            $draft = DraftPolicyApplication::forUser($request->user())
                ->incomplete()
                ->recent()
                ->first();

            if ($draft) {
                $draft->markAsCompleted();
            }

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
