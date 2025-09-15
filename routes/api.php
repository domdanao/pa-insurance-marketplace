<?php

use App\Http\Controllers\Api\OtpController;
use Illuminate\Support\Facades\Route;

Route::post('/send-otp', [OtpController::class, 'sendOtp']);
Route::post('/verify-otp', [OtpController::class, 'verifyOtp']);
Route::post('/save-draft', [OtpController::class, 'saveDraft']);
Route::post('/load-draft', [OtpController::class, 'loadDraft']);

// Passwordless login routes
Route::post('/send-login-otp', [OtpController::class, 'sendLoginOtp']);
Route::post('/verify-login-otp', [OtpController::class, 'verifyLoginOtp']);
