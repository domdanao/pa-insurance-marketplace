<?php

namespace App\Http\Controllers\Auth;

use App\Events\MerchantApplicationSubmitted;
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
        $role = $request->query('role', 'merchant');

        // Only allow merchant registration - buyers register during checkout
        if ($role !== 'merchant') {
            return redirect()->route('login')->with('info', 'Buyer accounts are created automatically during checkout. Please browse products and proceed to checkout to create your account.');
        }

        return Inertia::render('auth/register-merchant');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $role = $request->input('role', 'merchant');

        // Only allow merchant registration - buyers register during checkout
        if ($role !== 'merchant') {
            return redirect()->route('login')->with('error', 'Buyer registration is not available. Accounts are created automatically during checkout.');
        }

        return $this->storeMerchant($request);
    }

    /**
     * Create buyer account during checkout with OTP verification.
     * This method should be called from the checkout process.
     */
    public static function createBuyerForCheckout(string $email, ?string $name = null, array $demographicData = []): User
    {
        // Check if user already exists
        $existingUser = User::where('email', $email)->first();
        if ($existingUser) {
            return $existingUser;
        }

        // Create new buyer with minimal required data
        $user = User::create([
            'name' => $name ?: explode('@', $email)[0], // Use email prefix if no name provided
            'email' => $email,
            'password' => null, // Passwordless
            'role' => 'buyer',
            'email_verified_at' => now(), // Auto-verify since they used OTP for checkout
        ]);

        // Store demographic data if provided
        if (! empty($demographicData)) {
            // You can store this in a separate profile table or user meta
            // For now, we'll just trigger the Registered event
        }

        event(new Registered($user));

        // Transfer any pending cart items from session to user's cart
        \App\Services\CartTransferService::transferPendingCart($user);

        return $user;
    }

    /**
     * Handle buyer registration - DEPRECATED.
     * Buyers are now created during checkout flow.
     */
    private function storeBuyer(Request $request): RedirectResponse
    {
        return redirect()->route('login')->with('error', 'Buyer registration is not available. Accounts are created automatically during checkout.');
    }

    /**
     * Handle merchant registration with KYB data.
     */
    private function storeMerchant(Request $request): RedirectResponse
    {
        // Check if this is a submission from draft
        if ($request->has('submit_from_draft')) {
            return $this->storeMerchantFromDraft($request);
        }

        // Basic user validation for direct submission
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
        $merchant = $user->merchant()->create([
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
        event(new MerchantApplicationSubmitted($user, $merchant));
        Auth::login($user);

        // Transfer any pending cart items from session to user's cart
        \App\Services\CartTransferService::transferPendingCart($user);

        return redirect()->route('merchant.dashboard')->with('success',
            'Merchant application submitted successfully! Your application is under review.');
    }

    /**
     * Handle merchant registration from draft data.
     */
    private function storeMerchantFromDraft(Request $request): RedirectResponse
    {
        // Validate minimal required fields
        $request->validate([
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'bank_account_holder' => 'required|string|max:255',
            'bank_account_number' => 'required|string|max:50',
            'bank_routing_number' => 'required|string|max:50',
            'bank_name' => 'required|string|max:255',
        ]);

        // Find the draft registration
        $draft = \App\Models\DraftRegistration::where('email', $request->email)
            ->where('email_verified', true)
            ->first();

        if (! $draft) {
            return back()->withErrors(['email' => 'Draft registration not found or email not verified.']);
        }

        // Validate that draft has all required data
        $formData = $draft->form_data ?? [];
        $bankingInfo = $draft->banking_info ?? [];
        $officers = $draft->officers ?? [];
        $beneficialOwners = $draft->beneficial_owners ?? [];

        if (empty($formData['name']) || empty($formData['business_name']) || empty($officers) || empty($beneficialOwners)) {
            return back()->withErrors(['form' => 'Draft registration is incomplete. Please complete all steps first.']);
        }

        // Create user account using data from draft
        $user = User::create([
            'name' => $formData['name'],
            'email' => $draft->email,
            'password' => null, // Passwordless
            'role' => 'merchant',
            'email_verified_at' => now(), // Auto-verify since they used OTP
        ]);

        // Merge banking info from form with banking info from draft
        $completeBankingInfo = array_merge($bankingInfo, [
            'bank_account_holder' => $request->bank_account_holder,
            'bank_account_number' => $request->bank_account_number,
            'bank_routing_number' => $request->bank_routing_number,
            'bank_name' => $request->bank_name,
        ]);

        // Create merchant profile using draft data
        $merchant = $user->merchant()->create([
            'business_name' => $formData['business_name'],
            'business_type' => $formData['business_type'] ?? 'corporation',
            'tax_id' => $formData['tax_id'],
            'business_description' => $formData['business_description'],
            'phone' => $formData['phone'],
            'website' => $formData['website'] ?? null,
            'address_line_1' => $formData['address_line_1'],
            'address_line_2' => $formData['address_line_2'] ?? null,
            'city' => $formData['city'],
            'state' => $formData['state'],
            'postal_code' => $formData['postal_code'],
            'country' => $formData['country'] ?? 'Philippines',
            'bank_account_holder' => $completeBankingInfo['bank_account_holder'],
            'bank_account_number' => $completeBankingInfo['bank_account_number'],
            'bank_routing_number' => $completeBankingInfo['bank_routing_number'],
            'bank_name' => $completeBankingInfo['bank_name'],
            'officers' => $officers,
            'beneficial_owners' => $beneficialOwners,
            'status' => 'pending',
            'documents' => [], // Will be populated by document uploads
        ]);

        // Clean up the draft
        $draft->delete();

        event(new Registered($user));
        event(new MerchantApplicationSubmitted($user, $merchant));
        Auth::login($user);

        // Transfer any pending cart items from session to user's cart
        \App\Services\CartTransferService::transferPendingCart($user);

        return redirect()->route('merchant.dashboard')->with('success',
            'Merchant application submitted successfully! Your application is under review.');
    }
}
