<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\Order;
use App\Models\Payment;
use App\Services\MagpieService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller
{
    private MagpieService $magpieService;

    public function __construct(MagpieService $magpieService)
    {
        $this->magpieService = $magpieService;
    }

    /**
     * Create a new payment session
     */
    public function createSession(Request $request, Order $order)
    {
        $this->authorize('update', $order);

        if ($order->status !== 'pending') {
            return back()->with('error', 'Only pending orders can be paid.');
        }

        try {
            // Build line items from order items
            $lineItems = [];
            foreach ($order->orderItems as $orderItem) {
                $lineItems[] = [
                    'name' => $orderItem->product_name,
                    'amount' => $orderItem->product_price, // Amount in centavos
                    'description' => $orderItem->product_name,
                    'quantity' => $orderItem->quantity,
                    'image' => $orderItem->product->images[0] ?? null,
                ];
            }

            // Create checkout session
            $sessionData = [
                'line_items' => $lineItems,
                'success_url' => route('payment.success', ['order' => $order->id]),
                'cancel_url' => route('payment.cancel', ['order' => $order->id]),
                'customer_email' => $order->billing_info['email'] ?? $order->user->email,
                'customer_name' => $order->billing_info['name'] ?? $order->user->name,
                'description' => "Order #{$order->order_number}",
                'client_reference_id' => $order->order_number,
                'metadata' => [
                    'order_id' => $order->id,
                    'payment_id' => $order->payment?->id,
                ],
            ];

            $response = $this->magpieService->createCheckoutSession($sessionData);

            // Update payment record with session details
            if ($order->payment) {
                $order->payment->update([
                    'magpie_transaction_id' => $response['id'] ?? null,
                    'magpie_response' => $response,
                    'status' => 'pending',
                ]);
            }

            // Check if we got the payment_url
            if (isset($response['payment_url'])) {
                // Clear cart only after successful payment session creation
                Cart::where('user_id', $order->user_id)->delete();

                // Force a full page redirect (not an Inertia redirect)
                return redirect()->away($response['payment_url']);
            }

            // Fallback error
            return back()->with('error', 'Payment session created but no payment URL received.');

        } catch (\Exception $e) {
            Log::error('Payment session creation failed', [
                'order_id' => $order->id,
                'error' => $e->getMessage(),
            ]);

            // If payment session creation failed, restore cart items from order
            $this->restoreCartFromOrder($order);

            return back()->with('error', 'Failed to create payment session. Your cart has been restored.');
        }
    }

    /**
     * Restore cart items from a failed order
     */
    private function restoreCartFromOrder(Order $order): void
    {
        try {
            foreach ($order->orderItems as $orderItem) {
                if ($orderItem->product) {
                    // Use updateOrCreate to handle duplicate cart items
                    Cart::updateOrCreate(
                        [
                            'user_id' => $order->user_id,
                            'product_id' => $orderItem->product_id,
                        ],
                        [
                            'quantity' => $orderItem->quantity,
                            'total_price' => $orderItem->total_price,
                        ]
                    );

                    // Restore stock for physical products
                    if (! $orderItem->product->digital_product) {
                        $orderItem->product->increment('quantity', $orderItem->quantity);
                    }
                }
            }

            // Delete the failed order and its items
            DB::transaction(function () use ($order) {
                if ($order->payment) {
                    $order->payment->delete();
                }
                $order->orderItems()->delete();
                $order->delete();
            });

        } catch (\Exception $e) {
            Log::error('Failed to restore cart from order', [
                'order_id' => $order->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    public function success(Request $request, Order $order)
    {
        $this->authorize('view', $order);

        try {
            $payment = $order->payment;

            if (! $payment) {
                return redirect()->route('orders.show', $order)
                    ->with('error', 'Payment record not found.');
            }

            // Update payment status
            DB::transaction(function () use ($order, $payment) {
                $payment->update([
                    'status' => 'completed',
                    'processed_at' => now(),
                ]);

                $order->update([
                    'status' => 'processing',
                    'completed_at' => now(),
                ]);
            });

            return redirect()->route('orders.show', $order)
                ->with('success', 'Payment completed successfully! Your order is being processed.');

        } catch (\Exception $e) {
            Log::error('Payment success callback failed', [
                'order_id' => $order->id,
                'error' => $e->getMessage(),
            ]);

            return redirect()->route('orders.show', $order)
                ->with('error', 'There was an issue processing your payment confirmation.');
        }
    }

    public function cancel(Request $request, Order $order)
    {
        $this->authorize('view', $order);

        try {
            $payment = $order->payment;

            if (! $payment) {
                return redirect()->route('orders.show', $order)
                    ->with('toast', [
                        'type' => 'error',
                        'title' => 'Payment Error',
                        'message' => 'Payment record not found.',
                    ]);
            }

            // Update payment status
            $payment->update([
                'status' => 'cancelled',
            ]);

            return redirect()->route('orders.show', $order)
                ->with('toast', [
                    'type' => 'warning',
                    'title' => 'Payment Cancelled',
                    'message' => 'Your payment was cancelled. You can try again or contact support if needed.',
                ]);

        } catch (\Exception $e) {
            Log::error('Payment cancel callback failed', [
                'order_id' => $order->id,
                'error' => $e->getMessage(),
            ]);

            return redirect()->route('orders.show', $order)
                ->with('toast', [
                    'type' => 'error',
                    'title' => 'Payment Error',
                    'message' => 'There was an issue processing the payment cancellation.',
                ]);
        }
    }

    public function webhook(Request $request)
    {
        try {
            $payload = $request->getContent();
            $signature = $request->header('X-Magpie-Signature');

            // Verify webhook signature (if webhook secret is configured)
            $webhookSecret = config('services.magpie.webhook_secret');
            if ($webhookSecret && ! $this->magpieService->verifyWebhookSignature($payload, $signature, $webhookSecret)) {
                Log::warning('Invalid webhook signature received');

                return response('Invalid signature', 400);
            }

            $data = json_decode($payload, true);

            if (! $data || ! isset($data['type'])) {
                Log::warning('Invalid webhook payload received', ['payload' => $payload]);

                return response('Invalid payload', 400);
            }

            $this->handleWebhookEvent($data);

            return response('OK', 200);

        } catch (\Exception $e) {
            Log::error('Webhook processing failed', [
                'error' => $e->getMessage(),
                'payload' => $request->getContent(),
            ]);

            return response('Internal error', 500);
        }
    }

    private function handleWebhookEvent(array $data): void
    {
        $eventType = $data['type'];
        $eventData = $data['data'] ?? [];

        Log::info('Processing webhook event', ['type' => $eventType, 'data' => $eventData]);

        switch ($eventType) {
            case 'payment.completed':
                $this->handlePaymentCompleted($eventData);
                break;

            case 'payment.failed':
                $this->handlePaymentFailed($eventData);
                break;

            case 'payment.refunded':
                $this->handlePaymentRefunded($eventData);
                break;

            default:
                Log::info('Unhandled webhook event type', ['type' => $eventType]);
                break;
        }
    }

    private function handlePaymentCompleted(array $data): void
    {
        $transactionId = $data['id'] ?? null;
        $metadata = $data['metadata'] ?? [];

        if (! $transactionId) {
            Log::warning('Payment completed webhook missing transaction ID');

            return;
        }

        $payment = Payment::where('magpie_transaction_id', $transactionId)->first();

        if (! $payment) {
            Log::warning('Payment not found for completed transaction', ['transaction_id' => $transactionId]);

            return;
        }

        DB::transaction(function () use ($payment, $data) {
            $payment->update([
                'status' => 'completed',
                'processed_at' => now(),
                'magpie_response' => array_merge($payment->magpie_response ?? [], $data),
            ]);

            $payment->order->update([
                'status' => 'processing',
                'completed_at' => now(),
            ]);
        });

        Log::info('Payment marked as completed via webhook', ['payment_id' => $payment->id]);
    }

    private function handlePaymentFailed(array $data): void
    {
        $transactionId = $data['id'] ?? null;

        if (! $transactionId) {
            Log::warning('Payment failed webhook missing transaction ID');

            return;
        }

        $payment = Payment::where('magpie_transaction_id', $transactionId)->first();

        if (! $payment) {
            Log::warning('Payment not found for failed transaction', ['transaction_id' => $transactionId]);

            return;
        }

        $payment->update([
            'status' => 'failed',
            'magpie_response' => array_merge($payment->magpie_response ?? [], $data),
        ]);

        Log::info('Payment marked as failed via webhook', ['payment_id' => $payment->id]);
    }

    private function handlePaymentRefunded(array $data): void
    {
        $transactionId = $data['id'] ?? null;

        if (! $transactionId) {
            Log::warning('Payment refunded webhook missing transaction ID');

            return;
        }

        $payment = Payment::where('magpie_transaction_id', $transactionId)->first();

        if (! $payment) {
            Log::warning('Payment not found for refunded transaction', ['transaction_id' => $transactionId]);

            return;
        }

        DB::transaction(function () use ($payment, $data) {
            $payment->update([
                'status' => 'refunded',
                'magpie_response' => array_merge($payment->magpie_response ?? [], $data),
            ]);

            // Restore stock for physical products
            foreach ($payment->order->orderItems as $orderItem) {
                if (! $orderItem->product->digital_product) {
                    $orderItem->product->increment('quantity', $orderItem->quantity);
                }
            }

            $payment->order->update(['status' => 'refunded']);
        });

        Log::info('Payment marked as refunded via webhook', ['payment_id' => $payment->id]);
    }
}
