<?php

use App\Models\Cart;
use App\Models\Order;
use App\Models\Product;
use App\Models\Store;
use App\Models\User;

test('class ii application includes family member data', function () {
    $user = User::factory()->create();
    $store = Store::factory()->create(['status' => 'approved']);
    $product = Product::factory()->create(['store_id' => $store->id, 'status' => 'published']);
    Cart::factory()->create(['user_id' => $user->id, 'product_id' => $product->id]);

    // Submit a Class II application with family member data
    $response = $this->actingAs($user)->post('/orders/checkout', [
        'application_type' => 'new',
        'last_name' => 'Test',
        'first_name' => 'User',
        'middle_name' => '',
        'suffix' => '',
        'block_lot_phase_floor_unit' => '',
        'street' => '123 Test St',
        'village_subdivision_condo' => '',
        'barangay' => 'Test Barangay',
        'city_municipality' => 'Test City',
        'province_state' => 'Test Province',
        'zip_code' => '1234',
        'mobile_no' => '09123456789',
        'email_address' => $user->email,
        'tin_sss_gsis_no' => '',
        'gender' => 'male',
        'civil_status' => 'married',
        'date_of_birth' => '1990-01-01',
        'place_of_birth' => 'Test City',
        'citizenship_nationality' => 'Filipino',
        'source_of_funds' => 'salary',
        'name_of_employer_business' => 'Test Company',
        'occupation' => 'Software Engineer',
        'occupational_classification' => 'class_1',
        'nature_of_employment_business' => 'Technology',
        'employer_business_address' => '456 Company St',
        'choice_of_plan' => 'class_ii',

        // Family member data for Class II
        'family_members' => [
            [
                'relationship' => 'spouse',
                'last_name' => 'Test',
                'first_name' => 'Spouse',
                'middle_name' => 'S',
                'suffix' => '',
                'gender' => 'female',
                'date_of_birth' => '1992-05-15',
                'occupation_education' => 'Teacher',
            ],
        ],

        'agreement_accepted' => true,
        'data_privacy_consent' => true,
    ]);

    // Should redirect to payment (indicates successful order creation)
    $response->assertRedirect();

    // Check if family member data was saved
    $order = Order::where('user_id', $user->id)->latest()->first();
    expect($order)->not->toBeNull();

    $billingInfo = $order->billing_info;

    // Verify basic info
    expect($billingInfo['choice_of_plan'])->toBe('class_ii');

    // Check if family member data exists
    dump('Checking family_members in billing_info...');
    dump('Keys in billing_info:', array_keys($billingInfo));

    if (array_key_exists('family_members', $billingInfo)) {
        dump('Family members found:', $billingInfo['family_members']);
        expect($billingInfo['family_members'])->toBeArray();
        expect($billingInfo['family_members'][0]['first_name'])->toBe('Spouse');
    } else {
        dump('❌ family_members NOT FOUND in billing_info');
        expect(false)->toBeTrue('Family member data was not saved to billing_info');
    }
});

test('class iii application includes family and children data', function () {
    $user = User::factory()->create();
    $store = Store::factory()->create(['status' => 'approved']);
    $product = Product::factory()->create(['store_id' => $store->id, 'status' => 'published']);
    Cart::factory()->create(['user_id' => $user->id, 'product_id' => $product->id]);

    // Submit a Class III application with family and children data
    $response = $this->actingAs($user)->post('/orders/checkout', [
        'application_type' => 'new',
        'last_name' => 'Test',
        'first_name' => 'User',
        'middle_name' => '',
        'suffix' => '',
        'block_lot_phase_floor_unit' => '',
        'street' => '123 Test St',
        'village_subdivision_condo' => '',
        'barangay' => 'Test Barangay',
        'city_municipality' => 'Test City',
        'province_state' => 'Test Province',
        'zip_code' => '1234',
        'mobile_no' => '09123456789',
        'email_address' => $user->email,
        'tin_sss_gsis_no' => '',
        'gender' => 'male',
        'civil_status' => 'married',
        'date_of_birth' => '1990-01-01',
        'place_of_birth' => 'Test City',
        'citizenship_nationality' => 'Filipino',
        'source_of_funds' => 'salary',
        'name_of_employer_business' => 'Test Company',
        'occupation' => 'Software Engineer',
        'occupational_classification' => 'class_1',
        'nature_of_employment_business' => 'Technology',
        'employer_business_address' => '456 Company St',
        'choice_of_plan' => 'class_iii',

        // Family member data for Class III
        'family_members' => [
            [
                'relationship' => 'spouse',
                'last_name' => 'Test',
                'first_name' => 'Spouse',
                'middle_name' => 'S',
                'suffix' => '',
                'gender' => 'female',
                'date_of_birth' => '1992-05-15',
                'occupation_education' => 'Teacher',
            ],
        ],

        // Children/siblings data for Class III
        'children_siblings' => [
            [
                'full_name' => 'Test Child One',
                'relationship' => 'child',
                'date_of_birth' => '2015-03-10',
                'occupation_education' => 'Elementary Student',
            ],
            [
                'full_name' => 'Test Child Two',
                'relationship' => 'child',
                'date_of_birth' => '2018-07-22',
                'occupation_education' => 'Preschool',
            ],
        ],

        'agreement_accepted' => true,
        'data_privacy_consent' => true,
    ]);

    // Should redirect to payment (indicates successful order creation)
    $response->assertRedirect();

    // Check if family and children data was saved
    $order = Order::where('user_id', $user->id)->latest()->first();
    expect($order)->not->toBeNull();

    $billingInfo = $order->billing_info;

    // Verify basic info
    expect($billingInfo['choice_of_plan'])->toBe('class_iii');

    // Check if family member data exists
    dump('Checking family data in Class III application...');
    dump('Keys in billing_info:', array_keys($billingInfo));

    if (array_key_exists('family_members', $billingInfo)) {
        dump('Family members found:', $billingInfo['family_members']);
        expect($billingInfo['family_members'])->toBeArray();
        expect($billingInfo['family_members'][0]['first_name'])->toBe('Spouse');
    } else {
        dump('❌ family_members NOT FOUND in billing_info');
    }

    if (array_key_exists('children_siblings', $billingInfo)) {
        dump('Children/siblings found:', $billingInfo['children_siblings']);
        expect($billingInfo['children_siblings'])->toBeArray();
        expect($billingInfo['children_siblings'][0]['full_name'])->toBe('Test Child One');
        expect($billingInfo['children_siblings'][1]['full_name'])->toBe('Test Child Two');
    } else {
        dump('❌ children_siblings NOT FOUND in billing_info');
    }

    // This test will help us see what's actually being saved
    dump('All billing_info data:', $billingInfo);
});
