<?php

use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\MidtransWebhookController;
use App\Http\Controllers\ShopController;
use Illuminate\Support\Facades\Route;

// Shop landing page
Route::get('/', [ShopController::class, 'index'])->name('home');

// Cart / checkout page
Route::get('/cart', [ShopController::class, 'cart'])->name('cart');

// Process checkout & get Midtrans Snap token
Route::post('/checkout', [CheckoutController::class, 'store'])->name('checkout.store');

// Midtrans payment notification webhook (CSRF-exempt via bootstrap/app.php)
Route::post('/midtrans/webhook', [MidtransWebhookController::class, 'handle'])
    ->name('midtrans.webhook');

// Payment success redirect from Midtrans
Route::get('/payment/success', [MidtransWebhookController::class, 'success'])->name('payment.success');

// Auth routes
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [ShopController::class, 'dashboard'])->middleware('admin')->name('dashboard');
    Route::get('/orders', [ShopController::class, 'orders'])->name('orders');
});

require __DIR__.'/settings.php';
