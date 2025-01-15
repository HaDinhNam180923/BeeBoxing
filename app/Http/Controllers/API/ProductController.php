<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Product;
use App\Models\ProductColor;
use App\Models\ProductImage;
use App\Models\ProductInventory;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;


class ProductController extends Controller
{
    public function createProduct(Request $request)
    {
        // Validate basic product information
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'base_price' => 'required|numeric|min:0',
            'category_id' => 'required|exists:categories,category_id',
            'brand' => 'required|string|max:255',
            'discount' => 'nullable|numeric|min:0|max:100',
            'specifications' => 'nullable|json',
            'is_featured' => 'boolean',
            'colors' => 'required|array|min:1',
            'colors.*.color_name' => 'required|string|max:255',
            'colors.*.color_code' => 'required|string|max:255',
            'colors.*.sizes' => 'required|array|min:1',
            'colors.*.sizes.*.size' => 'required|string|max:255',
            'colors.*.sizes.*.stock_quantity' => 'required|integer|min:0',
            'colors.*.sizes.*.price_adjustment' => 'nullable|numeric'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            // Create product
            $product = Product::create([
                'name' => $request->name,
                'description' => $request->description,
                'base_price' => $request->base_price,
                'category_id' => $request->category_id,
                'brand' => $request->brand,
                'discount' => $request->discount ?? 0,
                'specifications' => $request->specifications,
                'is_featured' => $request->is_featured ?? false,
                'is_active' => true,
                'view_count' => 0
            ]);

            // Create colors and inventory
            foreach ($request->colors as $colorData) {
                $color = ProductColor::create([
                    'product_id' => $product->product_id,
                    'color_name' => $colorData['color_name'],
                    'color_code' => $colorData['color_code']
                ]);

                // Create inventory for each size
                foreach ($colorData['sizes'] as $sizeData) {
                    ProductInventory::create([
                        'color_id' => $color->color_id,
                        'size' => $sizeData['size'],
                        'stock_quantity' => $sizeData['stock_quantity'],
                        'price_adjustment' => $sizeData['price_adjustment'] ?? 0
                    ]);
                }
            }

            DB::commit();

            // Load relationships for response
            $product->load(['colors.inventory']);

            return response()->json([
                'status' => 'success',
                'message' => 'Product created successfully',
                'data' => $product
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to create product',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    public function createProductImages(Request $request)
    {
        // Validate request
        $validator = Validator::make($request->all(), [
            'color_id' => 'required|exists:product_colors,color_id',
            'images' => 'required|array|min:1',
            'is_primary' => 'required|array|min:1',
            'alt_text' => 'nullable|array',
            'display_order' => 'required|array|min:1',
            'images.*' => 'required|image|mimes:jpeg,png,jpg|max:2048',
            'is_primary.*' => 'required|boolean',
            'alt_text.*' => 'nullable|string|max:255',
            'display_order.*' => 'required|integer|min:0'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            $uploadedImages = [];
            $images = $request->file('images');

            foreach ($images as $index => $image) {
                // Generate unique filename
                $filename = uniqid() . '_' . time() . '.' . $image->getClientOriginalExtension();

                // Store image in public/products directory
                $path = $image->storeAs('products', $filename);

                // Create image record
                $productImage = ProductImage::create([
                    'color_id' => $request->color_id,
                    'image_url' => '/storage/products/' . $filename,
                    'is_primary' => $request->is_primary[$index],
                    'alt_text' => $request->alt_text[$index] ?? null,
                    'display_order' => $request->display_order[$index]
                ]);

                $uploadedImages[] = $productImage;
            }

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Product images uploaded successfully',
                'data' => $uploadedImages
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();

            // Delete any uploaded files if transaction failed
            foreach ($uploadedImages as $image) {
                Storage::delete(str_replace('/storage', 'public', $image->image_url));
            }

            return response()->json([
                'status' => 'error',
                'message' => 'Failed to upload product images',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    public function deleteProduct($id)
    {
        try {
            DB::beginTransaction();

            // Find the product with its related data
            $product = Product::with(['colors.images', 'colors.inventory'])
                ->where('product_id', $id)
                ->first();

            if (!$product) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Product not found'
                ], 404);
            }

            // Store image paths to delete later
            $imagePaths = [];
            foreach ($product->colors as $color) {
                foreach ($color->images as $image) {
                    // Convert URL to storage path
                    $imagePaths[] = str_replace('/storage', 'public', $image->image_url);
                }
            }

            // Delete product (this will cascade delete related records due to foreign key constraints)
            $product->delete();

            // After successful database deletion, delete physical image files
            foreach ($imagePaths as $path) {
                if (Storage::exists($path)) {
                    Storage::delete($path);
                }
            }

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Product deleted successfully'
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'status' => 'error',
                'message' => 'Failed to delete product',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    public function getProducts(Request $request)
    {
        try {
            // Build query with relationships
            $query = Product::with([
                'category',
                'colors' => function ($query) {
                    $query->orderBy('color_name');
                },
                'colors.images' => function ($query) {
                    $query->orderBy('display_order');
                },
                'colors.inventory' => function ($query) {
                    $query->orderBy('size');
                }
            ]);

            // Apply filters if provided
            if ($request->has('category_id')) {
                $query->where('category_id', $request->category_id);
            }

            if ($request->has('brand')) {
                $query->where('brand', 'like', '%' . $request->brand . '%');
            }

            if ($request->has('price_from')) {
                $query->where('base_price', '>=', $request->price_from);
            }

            if ($request->has('price_to')) {
                $query->where('base_price', '<=', $request->price_to);
            }

            if ($request->has('is_featured')) {
                $query->where('is_featured', $request->boolean('is_featured'));
            }

            if ($request->has('is_active')) {
                $query->where('is_active', $request->boolean('is_active'));
            }

            // Search by name
            if ($request->has('search')) {
                $query->where('name', 'like', '%' . $request->search . '%');
            }

            // Sorting
            $sortField = $request->get('sort_by', 'created_at');
            $sortDirection = $request->get('sort_direction', 'desc');
            $allowedSortFields = ['name', 'base_price', 'created_at', 'view_count'];

            if (in_array($sortField, $allowedSortFields)) {
                $query->orderBy($sortField, $sortDirection);
            }

            // Pagination
            $perPage = $request->get('per_page', 10);
            $products = $query->paginate($perPage);

            $items = collect($products->items())->map(function ($product) {
                $product->final_price = $product->base_price * (1 - $product->discount / 100);

                // Add stock information  
                $product->total_stock = $product->colors->sum(function ($color) {
                    return $color->inventory->sum('stock_quantity');
                });

                // Add primary image for each color
                $product->colors->transform(function ($color) {
                    $color->primary_image = $color->images->where('is_primary', true)->first();
                    return $color;
                });

                return $product;
            });

            // Cập nhật lại items trong response
            return response()->json([
                'status' => 'success',
                'message' => 'Products retrieved successfully',
                'data' => [
                    'products' => $items,
                    'pagination' => [
                        'current_page' => $products->currentPage(),
                        'per_page' => $products->perPage(),
                        'total' => $products->total(),
                        'last_page' => $products->lastPage()
                    ]
                ]
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve products',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    public function getProductDetail($id)
    {
        try {
            // Tìm sản phẩm với các relationships
            $product = Product::with([
                'category',
                'colors' => function ($query) {
                    $query->orderBy('color_name');
                },
                'colors.images' => function ($query) {
                    $query->orderBy('display_order');
                },
                'colors.inventory' => function ($query) {
                    $query->orderBy('size');
                }
            ])->find($id);

            // Kiểm tra nếu không tìm thấy sản phẩm
            if (!$product) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Product not found'
                ], 404);
            }

            // Tính toán giá cuối cùng sau khi giảm giá
            $product->final_price = $product->base_price * (1 - $product->discount / 100);

            // Tính tổng số lượng tồn kho
            $product->total_stock = $product->colors->sum(function ($color) {
                return $color->inventory->sum('stock_quantity');
            });

            // Thêm primary image cho mỗi màu
            $product->colors->transform(function ($color) {
                $color->primary_image = $color->images->where('is_primary', true)->first();
                return $color;
            });

            // Tăng số lượt xem
            $product->increment('view_count');

            return response()->json([
                'status' => 'success',
                'message' => 'Product details retrieved successfully',
                'data' => $product
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve product details',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
