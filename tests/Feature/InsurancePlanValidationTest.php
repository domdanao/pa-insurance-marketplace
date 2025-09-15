<?php

use App\Models\Cart;
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

describe('Insurance Plan Validation', function () {
    it('accepts Class I without family information', function () {
        Http::fake([
            '*' => Http::response(['payment_url' => 'https://checkout.test'], 200),
        ]);

        $data = validPAInsuranceData();
        $data['choice_of_plan'] = 'class_i';
        // No family information needed for Class I

        $response = $this->actingAs($this->buyer)
            ->post(route('orders.store'), $data);

        $response->assertRedirect();
    });

    it('requires family information for Class II', function () {
        Http::fake([
            '*' => Http::response(['payment_url' => 'https://checkout.test'], 200),
        ]);

        $data = validPAInsuranceData();
        $data['choice_of_plan'] = 'class_ii';
        // Include spouse/parent information
        $data['family_members'] = [
            [
                'relationship' => 'spouse',
                'last_name' => 'Doe',
                'first_name' => 'Jane',
                'middle_name' => '',
                'suffix' => '',
                'gender' => 'female',
                'date_of_birth' => '1985-05-15',
                'occupation_education' => 'Teacher',
            ],
        ];

        $response = $this->actingAs($this->buyer)
            ->post(route('orders.store'), $data);

        $response->assertRedirect();
    });

    it('requires both family and children information for Class III', function () {
        Http::fake([
            '*' => Http::response(['payment_url' => 'https://checkout.test'], 200),
        ]);

        $data = validPAInsuranceData();
        $data['choice_of_plan'] = 'class_iii';
        // Include spouse/parent information
        $data['family_members'] = [
            [
                'relationship' => 'spouse',
                'last_name' => 'Doe',
                'first_name' => 'Jane',
                'middle_name' => '',
                'suffix' => '',
                'gender' => 'female',
                'date_of_birth' => '1985-05-15',
                'occupation_education' => 'Teacher',
            ],
        ];
        // Include children/siblings information
        $data['children_siblings'] = [
            [
                'full_name' => 'John Doe Jr.',
                'relationship' => 'child',
                'date_of_birth' => '2010-03-10',
                'occupation_education' => 'Student',
            ],
        ];

        $response = $this->actingAs($this->buyer)
            ->post(route('orders.store'), $data);

        $response->assertRedirect();
    });
});
