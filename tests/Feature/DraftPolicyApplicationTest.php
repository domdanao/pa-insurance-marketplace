<?php

use App\Models\Cart;
use App\Models\DraftPolicyApplication;
use App\Models\Product;
use App\Models\Store;
use App\Models\User;

test('can save draft policy application', function () {
    $user = User::factory()->create();
    $store = Store::factory()->create(['status' => 'approved']);
    $product = Product::factory()->create(['store_id' => $store->id, 'status' => 'published']);
    Cart::factory()->create(['user_id' => $user->id, 'product_id' => $product->id]);

    $formData = [
        'application_type' => 'new',
        'first_name' => 'John',
        'last_name' => 'Doe',
        'email_address' => 'john@example.com',
    ];

    $response = $this->actingAs($user)->postJson('/draft-policy/save', [
        'current_step' => 2,
        'form_data' => $formData,
    ]);

    $response->assertSuccessful();
    $response->assertJson(['success' => true]);

    $this->assertDatabaseHas('draft_policy_applications', [
        'user_id' => $user->id,
        'current_step' => 2,
        'is_completed' => false,
    ]);

    $draft = DraftPolicyApplication::where('user_id', $user->id)->first();
    expect($draft->form_data)->toEqual($formData);
    expect($draft->cart_data)->not->toBeEmpty();
});

test('can load existing draft', function () {
    $user = User::factory()->create();
    $formData = ['first_name' => 'Jane', 'last_name' => 'Smith'];

    $draft = DraftPolicyApplication::create([
        'user_id' => $user->id,
        'email' => $user->email,
        'current_step' => 3,
        'form_data' => $formData,
        'cart_data' => [],
        'last_accessed_at' => now(),
    ]);

    $response = $this->actingAs($user)->getJson('/draft-policy/load');

    $response->assertSuccessful();
    $response->assertJson([
        'success' => true,
        'draft' => [
            'id' => $draft->id,
            'current_step' => 3,
            'form_data' => $formData,
        ],
    ]);
});

test('can delete draft', function () {
    $user = User::factory()->create();

    $draft = DraftPolicyApplication::create([
        'user_id' => $user->id,
        'email' => $user->email,
        'current_step' => 2,
        'form_data' => ['test' => 'data'],
        'cart_data' => [],
        'last_accessed_at' => now(),
    ]);

    $response = $this->actingAs($user)->deleteJson('/draft-policy/delete');

    $response->assertSuccessful();
    $this->assertDatabaseMissing('draft_policy_applications', ['id' => $draft->id]);
});

test('can check for resume availability', function () {
    $user = User::factory()->create();

    $draft = DraftPolicyApplication::create([
        'user_id' => $user->id,
        'email' => $user->email,
        'current_step' => 4,
        'form_data' => ['test' => 'data'],
        'cart_data' => [],
        'last_accessed_at' => now(),
    ]);

    $response = $this->actingAs($user)->getJson('/draft-policy/check-resume');

    $response->assertSuccessful();
    $response->assertJson([
        'has_draft' => true,
        'draft_info' => [
            'current_step' => 4,
        ],
    ]);
});

test('expired drafts are not resumed', function () {
    $user = User::factory()->create();

    DraftPolicyApplication::create([
        'user_id' => $user->id,
        'email' => $user->email,
        'current_step' => 2,
        'form_data' => ['test' => 'data'],
        'cart_data' => [],
        'last_accessed_at' => now()->subDays(31), // Expired
    ]);

    $response = $this->actingAs($user)->getJson('/draft-policy/check-resume');

    $response->assertSuccessful();
    $response->assertJson(['has_draft' => false]);
});

test('checkout includes draft data when available', function () {
    $user = User::factory()->create();
    $store = Store::factory()->create(['status' => 'approved']);
    $product = Product::factory()->create(['store_id' => $store->id, 'status' => 'published']);
    Cart::factory()->create(['user_id' => $user->id, 'product_id' => $product->id]);

    $draft = DraftPolicyApplication::create([
        'user_id' => $user->id,
        'email' => $user->email,
        'current_step' => 3,
        'form_data' => ['first_name' => 'Test', 'last_name' => 'User'],
        'cart_data' => [],
        'last_accessed_at' => now(),
    ]);

    $response = $this->actingAs($user)->get('/orders/checkout');

    $response->assertSuccessful();
    $response->assertInertia(function ($page) use ($draft) {
        $page->has('draftData')
            ->where('draftData.id', $draft->id)
            ->where('draftData.current_step', 3);
    });
});

test('draft is marked completed when order is created', function () {
    $user = User::factory()->create();
    $store = Store::factory()->create(['status' => 'approved']);
    $product = Product::factory()->create(['store_id' => $store->id, 'status' => 'published']);
    Cart::factory()->create(['user_id' => $user->id, 'product_id' => $product->id]);

    $draft = DraftPolicyApplication::create([
        'user_id' => $user->id,
        'email' => $user->email,
        'current_step' => 6,
        'form_data' => ['test' => 'data'],
        'cart_data' => [],
        'last_accessed_at' => now(),
    ]);

    // Submit a complete application
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
        'civil_status' => 'single',
        'date_of_birth' => '1990-01-01',
        'place_of_birth' => 'Test City',
        'citizenship_nationality' => 'Filipino',
        'source_of_funds' => 'salary',
        'name_of_employer_business' => 'Test Company',
        'occupation' => 'Software Engineer',
        'occupational_classification' => 'class_1',
        'nature_of_employment_business' => 'Technology',
        'employer_business_address' => '456 Company St',
        'choice_of_plan' => 'class_i',
        'agreement_accepted' => true,
        'data_privacy_consent' => true,
    ]);

    $response->assertRedirect();

    $draft->refresh();
    expect($draft->is_completed)->toBeTrue();
});
