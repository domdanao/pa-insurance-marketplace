<?php

use App\Models\Cart;
use App\Models\Order;
use App\Models\Payment;
use App\Models\Product;
use App\Models\Store;
use App\Models\User;
use App\Services\MagpieService;
use Illuminate\Support\Facades\Http;

beforeEach(function () {
    $this->buyer = User::factory()->create(); // Default role is buyer
    $this->merchant = User::factory()->merchant()->create();
    $this->store = Store::factory()->create(['user_id' => $this->merchant->id]);
    $this->product = Product::factory()->create([
        'store_id' => $this->store->id,
        'price' => 5000, // ₱50.00
        'quantity' => 10,
        'status' => 'published',
    ]);

    Cart::factory()->create([
        'user_id' => $this->buyer->id,
        'product_id' => $this->product->id,
        'quantity' => 2,
    ]);
});

describe('MagpieService', function () {
    it('can create a customer', function () {
        Http::fake([
            config('services.magpie.customers_url') => Http::response([
                'id' => 'cust_test123',
                'name' => 'John Doe',
                'email' => 'john@example.com',
            ], 200),
        ]);

        $magpieService = new MagpieService;
        $response = $magpieService->createCustomer([
            'name' => 'John Doe',
            'email' => 'john@example.com',
        ]);

        expect($response)->toHaveKey('id')
            ->and($response['id'])->toBe('cust_test123')
            ->and($response['name'])->toBe('John Doe')
            ->and($response['email'])->toBe('john@example.com');
    });

    it('can create a charge', function () {
        Http::fake([
            config('services.magpie.charges_url') => Http::response([
                'id' => 'ch_test123',
                'amount' => 10000,
                'currency' => 'PHP',
                'status' => 'pending',
            ], 200),
        ]);

        $magpieService = new MagpieService;
        $response = $magpieService->createCharge([
            'amount' => 10000,
            'currency' => 'PHP',
            'description' => 'Test charge',
        ]);

        expect($response)->toHaveKey('id')
            ->and($response['id'])->toBe('ch_test123')
            ->and($response['amount'])->toBe(10000)
            ->and($response['currency'])->toBe('PHP');
    });

    it('can create a checkout session', function () {
        Http::fake([
            config('services.magpie.checkout_url') => Http::response([
                'id' => 'cs_test123',
                'checkout_url' => 'https://checkout.magpie.im/cs_test123',
                'amount' => 10000,
                'currency' => 'PHP',
            ], 200),
        ]);

        $magpieService = new MagpieService;
        $response = $magpieService->createCheckoutSession([
            'amount' => 10000,
            'currency' => 'PHP',
            'description' => 'Test checkout',
            'success_url' => 'https://example.com/success',
            'cancel_url' => 'https://example.com/cancel',
        ]);

        expect($response)->toHaveKey('id')
            ->and($response['id'])->toBe('cs_test123')
            ->and($response)->toHaveKey('checkout_url');
    });

    it('handles API errors gracefully', function () {
        Http::fake([
            config('services.magpie.charges_url') => Http::response([
                'error' => 'Invalid request',
            ], 400),
        ]);

        $magpieService = new MagpieService;

        expect(fn () => $magpieService->createCharge([
            'amount' => 10000,
            'currency' => 'PHP',
        ]))->toThrow(Exception::class);
    });

    it('formats amounts correctly', function () {
        $magpieService = new MagpieService;

        expect($magpieService->formatAmount(50.00))->toBe(5000)
            ->and($magpieService->formatAmount(123.45))->toBe(12345)
            ->and($magpieService->formatCurrency(5000))->toBe(50.00)
            ->and($magpieService->formatCurrency(12345))->toBe(123.45);
    });
});

