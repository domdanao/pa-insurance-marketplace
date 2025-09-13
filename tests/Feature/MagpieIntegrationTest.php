<?php

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use App\Services\MagpieService;

it('can create checkout session payload with correct format', function () {
    $user = User::factory()->create([
        'email' => 'test@example.com',
    ]);

    $product = Product::factory()->create([
        'name' => 'Test Product',
        'price' => 100.00,
    ]);

    $order = Order::factory()->create([
        'user_id' => $user->id,
        'total_amount' => 10000, // 100.00 in centavos
    ]);

    OrderItem::factory()->create([
        'order_id' => $order->id,
        'product_id' => $product->id,
        'quantity' => 1,
        'product_price' => 100.00,
        'total_price' => 100.00,
    ]);

    $magpieService = new MagpieService;

    // Test the buildCheckoutPayload method
    $data = [
        'cancel_url' => 'https://marketplace.test/orders/cancel',
        'success_url' => 'https://marketplace.test/orders/success',
        'customer_email' => $user->email,
        'line_items' => [
            [
                'amount' => '100.00', // String amount that should be converted
                'description' => $product->name,
                'quantity' => 1,
            ],
        ],
    ];

    // Use reflection to access private method
    $reflection = new ReflectionClass($magpieService);
    $method = $reflection->getMethod('buildCheckoutPayload');
    $method->setAccessible(true);

    $payload = $method->invoke($magpieService, $data);

    // Verify the payload structure
    expect($payload)->toHaveKeys(['cancel_url', 'success_url', 'customer_email', 'line_items']);
    expect($payload['cancel_url'])->toBe('https://marketplace.test/orders/cancel');
    expect($payload['success_url'])->toBe('https://marketplace.test/orders/success');
    expect($payload['customer_email'])->toBe($user->email);

    // Verify line items format
    expect($payload['line_items'])->toHaveCount(1);
    expect($payload['line_items'][0])->toHaveKeys(['amount', 'description', 'quantity']);

    // Most importantly, verify amount is converted to integer centavos
    expect($payload['line_items'][0]['amount'])->toBe(10000); // 100.00 * 100
    expect($payload['line_items'][0]['amount'])->toBeInt();
    expect($payload['line_items'][0]['description'])->toBe($product->name);
    expect($payload['line_items'][0]['quantity'])->toBe(1);
});

it('can format amounts correctly', function () {
    $magpieService = new MagpieService;

    // Test string amount
    expect($magpieService->formatAmount('100.00'))->toBe(10000);
    expect($magpieService->formatAmount('50.50'))->toBe(5050);
    expect($magpieService->formatAmount('0.01'))->toBe(1);

    // Test float amount
    expect($magpieService->formatAmount(100.00))->toBe(10000);
    expect($magpieService->formatAmount(50.50))->toBe(5050);
    expect($magpieService->formatAmount(0.01))->toBe(1);
});
