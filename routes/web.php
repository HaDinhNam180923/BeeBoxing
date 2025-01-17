<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\API\CartController;
use App\Http\Controllers\API\AddressController;
use App\Http\Controllers\API\OrderController;
use App\Http\Controllers\API\VoucherController;
use Illuminate\Http\Request;

Route::get('products/{id}', function ($id) {
    return Inertia::render('Products/Detail', [
        'id' => $id
    ]);
})->name('products.detail');

Route::get('products', function () {
    return Inertia::render('Products/ProductListing');
})->name('products.productlisting');
Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('/addresses', [AddressController::class, 'getUserAddresses']);
    Route::get('/addresses/provinces', [AddressController::class, 'getProvinces']);
    Route::get('/addresses/districts/{province}', [AddressController::class, 'getDistricts']);
    Route::get('/addresses/wards/{province}/{district}', [AddressController::class, 'getWards']);
    Route::post('/addresses', [AddressController::class, 'store']);
    Route::put('/addresses/{addressId}/default', [AddressController::class, 'setDefault']);
    Route::delete('/addresses/{addressId}', [AddressController::class, 'destroy']);
});
// routes/web.php
Route::middleware('auth')->group(function () {
    Route::post('/api/cart/add', [CartController::class, 'addProdToCart']);
});

Route::middleware('auth')->group(function () {
    Route::get('/api/cart', [CartController::class, 'getCart']);
    Route::put('/api/cart/quantity', [CartController::class, 'updateQuantity']);
    Route::delete('/api/cart/item', [CartController::class, 'removeItem']);
});
Route::middleware('auth')->group(function () {
    Route::get('/checkout', function (Request $request) {
        return Inertia::render('Checkout/Index', [
            'selectedItems' => array_map('intval', explode(',', $request->query('items', '')))
        ]);
    })->name('checkout');

    // API routes
    Route::post('/api/orders', [OrderController::class, 'placeOrder']);
    Route::get('/api/cart/selected-items', [CartController::class, 'getSelectedItems']);
    Route::get('/api/vouchers/available', [VoucherController::class, 'getAvailableVouchers']);
});

Route::middleware('auth')->group(function () {
    Route::get('/checkout', function (Request $request) {
        return Inertia::render('Checkout/Index', [
            'selectedItems' => array_map('intval', explode(',', $request->query('items', '')))
        ]);
    })->name('checkout');
});

require __DIR__ . '/auth.php';
