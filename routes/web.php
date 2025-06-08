<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\API\CartController;
use App\Http\Controllers\API\AddressController;
use App\Http\Controllers\API\OrderController;
// use App\Http\Controllers\API\VoucherController;
use App\Http\Controllers\Admin\VoucherController;
use Illuminate\Http\Request;
use App\Models\Order;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\API\ReviewController;

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

Route::middleware('auth')->prefix('admin')->group(function () {
    Route::get('/products', function () {
        return Inertia::render('Admin/Products/Index');
    })->name('admin.products');

    Route::get('/products/create', function () {
        return Inertia::render('Admin/Products/Create');
    })->name('admin.products.create');
    // Thêm route mới cho trang edit
    Route::get('/products/{id}/edit', function ($id) {
        return Inertia::render('Admin/Products/Edit', [
            'productId' => $id
        ]);
    })->name('admin.products.edit');
    // Thêm vào nhóm route middleware('auth')->prefix('admin') trong file web.php

    // Route cho danh mục
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

    // Route cho voucher
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
});
Route::middleware(['auth'])->group(function () {
    // Add inside the authenticated routes group
    Route::get('/api/orders', [OrderController::class, 'getOrderHistory']);
    Route::get('/api/orders/{id}', [OrderController::class, 'getOrderDetail']);
    Route::post('/api/orders/{id}/cancel', [OrderController::class, 'cancelOrder']);
    Route::post('/api/orders/{id}/confirm-delivery', [OrderController::class, 'confirmDelivery']);
    Route::get('/orders', function () {
        return Inertia::render('Orders/Index');
    })->name('orders.index');

    Route::get('/orders/{id}', function ($id) {
        return Inertia::render('Orders/Detail', [
            'orderId' => $id
        ]);
    })->name('orders.detail');
});

// Thêm vào trong nhóm route có middleware auth
Route::middleware(['auth'])->group(function () {
    // Review routes
    Route::prefix('api/reviews')->group(function () {
        Route::post('/', [ReviewController::class, 'store']);
        Route::get('/user', [ReviewController::class, 'getUserReviews']);
        Route::get('/product/{productId}', [ReviewController::class, 'getProductReviews']);
        Route::put('/{reviewId}', [ReviewController::class, 'update']);
        Route::delete('/{reviewId}', [ReviewController::class, 'destroy']);
    });
});

Route::middleware('auth')->prefix('admin')->group(function () {
    // Các route hiện có

    // Route cho quản lý đơn hàng
    Route::get('/orders', function () {
        return Inertia::render('Admin/Orders/Index');
    })->name('admin.orders');

    Route::get('/orders/{id}', function ($id) {
        return Inertia::render('Admin/Orders/Detail', [
            'orderId' => $id
        ]);
    })->name('admin.orders.detail');
});
// Trong file web.php, thêm routes cho admin orders
Route::middleware('auth')->prefix('api')->group(function () {
    Route::get('/admin/orders', [App\Http\Controllers\Admin\OrderManageController::class, 'index']);
    Route::get('/admin/orders/{id}', [App\Http\Controllers\Admin\OrderManageController::class, 'show']);
    Route::put('/admin/orders/{id}/status', [App\Http\Controllers\Admin\OrderManageController::class, 'updateStatus']);
});

// Frontend Collection routes
Route::get('/collections', function () {
    return Inertia::render('Collections/Index');
})->name('collections.index');

Route::get('/collections/{slug}', function ($slug) {
    return Inertia::render('Collections/Detail', [
        'slug' => $slug
    ]);
})->name('collections.detail');

Route::middleware('auth')->prefix('admin')->group(function () {
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
});

Route::middleware('auth')->prefix('admin')->group(function () {
    Route::get('/reports/sales', function () {
        return Inertia::render('Admin/Reports/Sales');
    })->name('admin.reports.sales');
});

require __DIR__ . '/auth.php';
