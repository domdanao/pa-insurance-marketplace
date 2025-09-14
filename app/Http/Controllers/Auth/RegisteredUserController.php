<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Show the registration page.
     */
    public function create(Request $request): Response
    {
        $role = $request->query('role', 'buyer');

        // Validate role parameter
        if (!in_array($role, ['buyer', 'merchant'])) {
            $role = 'buyer';
        }

        if ($role === 'merchant') {
            return Inertia::render('auth/register-merchant');
        }

        return Inertia::render('auth/register', [
            'role' => $role
        ]);
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $role = $request->input('role', 'buyer');

        if ($role === 'merchant') {
            return $this->storeMerchant($request);
        }

        return $this->storeBuyer($request);
    }

    /**
     * Handle buyer registration.
     */
    private function storeBuyer(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'buyer',
        ]);

        event(new Registered($user));
        Auth::login($user);

        return redirect()->intended(route('dashboard', absolute: false));
    }

    /**
     * Handle merchant registration with KYB data.
     */
    private function storeMerchant(Request $request): RedirectResponse
    {
        // Basic user validation
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],

            // Business Information
            'business_name' => 'required|string|max:255',
            'business_type' => 'required|string|in:sole_proprietorship,partnership,corporation,cooperative',
            'tax_id' => 'required|string|max:50',
            'business_description' => 'required|string|max:1000',

            // Contact Information
            'phone' => 'required|string|max:20',
            'website' => 'nullable|url|max:255',

            // Address Information
            'address_line_1' => 'required|string|max:255',
            'address_line_2' => 'nullable|string|max:255',
            'city' => 'required|string|max:100',
            'state' => 'required|string|max:100',
            'postal_code' => 'required|string|max:20',
            'country' => 'required|string|max:100',

            // Banking Information
            'bank_account_holder' => 'required|string|max:255',
            'bank_account_number' => 'required|string|max:50',
            'bank_routing_number' => 'required|string|max:50',
            'bank_name' => 'required|string|max:255',

            // Officers Information
            'officers' => 'required|array|min:1',
            'officers.*.name' => 'required|string|max:255',
            'officers.*.position' => 'required|string|max:100',
            'officers.*.id_type' => 'required|string|in:passport,drivers_license,sss_id,philhealth_id,postal_id,voters_id,prc_id',
            'officers.*.id_number' => 'required|string|max:50',
            'officers.*.date_of_birth' => 'required|date|before:today',
            'officers.*.nationality' => 'required|string|max:100',
            'officers.*.address' => 'required|string|max:500',

            // Beneficial Owners Information
            'beneficial_owners' => 'required|array|min:1',
            'beneficial_owners.*.name' => 'required|string|max:255',
            'beneficial_owners.*.ownership_percentage' => 'required|numeric|min:25|max:100',
            'beneficial_owners.*.id_type' => 'required|string|in:passport,drivers_license,sss_id,philhealth_id,postal_id,voters_id,prc_id',
            'beneficial_owners.*.id_number' => 'required|string|max:50',
            'beneficial_owners.*.date_of_birth' => 'required|date|before:today',
            'beneficial_owners.*.nationality' => 'required|string|max:100',
            'beneficial_owners.*.address' => 'required|string|max:500',
            'beneficial_owners.*.is_politically_exposed' => 'required|boolean',
        ]);

        // Create user account
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'merchant',
        ]);

        // Create merchant profile with pending status
        $user->merchant()->create([
            'business_name' => $request->business_name,
            'business_type' => $request->business_type,
            'tax_id' => $request->tax_id,
            'business_description' => $request->business_description,
            'phone' => $request->phone,
            'website' => $request->website,
            'address_line_1' => $request->address_line_1,
            'address_line_2' => $request->address_line_2,
            'city' => $request->city,
            'state' => $request->state,
            'postal_code' => $request->postal_code,
            'country' => $request->country,
            'bank_account_holder' => $request->bank_account_holder,
            'bank_account_number' => $request->bank_account_number,
            'bank_routing_number' => $request->bank_routing_number,
            'bank_name' => $request->bank_name,
            'officers' => $request->officers,
            'beneficial_owners' => $request->beneficial_owners,
            'status' => 'pending',
            'documents' => [], // Will be populated by document uploads
        ]);

        event(new Registered($user));
        Auth::login($user);

        return redirect()->route('merchant.dashboard')->with('success',
            'Merchant application submitted successfully! Your application is under review.');
    }
}
