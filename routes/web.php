<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\API\CartController;
use App\Http\Controllers\API\AddressController;
use App\Http\Controllers\API\OrderController;
use App\Http\Controllers\Admin\VoucherController;
use Illuminate\Http\Request;
use App\Models\Order;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\API\ReviewController;
use App\Http\Controllers\Admin\ShipperController;

// Đặt route VNPay return đầu tiên để tránh bị ghi đè
Route::get('/payment/vnpay/return', [OrderController::class, 'handleVNPayReturn'])
    ->name('payment.vnpay.return');

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

// Authenticated routes (require auth and email verification)
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
    Route::get('/checkout', function (Request $request) {
        return Inertia::render('Checkout/Index', [
            'selectedItems' => array_map('intval', explode(',', $request->query('items', '')))
        ]);
    })->name('checkout');

    Route::get('/payment/vnpay/{orderId}', function (Request $request, $orderId) {
        $order = Order::findOrFail($orderId);
        return Inertia::render('Checkout/VNPayPayment', [
            'orderId' => $orderId,
            'paymentData' => $request->paymentData
        ]);
    })->name('payment.vnpay');

    Route::get('/checkout/success', function (Request $request) {
        $order = Order::findOrFail($request->order_id);
        return Inertia::render('Checkout/Success', [
            'order' => [
                'order_id' => $order->order_id,
                'tracking_number' => $order->tracking_number
            ]
        ]);
    })->name('payment.success');

    Route::get('/checkout/failed', function (Request $request) {
        return Inertia::render('Checkout/Failed', [
            'orderId' => $request->order_id
        ]);
    })->name('payment.failed');

    // Order routes
    Route::post('/api/orders', [OrderController::class, 'placeOrder']);
    Route::get('/api/orders', [OrderController::class, 'getOrderHistory']);
    Route::get('/api/orders/{id}', [OrderController::class, 'getOrderDetail']);
    Route::post('/api/orders/{id}/cancel', [OrderController::class, 'cancelOrder']);
    Route::post('/api/orders/{id}/confirm-delivery', [OrderController::class, 'confirmDelivery']);
    Route::get('api/vouchers/used-today', [VoucherController::class, 'getUsedVouchersToday']);

    Route::get('/orders', function () {
        return Inertia::render('Orders/Index');
    })->name('orders.index');

    Route::get('/orders/{id}', function ($id) {
        return Inertia::render('Orders/Detail', [
            'orderId' => $id
        ]);
    })->name('orders.detail');

    // Voucher routes
    Route::get('/api/vouchers/available', [VoucherController::class, 'getAvailableVouchers']);

    // Review routes
    Route::prefix('api/reviews')->group(function () {
        Route::post('/', [ReviewController::class, 'store']);
        Route::get('/user', [ReviewController::class, 'getUserReviews']);
        Route::get('/product/{productId}', [ReviewController::class, 'getProductReviews']);
        Route::put('/{reviewId}', [ReviewController::class, 'update']);
        Route::delete('/{reviewId}', [ReviewController::class, 'destroy']);
    });
});

