<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DraftRegistration;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;

class OtpController extends Controller
{
    public function sendOtp(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => 'Invalid email address'], 400);
        }

        $email = $request->email;
        $otp = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        // Store OTP in cache for 10 minutes
        Cache::put("otp_{$email}", $otp, 600);

        // Send OTP email
        try {
            Mail::raw("Your verification code is: {$otp}\n\nThis code will expire in 10 minutes.", function ($message) use ($email) {
                $message->to($email)
                    ->subject('PA Insurance Marketplace - Email Verification Code');
            });

            return response()->json(['message' => 'OTP sent successfully']);
        } catch (\Exception) {
            return response()->json(['error' => 'Failed to send OTP email'], 500);
        }
    }

    public function verifyOtp(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'otp' => 'required|string|size:6',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => 'Invalid email or OTP'], 400);
        }

        $email = $request->email;
        $otp = $request->otp;

        $storedOtp = Cache::get("otp_{$email}");

        if (! $storedOtp || $storedOtp !== $otp) {
            return response()->json(['error' => 'Invalid or expired OTP'], 400);
        }

        // Remove OTP from cache after successful verification
        Cache::forget("otp_{$email}");

        // Store verification status for 30 minutes
        Cache::put("email_verified_{$email}", true, 1800);

        // Create or update draft registration with verified email
        $draft = DraftRegistration::createOrUpdateDraft($email, [
            'email_verified' => true,
            'current_step' => 1,
            'role' => $request->input('role', 'merchant'),
        ]);

        return response()->json([
            'message' => 'OTP verified successfully',
            'draft_id' => $draft->id,
        ]);
    }

    public function saveDraft(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'current_step' => 'required|integer|min:1|max:5',
            'form_data' => 'nullable|array',
            'officers' => 'nullable|array',
            'beneficial_owners' => 'nullable|array',
            'banking_info' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => 'Invalid data'], 400);
        }

        // Check if email is verified
        $isVerified = Cache::get("email_verified_{$request->email}") ||
                     DraftRegistration::where('email', $request->email)
                         ->where('email_verified', true)
                         ->exists();

        if (! $isVerified) {
            return response()->json(['error' => 'Email not verified'], 403);
        }

        $draft = DraftRegistration::createOrUpdateDraft($request->email, [
            'current_step' => $request->current_step,
            'form_data' => $request->form_data,
            'officers' => $request->officers,
            'beneficial_owners' => $request->beneficial_owners,
            'banking_info' => $request->banking_info,
            'email_verified' => true,
        ]);

        return response()->json([
            'message' => 'Draft saved successfully',
            'draft_id' => $draft->id,
        ]);
    }

    public function loadDraft(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => 'Invalid email'], 400);
        }

        $draft = DraftRegistration::findByEmail($request->email);

        if (! $draft || ! $draft->email_verified) {
            return response()->json(['error' => 'No verified draft found'], 404);
        }

        $draft->touchActivity();

        return response()->json([
            'draft' => [
                'current_step' => $draft->current_step,
                'form_data' => $draft->form_data ?: [],
                'officers' => $draft->officers ?: [],
                'beneficial_owners' => $draft->beneficial_owners ?: [],
                'banking_info' => $draft->banking_info ?: [],
                'email_verified' => $draft->email_verified,
            ],
        ]);
    }

    /**
     * Send OTP for passwordless login
     * For existing users, log them in. For new users (buyers), create account during checkout.
     */
    public function sendLoginOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $email = $request->email;

        // Check if user exists
        $user = User::where('email', $email)->first();

        // Generate OTP
        $otp = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        // Store OTP in cache for 10 minutes
        Cache::put("login_otp_{$email}", $otp, 600);

        // Determine message based on whether user exists
        $emailBody = $user
            ? "Your login code is: {$otp}\n\nThis code will expire in 10 minutes.\n\nIf you didn't request this, please ignore this email."
            : "Your login code is: {$otp}\n\nThis code will expire in 10 minutes.\n\nNote: If you're a first-time buyer, your account will be created when you make your first purchase.\n\nIf you didn't request this, please ignore this email.";

        // Send OTP email
        try {
            Mail::raw($emailBody, function ($message) use ($email) {
                $message->to($email)
                    ->subject('PA Insurance Marketplace - Login Code');
            });
        } catch (\Exception $e) {
            Log::error('Failed to send login OTP email: '.$e->getMessage());

            return response()->json(['message' => 'Failed to send login code'], 500);
        }

        return response()->json([
            'message' => 'Login code sent successfully',
        ]);
    }

    /**
     * Verify OTP for passwordless login
     */
    public function verifyLoginOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'otp' => 'required|string|size:6',
        ]);

        $email = $request->email;
        $inputOtp = $request->otp;

        // Get stored OTP from cache
        $storedOtp = Cache::get("login_otp_{$email}");

        if (! $storedOtp || $storedOtp !== $inputOtp) {
            return response()->json([
                'message' => 'Invalid or expired login code',
            ], 422);
        }

        // Find user
        $user = User::where('email', $email)->first();

        // If user doesn't exist, create a buyer account with minimal data
        if (! $user) {
            $user = User::create([
                'name' => explode('@', $email)[0], // Use email prefix as temporary name
                'email' => $email,
                'password' => null, // Passwordless
                'role' => 'buyer',
                'email_verified_at' => now(), // Auto-verify since they used OTP
            ]);

            event(new \Illuminate\Auth\Events\Registered($user));
        }

        // Clear the OTP
        Cache::forget("login_otp_{$email}");

        // Log the user in
        Auth::login($user, true); // true for remember

        // Debug logging before cart transfer
        \Illuminate\Support\Facades\Log::info('OtpController: User logged in, about to transfer cart', [
            'user_id' => $user->id,
            'email' => $user->email,
            'session_cart' => session('pending_cart_items'),
            'session_id' => session()->getId(),
            'intended_url' => session('url.intended'),
        ]);

        // Transfer any pending cart items from session to user's cart
        \App\Services\CartTransferService::transferPendingCart($user);

        // Debug logging after cart transfer
        \Illuminate\Support\Facades\Log::info('OtpController: Cart transfer completed', [
            'user_id' => $user->id,
            'user_cart_count' => $user->cartItems()->count(),
            'session_cart_after' => session('pending_cart_items'),
        ]);

        // Check if there's an intended URL to redirect to
        $intendedUrl = session('url.intended', route('dashboard'));
        session()->forget('url.intended');

        return response()->json([
            'message' => 'Login successful',
            'redirect' => $intendedUrl,
        ]);
    }
}
