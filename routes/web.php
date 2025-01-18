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
use App\Models\Order;
use Illuminate\Support\Facades\Auth;

// Public routes
Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('products/{id}', function ($id) {
    return Inertia::render('Products/Detail', [
        'id' => $id
    ]);
})->name('products.detail');

Route::get('products', function () {
    return Inertia::render('Products/ProductListing');
})->name('products.productlisting');

// Authenticated routes
Route::middleware(['auth', 'verified'])->group(function () {
    // Dashboard
    Route::get('/dashboard', function () {
        return Inertia::render('Dashboard');
    })->name('dashboard');

    // Profile routes
    Route::prefix('profile')->group(function () {
        Route::get('/', [ProfileController::class, 'edit'])->name('profile.edit');
        Route::patch('/', [ProfileController::class, 'update'])->name('profile.update');
        Route::delete('/', [ProfileController::class, 'destroy'])->name('profile.destroy');
    });

    // Address routes
    Route::prefix('addresses')->group(function () {
        Route::get('/', [AddressController::class, 'getUserAddresses']);
        Route::post('/', [AddressController::class, 'store']);
        Route::get('/provinces', [AddressController::class, 'getProvinces']);
        Route::get('/districts/{province}', [AddressController::class, 'getDistricts']);
        Route::get('/wards/{province}/{district}', [AddressController::class, 'getWards']);
        Route::put('/{addressId}/default', [AddressController::class, 'setDefault']);
        Route::delete('/{addressId}', [AddressController::class, 'destroy']);
    });

    // Cart routes
    Route::prefix('api/cart')->group(function () {
        Route::get('/', [CartController::class, 'getCart']);
        Route::post('/add', [CartController::class, 'addProdToCart']);
        Route::put('/quantity', [CartController::class, 'updateQuantity']);
        Route::delete('/item', [CartController::class, 'removeItem']);
        Route::get('/selected-items', [CartController::class, 'getSelectedItems']);
    });

    // Checkout routes
    Route::middleware('auth')->group(function () {
        // Route cho trang checkout
        Route::get('/checkout', function (Request $request) {
            return Inertia::render('Checkout/Index', [
                'selectedItems' => array_map('intval', explode(',', $request->query('items', '')))
            ]);
        })->name('checkout');

        // Route cho thanh toán VNPay
        Route::get('/payment/vnpay/{orderId}', function (Request $request, $orderId) {
            $order = Order::findOrFail($orderId);
            return Inertia::render('Checkout/VNPayPayment', [
                'orderId' => $orderId,
                'paymentData' => $request->paymentData
            ]);
        })->name('payment.vnpay');

        // Route nhận kết quả từ VNPay
        Route::get('/payment/vnpay/return', [OrderController::class, 'handleVNPayReturn'])
            ->name('payment.vnpay.return');

        // Route cho trang thành công/thất bại
        Route::get('/checkout/success', function (Request $request) {
            return Inertia::render('Checkout/Success', [
                'orderId' => $request->order_id
            ]);
        })->name('payment.success');

        Route::get('/checkout/failed', function (Request $request) {
            return Inertia::render('Checkout/Failed', [
                'orderId' => $request->order_id
            ]);
        })->name('payment.failed');
    });

    // Order routes
    Route::post('/api/orders', [OrderController::class, 'placeOrder']);

    // Voucher routes
    Route::get('/api/vouchers/available', [VoucherController::class, 'getAvailableVouchers']);
});

require __DIR__ . '/auth.php';
