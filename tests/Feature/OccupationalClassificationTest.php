<?php

use App\Models\Cart;
use App\Models\Order;
use App\Models\Product;
use App\Models\Store;
use App\Models\User;
use Illuminate\Support\Facades\Http;

require_once __DIR__.'/../Helpers/PAInsuranceHelper.php';

beforeEach(function () {
    $this->buyer = User::factory()->create();
    $this->merchant = User::factory()->merchant()->create();
    $this->store = Store::factory()->create(['user_id' => $this->merchant->id]);
    $this->product = Product::factory()->create([
        'store_id' => $this->store->id,
        'price' => 5000,
        'quantity' => 10,
        'status' => 'published',
    ]);

    Cart::factory()->create([
        'user_id' => $this->buyer->id,
        'product_id' => $this->product->id,
        'quantity' => 2,
    ]);
});

describe('Occupational Classification', function () {
    it('requires occupational classification field', function () {
        Http::fake([
            '*' => Http::response(['payment_url' => 'https://checkout.test'], 200),
        ]);

        $data = validPAInsuranceData();
        unset($data['occupational_classification']);

        $response = $this->actingAs($this->buyer)
            ->post(route('orders.store'), $data);

        $response->assertSessionHasErrors('occupational_classification');
    });

    it('validates occupational classification values', function () {
        Http::fake([
            '*' => Http::response(['payment_url' => 'https://checkout.test'], 200),
        ]);

        $data = validPAInsuranceData();
        $data['occupational_classification'] = 'invalid_class';

        $response = $this->actingAs($this->buyer)
            ->post(route('orders.store'), $data);

        $response->assertSessionHasErrors('occupational_classification');
    });

    it('accepts valid occupational classification', function () {
        Http::fake([
            '*' => Http::response(['payment_url' => 'https://checkout.test'], 200),
        ]);

        $data = validPAInsuranceData();
        $data['occupational_classification'] = 'class_2';

        $response = $this->actingAs($this->buyer)
            ->post(route('orders.store'), $data);

        $response->assertRedirect();

        $order = Order::where('user_id', $this->buyer->id)->first();
        expect($order)->not->toBeNull();
        expect($order->billing_info['occupational_classification'])->toBe('class_2');
    });

    it('stores all valid occupational classes', function () {
        Http::fake([
            '*' => Http::response(['payment_url' => 'https://checkout.test'], 200),
        ]);

        $validClasses = ['class_1', 'class_2', 'class_3', 'class_4'];

        foreach ($validClasses as $class) {
            $data = validPAInsuranceData();
            $data['occupational_classification'] = $class;

            $response = $this->actingAs($this->buyer)
                ->post(route('orders.store'), $data);

            $response->assertRedirect();

            $order = Order::where('user_id', $this->buyer->id)->latest()->first();
            expect($order->billing_info['occupational_classification'])->toBe($class);

            // Clean up for next iteration
            $order->orderItems()->delete();
            $order->payment()->delete();
            $order->delete();
        }
    });
});
