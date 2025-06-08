<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\ProductController;  // Đảm bảo namespace chính xác
// use App\Http\Controllers\API\CategoryController;
use App\Http\Controllers\Admin\CategoryController;
// use App\Http\Controllers\API\VoucherController;
use App\Http\Controllers\Admin\VoucherController;
use App\Http\Controllers\Admin\OrderManageController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\API\SlideController;

use App\Http\Controllers\Admin\SalesReportController;


// Route để lấy sản phẩm đã xem gần đây
Route::get('/products/recently-viewed', [ProductController::class, 'getRecentlyViewedProducts']);
// Slide routes - public endpoints
Route::get('/slides', [SlideController::class, 'getSlides']);
Route::get('/slides/{id}', [SlideController::class, 'show']);

// Admin slide management routes - protected endpoints
Route::middleware(['auth'])->group(function () {
    Route::post('/admin/slides', [SlideController::class, 'store']);
    Route::post('/admin/slides/{id}', [SlideController::class, 'update']);
    Route::delete('/admin/slides/{id}', [SlideController::class, 'destroy']);
});
// Thêm vào nhóm route middleware(['auth']) trong file api.php

// Category API
Route::prefix('admin/categories')->group(function () {
    Route::get('/', [CategoryController::class, 'index']);
    Route::get('/parent-options', [CategoryController::class, 'getParentOptions']);
    Route::post('/', [CategoryController::class, 'store']);
    Route::get('/{id}', [CategoryController::class, 'show']);
    Route::post('/{id}', [CategoryController::class, 'update']);
    Route::delete('/{id}', [CategoryController::class, 'destroy']);
    Route::patch('/{id}/toggle-status', [CategoryController::class, 'toggleStatus']);
});

// Voucher API
Route::prefix('admin/vouchers')->group(function () {
    Route::get('/', [VoucherController::class, 'index']);
    Route::post('/', [VoucherController::class, 'store']);
    Route::get('/{id}', [VoucherController::class, 'show']);
    Route::put('/{id}', [VoucherController::class, 'update']);
    Route::delete('/{id}', [VoucherController::class, 'destroy']);
    Route::patch('/{id}/toggle-status', [VoucherController::class, 'toggleStatus']);
});

// User search API (for assigning vouchers to specific users)
Route::get('admin/users/search', [UserController::class, 'search']);

//product
Route::post('/product/create', [ProductController::class, 'createProduct']);
Route::post('/product/images/create', [ProductController::class, 'createProductImages']);
Route::delete('/product/delete/{id}', [ProductController::class, 'deleteProduct']);
Route::get('/products', [ProductController::class, 'getProducts']);
Route::get('products/{id}', [ProductController::class, 'getProductDetail']);
// Thêm vào nhóm routes API hiện có
Route::get('/product/{id}', [ProductController::class, 'getProductForEdit']);
Route::post('/product/{id}/update', [ProductController::class, 'updateProduct']);
Route::get('/products/{id}/also-bought', [ProductController::class, 'getAlsoBoughtProducts']);

//category
Route::get('/categories', [CategoryController::class, 'getCategories']);
// Thêm route mới trong api.php
Route::get('/product/{id}/test', [ProductController::class, 'testProductDetail']);


Route::middleware('auth')->group(function () {
    // Thêm prefix 'api' vào routes để match với đường dẫn frontend đang gọi
    Route::prefix('api')->group(function () {
        Route::get('/admin/orders', [App\Http\Controllers\Admin\OrderManageController::class, 'index']);
        Route::get('/admin/orders/{id}', [App\Http\Controllers\Admin\OrderManageController::class, 'show']);
        Route::put('/admin/orders/{id}/status', [App\Http\Controllers\Admin\OrderManageController::class, 'updateStatus']);
    });
});

// Admin Collection routes
Route::prefix('admin/collections')->group(function () {
    Route::get('/', [\App\Http\Controllers\Admin\CollectionManageController::class, 'index']);
    Route::post('/', [\App\Http\Controllers\Admin\CollectionManageController::class, 'store']);
    Route::get('/{id}', [\App\Http\Controllers\Admin\CollectionManageController::class, 'show']);
    Route::post('/{id}', [\App\Http\Controllers\Admin\CollectionManageController::class, 'update']);
    Route::delete('/{id}', [\App\Http\Controllers\Admin\CollectionManageController::class, 'destroy']);
    Route::patch('/{id}/toggle-status', [\App\Http\Controllers\Admin\CollectionManageController::class, 'toggleStatus']);
    Route::post('/{id}/products', [\App\Http\Controllers\Admin\CollectionManageController::class, 'manageProducts']);
    Route::get('/products/selection', [\App\Http\Controllers\Admin\CollectionManageController::class, 'getProductsForSelection']);
});

// Public Collection routes
Route::get('/collections', [\App\Http\Controllers\API\CollectionController::class, 'getCollections']);
Route::get('/collections/featured', [\App\Http\Controllers\API\CollectionController::class, 'getFeaturedCollections']);
Route::get('/collections/{slug}', [\App\Http\Controllers\API\CollectionController::class, 'getCollectionDetail']);

// Route doanh số
Route::prefix('admin/sales')->group(function () {
    Route::get('/overview', [SalesReportController::class, 'getOverview']);
    Route::get('/daily', [SalesReportController::class, 'getDailyReport']);
});
