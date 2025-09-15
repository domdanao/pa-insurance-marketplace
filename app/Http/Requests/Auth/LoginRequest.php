<?php

namespace App\Http\Requests\Auth;

use Illuminate\Auth\Events\Lockout;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;

class LoginRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        // If passwordless login
        if ($this->has('passwordless_login')) {
            return [
                'email' => ['required', 'string', 'email'],
                'otp' => ['required', 'string', 'size:6'],
            ];
        }

        // Traditional login (legacy support)
        return [
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ];
    }

    /**
     * Attempt to authenticate the request's credentials.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function authenticate(): void
    {
        $this->ensureIsNotRateLimited();

        // Handle passwordless login
        if ($this->has('passwordless_login')) {
            $this->authenticatePasswordless();

            return;
        }

        // Traditional password authentication
        if (! Auth::attempt($this->only('email', 'password'), $this->boolean('remember'))) {
            RateLimiter::hit($this->throttleKey());

            throw ValidationException::withMessages([
                'email' => __('auth.failed'),
            ]);
        }

        RateLimiter::clear($this->throttleKey());

        // Transfer any pending cart items from session to user's cart
        if (Auth::user()) {
            \App\Services\CartTransferService::transferPendingCart(Auth::user());
        }
    }

    /**
     * Authenticate using OTP (passwordless)
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    protected function authenticatePasswordless(): void
    {
        $email = $this->input('email');
        $otp = $this->input('otp');

        // Get stored OTP from cache
        $storedOtp = Cache::get("login_otp_{$email}");

        if (! $storedOtp || $storedOtp !== $otp) {
            RateLimiter::hit($this->throttleKey());

            throw ValidationException::withMessages([
                'otp' => 'Invalid or expired login code',
            ]);
        }

        // Find user
        $user = \App\Models\User::where('email', $email)->first();

        // If user doesn't exist, create a buyer account with minimal data
        if (! $user) {
            $user = \App\Models\User::create([
                'name' => explode('@', $email)[0], // Use email prefix as temporary name
                'email' => $email,
                'password' => null, // Passwordless
                'role' => 'buyer',
                'email_verified_at' => now(), // Auto-verify since they used OTP
            ]);

            event(new \Illuminate\Auth\Events\Registered($user));
        }

        // Clear the OTP and rate limiting
        Cache::forget("login_otp_{$email}");
        RateLimiter::clear($this->throttleKey());

        // Log the user in
        Auth::login($user, true); // true for remember

        // Transfer any pending cart items from session to user's cart
        \App\Services\CartTransferService::transferPendingCart($user);
    }

    /**
     * Ensure the login request is not rate limited.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function ensureIsNotRateLimited(): void
    {
        if (! RateLimiter::tooManyAttempts($this->throttleKey(), 5)) {
            return;
        }

        event(new Lockout($this));

        $seconds = RateLimiter::availableIn($this->throttleKey());

        throw ValidationException::withMessages([
            'email' => __('auth.throttle', [
                'seconds' => $seconds,
                'minutes' => ceil($seconds / 60),
            ]),
        ]);
    }

    /**
     * Get the rate limiting throttle key for the request.
     */
    public function throttleKey(): string
    {
        return $this->string('email')
            ->lower()
            ->append('|'.$this->ip())
            ->transliterate()
            ->value();
    }
}