describe('Payment Integration Flow', function () {
    it('creates payment record when placing order', function () {
        Http::fake([
            config('services.magpie.checkout_url') => Http::response([
                'id' => 'cs_test123',
                'checkout_url' => 'https://checkout.magpie.im/cs_test123',
            ], 200),
        ]);

        $response = $this->actingAs($this->buyer)
            ->post(route('orders.store'), [
                'billing_name' => 'John Doe',
                'billing_email' => 'john@example.com',
                'billing_address' => '123 Main St',
                'billing_city' => 'Manila',
                'billing_postal_code' => '1000',
                'billing_country' => 'Philippines',
            ]);

        // Check response status
        $response->assertRedirect(); // Should redirect to checkout or order page

        $order = Order::where('user_id', $this->buyer->id)->first();
        expect($order)->not->toBeNull();

        $payment = Payment::where('order_id', $order->id)->first();
        expect($payment)->not->toBeNull()
            ->and((float) $payment->amount)->toBe(100.00) // ₱100.00 (2 * ₱50.00)
            ->and($payment->currency)->toBe('PHP')
            ->and($payment->status)->toBe('pending')
            ->and($payment->magpie_transaction_id)->toBe('cs_test123');
    });

    it('handles payment creation failure gracefully', function () {
        Http::fake([
            config('services.magpie.checkout_url') => Http::response([
                'error' => 'Payment gateway error',
            ], 500),
        ]);

        $response = $this->actingAs($this->buyer)
            ->post(route('orders.store'), [
                'billing_name' => 'John Doe',
                'billing_email' => 'john@example.com',
                'billing_address' => '123 Main St',
                'billing_city' => 'Manila',
                'billing_postal_code' => '1000',
                'billing_country' => 'Philippines',
            ]);

        $order = Order::where('user_id', $this->buyer->id)->first();
        expect($order)->not->toBeNull();

        $payment = Payment::where('order_id', $order->id)->first();
        expect($payment)->not->toBeNull()
            ->and($payment->status)->toBe('failed');
    });

    it('redirects to Magpie checkout URL when successful', function () {
        Http::fake([
            config('services.magpie.checkout_url') => Http::response([
                'id' => 'cs_test123',
                'checkout_url' => 'https://checkout.magpie.im/cs_test123',
            ], 200),
        ]);

        $response = $this->actingAs($this->buyer)
            ->post(route('orders.store'), [
                'billing_name' => 'John Doe',
                'billing_email' => 'john@example.com',
                'billing_address' => '123 Main St',
                'billing_city' => 'Manila',
                'billing_postal_code' => '1000',
                'billing_country' => 'Philippines',
            ]);

        $response->assertRedirect('https://checkout.magpie.im/cs_test123');
    });

    it('clears cart after successful order creation', function () {
        Http::fake([
            config('services.magpie.checkout_url') => Http::response([
                'id' => 'cs_test123',
                'checkout_url' => 'https://checkout.magpie.im/cs_test123',
            ], 200),
        ]);

        expect(Cart::where('user_id', $this->buyer->id)->count())->toBe(1);

        $this->actingAs($this->buyer)
            ->post(route('orders.store'), [
                'billing_name' => 'John Doe',
                'billing_email' => 'john@example.com',
                'billing_address' => '123 Main St',
                'billing_city' => 'Manila',
                'billing_postal_code' => '1000',
                'billing_country' => 'Philippines',
            ]);

        expect(Cart::where('user_id', $this->buyer->id)->count())->toBe(0);
    });
});

describe('Payment Callback Handling', function () {
    beforeEach(function () {
        $this->order = Order::factory()->create([
            'user_id' => $this->buyer->id,
            'status' => 'pending',
            'total_amount' => 10000,
        ]);

        $this->payment = Payment::factory()->create([
            'order_id' => $this->order->id,
            'status' => 'pending',
            'magpie_transaction_id' => 'cs_test123',
        ]);
    });

    it('handles successful payment callback', function () {
        $response = $this->actingAs($this->buyer)
            ->get(route('payment.success', ['order' => $this->order->id]));

        $response->assertRedirect(route('orders.show', $this->order));
        $response->assertSessionHas('success');

        $this->payment->refresh();
        $this->order->refresh();

        expect($this->payment->status)->toBe('completed')
            ->and($this->payment->processed_at)->not->toBeNull()
            ->and($this->order->status)->toBe('processing')
            ->and($this->order->completed_at)->not->toBeNull();
    });

    it('handles cancelled payment callback', function () {
        $response = $this->actingAs($this->buyer)
            ->get(route('payment.cancel', ['order' => $this->order->id]));

        $response->assertRedirect(route('orders.show', $this->order));
        $response->assertSessionHas('warning');

        $this->payment->refresh();
        expect($this->payment->status)->toBe('cancelled');
    });

    it('prevents unauthorized access to payment callbacks', function () {
        $otherUser = User::factory()->create(); // Default role is buyer

        $response = $this->actingAs($otherUser)
            ->get(route('payment.success', ['order' => $this->order->id]));

        $response->assertForbidden();
    });
});

