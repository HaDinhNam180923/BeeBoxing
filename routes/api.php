<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\ProductController;  // Đảm bảo namespace chính xác
use App\Http\Controllers\API\CategoryController;



//product
Route::post('/product/create', [ProductController::class, 'createProduct']);
Route::post('/product/images/create', [ProductController::class, 'createProductImages']);
Route::delete('/product/delete/{id}', [ProductController::class, 'deleteProduct']);
Route::get('/products', [ProductController::class, 'getProducts']);
Route::get('products/{id}', [ProductController::class, 'getProductDetail']);



//category
Route::get('/categories', [CategoryController::class, 'getCategories']);