// Authenticated routes (require only auth, no email verification)
Route::middleware('auth')->group(function () {
    // Shipper routes
    Route::prefix('api/shipper')->group(function () {
        Route::post('/orders/by-tracking-number', [ShipperController::class, 'getOrderByTrackingNumber']);
        Route::get('/orders/delivering', [ShipperController::class, 'getDeliveringOrders']);
        Route::get('/orders/delivered', [ShipperController::class, 'getDeliveredOrders']);
        Route::get('/orders/{order_id}', [ShipperController::class, 'getOrderDetail']);
        Route::post('/orders/{order_id}/mark-received', [ShipperController::class, 'markAsReceived']);
        Route::post('/orders/{order_id}/mark-delivered', [ShipperController::class, 'markAsDelivered']);
    });

    // Admin routes
    Route::prefix('admin')->group(function () {
        Route::get('/products', function () {
            return Inertia::render('Admin/Products/Index');
        })->name('admin.products');

        Route::get('/products/create', function () {
            return Inertia::render('Admin/Products/Create');
        })->name('admin.products.create');

        Route::get('/products/{id}/edit', function ($id) {
            return Inertia::render('Admin/Products/Edit', [
                'productId' => $id
            ]);
        })->name('admin.products.edit');

        Route::get('/categories', function () {
            return Inertia::render('Admin/Categories/Index');
        })->name('admin.categories');

        Route::get('/categories/create', function () {
            return Inertia::render('Admin/Categories/Create');
        })->name('admin.categories.create');

        Route::get('/categories/{id}/edit', function ($id) {
            return Inertia::render('Admin/Categories/Edit', [
                'categoryId' => $id
            ]);
        })->name('admin.categories.edit');

        Route::get('/vouchers', function () {
            return Inertia::render('Admin/Vouchers/Index');
        })->name('admin.vouchers');

        Route::get('/vouchers/create', function () {
            return Inertia::render('Admin/Vouchers/Create');
        })->name('admin.vouchers.create');

        Route::get('/vouchers/{id}/edit', function ($id) {
            return Inertia::render('Admin/Vouchers/Edit', [
                'voucherId' => $id
            ]);
        })->name('admin.vouchers.edit');

        Route::get('/orders', function () {
            return Inertia::render('Admin/Orders/Index');
        })->name('admin.orders');

        Route::get('/orders/{id}', function ($id) {
            return Inertia::render('Admin/Orders/Detail', [
                'orderId' => $id
            ]);
        })->name('admin.orders.detail');

        Route::get('/collections', function () {
            return Inertia::render('Admin/Collections/Index');
        })->name('admin.collections');

        Route::get('/collections/create', function () {
            return Inertia::render('Admin/Collections/Create');
        })->name('admin.collections.create');

        Route::get('/collections/{id}/edit', function ($id) {
            return Inertia::render('Admin/Collections/Edit', [
                'collectionId' => $id
            ]);
        })->name('admin.collections.edit');

        Route::get('/collections/{collectionId}/products/manage', function ($collectionId) {
            return Inertia::render('Admin/Collections/ManageProducts', [
                'collectionId' => $collectionId
            ]);
        })->name('admin.collections.products.manage');

        Route::get('/reports/sales', function () {
            return Inertia::render('Admin/Reports/Sales');
        })->name('admin.reports.sales');
    });

    // Admin order API routes
    Route::prefix('api')->group(function () {
        Route::get('/admin/orders', [App\Http\Controllers\Admin\OrderManageController::class, 'index']);
        Route::get('/admin/orders/{id}', [App\Http\Controllers\Admin\OrderManageController::class, 'show']);
        Route::put('/admin/orders/{id}/status', [App\Http\Controllers\Admin\OrderManageController::class, 'updateStatus']);
    });

    // Shipper dashboard routes
    Route::prefix('shipper')->group(function () {
        Route::get('/', function () {
            return Inertia::render('Shipper/Dashboard');
        })->name('shipper.dashboard');
        Route::get('/orders/delivering', function () {
            return Inertia::render('Shipper/Dashboard');
        })->name('shipper.orders.delivering');
        Route::get('/orders/delivered', function () {
            return Inertia::render('Shipper/Dashboard');
        })->name('shipper.orders.delivered');
        Route::get('/orders/{order_id}', function () {
            return Inertia::render('Shipper/OrderDetail', ['orderId' => request()->route('order_id')]);
        })->name('shipper.orders.detail');
    });
});

Route::get('/collections', function () {
    return Inertia::render('Collections/Index');
})->name('collections.index');

Route::get('/collections/{slug}', function ($slug) {
    return Inertia::render('Collections/Detail', [
        'slug' => $slug
    ]);
})->name('collections.detail');

require __DIR__ . '/auth.php';