describe('Webhook Handling', function () {
    beforeEach(function () {
        $this->order = Order::factory()->create([
            'user_id' => $this->buyer->id,
            'status' => 'pending',
        ]);

        $this->payment = Payment::factory()->create([
            'order_id' => $this->order->id,
            'status' => 'pending',
            'magpie_transaction_id' => 'ch_test123',
        ]);
    });

    it('handles payment completed webhook', function () {
        $payload = json_encode([
            'type' => 'payment.completed',
            'data' => [
                'id' => 'ch_test123',
                'amount' => 10000,
                'currency' => 'PHP',
                'status' => 'completed',
            ],
        ]);

        $response = $this->postJson(route('webhooks.magpie'), json_decode($payload, true));

        $response->assertOk();

        $this->payment->refresh();
        $this->order->refresh();

        expect($this->payment->status)->toBe('completed')
            ->and($this->order->status)->toBe('processing');
    });

    it('handles payment failed webhook', function () {
        $payload = json_encode([
            'type' => 'payment.failed',
            'data' => [
                'id' => 'ch_test123',
                'status' => 'failed',
                'failure_reason' => 'Card declined',
            ],
        ]);

        $response = $this->postJson(route('webhooks.magpie'), json_decode($payload, true));

        $response->assertOk();

        $this->payment->refresh();
        expect($this->payment->status)->toBe('failed');
    });

    it('handles payment refunded webhook with stock restoration', function () {
        // Set up order with physical product
        $this->order->update(['status' => 'completed']);
        $this->payment->update(['status' => 'completed']);

        $orderItem = $this->order->orderItems()->create([
            'product_id' => $this->product->id,
            'store_id' => $this->store->id,
            'product_name' => $this->product->name,
            'product_price' => $this->product->price,
            'quantity' => 2,
            'total_price' => $this->product->price * 2,
        ]);

        // Simulate stock was reduced when order was placed
        $this->product->update(['quantity' => 8]);

        $payload = json_encode([
            'type' => 'payment.refunded',
            'data' => [
                'id' => 'ch_test123',
                'status' => 'refunded',
                'amount_refunded' => 10000,
            ],
        ]);

        $response = $this->postJson(route('webhooks.magpie'), json_decode($payload, true));

        $response->assertOk();

        $this->payment->refresh();
        $this->order->refresh();
        $this->product->refresh();

        expect($this->payment->status)->toBe('refunded')
            ->and($this->order->status)->toBe('refunded')
            ->and($this->product->quantity)->toBe(10); // Stock restored
    });

    it('handles invalid webhook payload gracefully', function () {
        $response = $this->postJson(route('webhooks.magpie'), ['invalid' => 'json']);

        $response->assertStatus(400);
    });

    it('handles unknown webhook event types', function () {
        $payload = json_encode([
            'type' => 'unknown.event',
            'data' => ['id' => 'test123'],
        ]);

        $response = $this->postJson(route('webhooks.magpie'), json_decode($payload, true));

        $response->assertOk(); // Should still return 200 for unknown events
    });
});

describe('Payment Model Helper Methods', function () {
    beforeEach(function () {
        $this->payment = Payment::factory()->create();
    });

    it('has correct status checking methods', function () {
        $this->payment->update(['status' => 'pending']);
        expect($this->payment->isPending())->toBeTrue()
            ->and($this->payment->isCompleted())->toBeFalse();

        $this->payment->update(['status' => 'processing']);
        expect($this->payment->isProcessing())->toBeTrue()
            ->and($this->payment->isPending())->toBeFalse();

        $this->payment->update(['status' => 'completed']);
        expect($this->payment->isCompleted())->toBeTrue()
            ->and($this->payment->isProcessing())->toBeFalse();

        $this->payment->update(['status' => 'failed']);
        expect($this->payment->isFailed())->toBeTrue()
            ->and($this->payment->isCompleted())->toBeFalse();

        $this->payment->update(['status' => 'cancelled']);
        expect($this->payment->isCancelled())->toBeTrue()
            ->and($this->payment->isFailed())->toBeFalse();

        $this->payment->update(['status' => 'refunded']);
        expect($this->payment->isRefunded())->toBeTrue()
            ->and($this->payment->isCancelled())->toBeFalse();
    });

    it('can mark payment as processed', function () {
        expect($this->payment->processed_at)->toBeNull();

        $this->payment->markAsProcessed();
        $this->payment->refresh();

        expect($this->payment->processed_at)->not->toBeNull();
    });

    it('generates unique payment ID on creation', function () {
        $payment1 = Payment::factory()->create();
        $payment2 = Payment::factory()->create();

        expect($payment1->payment_id)->not->toBe($payment2->payment_id)
            ->and($payment1->payment_id)->toStartWith('PAY-')
            ->and($payment2->payment_id)->toStartWith('PAY-');
    });
});
