<?php

use App\Http\Middleware\EnsureAdmin;
use App\Http\Middleware\EnsureBuyer;
use App\Http\Middleware\EnsureMerchant;
use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        $middleware->web(append: [
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->alias([
            'buyer' => EnsureBuyer::class,
            'merchant' => EnsureMerchant::class,
            'admin' => EnsureAdmin::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->render(function (\Illuminate\Session\TokenMismatchException $e, $request) {
            // Handle CSRF token mismatches (419 errors) gracefully
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Your session has expired. Please refresh the page and try again.',
                    'session_expired' => true,
                ], 419);
            }

            // Regenerate session to clear any stale data
            $request->session()->regenerate();

            // For regular web requests, redirect to login with a helpful message
            // and preserve the original request data if it's a login attempt
            if ($request->is('login') && $request->isMethod('post')) {
                // If this is a login form submission, redirect back to login
                // with the original input (except password) and a helpful message
                return redirect()->route('login')
                    ->withInput($request->except(['password', '_token']))
                    ->with('warning', 'Your session expired. Please try logging in again.');
            }

            // For registration forms, preserve data and redirect back
            if ($request->is('register') && $request->isMethod('post')) {
                return redirect()->route('register')
                    ->withInput($request->except(['password', 'password_confirmation', '_token']))
                    ->with('warning', 'Your session expired. Please try registering again.');
            }

            // For checkout forms, redirect back to checkout with preserved data
            if ($request->is('orders/checkout') && $request->isMethod('post')) {
                return redirect()->route('orders.checkout')
                    ->withInput($request->except(['_token']))
                    ->with('warning', 'Your session expired. Please review your order and try again.');
            }

            // For other authenticated routes, check if user is logged in
            if ($request->user()) {
                // User is still authenticated, just refresh the page they were on
                return redirect()->back()
                    ->with('info', 'Your session was refreshed. Please try again.');
            }

            // For other forms or unauthenticated users, redirect to login
            return redirect()->route('login')
                ->with('info', 'Your session has expired. Please log in to continue.');
        });
    })->create();
