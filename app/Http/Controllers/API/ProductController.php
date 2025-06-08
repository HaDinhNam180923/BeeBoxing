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
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

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
            // Thêm xử lý tham số page một cách rõ ràng
            $page = $request->get('page', 1);
            $perPage = $request->get('per_page', 10);
            $products = $query->paginate($perPage, ['*'], 'page', $page);

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
            ])->findOrFail($id);

            // Đảm bảo specifications là JSON hợp lệ
            if (is_string($product->specifications)) {
                try {
                    $product->specifications = json_decode($product->specifications, true);
                } catch (\Exception $e) {
                    $product->specifications = [];
                }
            }

            // Xử lý dữ liệu trước khi trả về
            $product->final_price = $product->base_price * (1 - $product->discount / 100);

            // Tính tổng số lượng tồn kho
            $product->total_stock = $product->colors->sum(function ($color) {
                return $color->inventory->sum('stock_quantity');
            });
            $product->increment('view_count');

            // Đảm bảo mỗi màu có đầy đủ thông tin
            $product->colors->transform(function ($color) {
                $color->primary_image = $color->images->where('is_primary', true)->first();
                // Đảm bảo inventory được map đúng format
                $color->inventory = $color->inventory->map(function ($inv) {
                    return [
                        'inventory_id' => $inv->inventory_id,
                        'size' => $inv->size,
                        'stock_quantity' => (int)$inv->stock_quantity,
                        'price_adjustment' => (float)$inv->price_adjustment
                    ];
                });
                return $color;
            });

            // Log để debug
            Log::info('Product detail:', ['product' => $product->toArray()]);

            return response()->json([
                'status' => 'success',
                'message' => 'Product details retrieved successfully',
                'data' => $product
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error in getProductDetail:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve product details',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    public function getProductForEdit($id)
    {
        try {
            // Lấy thông tin sản phẩm với đầy đủ relationships
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
            ])->findOrFail($id);

            if (!empty($product->specifications) && is_string($product->specifications)) {
                $product->specifications = json_decode($product->specifications, true);
            } else {
                $product->specifications = [];
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Product retrieved successfully',
                'data' => $product
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve product',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function updateProduct(Request $request, $id)
    {
        // Validate request
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
            'colors.*.color_id' => 'nullable|exists:product_colors,color_id',
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

            // Update product basic info
            $product = Product::findOrFail($id);
            $product->update([
                'name' => $request->name,
                'description' => $request->description,
                'base_price' => $request->base_price,
                'category_id' => $request->category_id,
                'brand' => $request->brand,
                'discount' => $request->discount ?? 0,
                'specifications' => $request->specifications,
                'is_featured' => $request->is_featured ?? false
            ]);

            // Get existing color IDs
            $existingColorIds = $product->colors->pluck('color_id')->toArray();
            $updatedColorIds = collect($request->colors)
                ->pluck('color_id')
                ->filter()
                ->toArray();

            // Delete colors that are not in the update request
            $deletedColorIds = array_diff($existingColorIds, $updatedColorIds);
            if (!empty($deletedColorIds)) {
                ProductColor::whereIn('color_id', $deletedColorIds)->delete();
            }

            // Update or create colors and their sizes
            foreach ($request->colors as $colorData) {
                if (isset($colorData['color_id'])) {
                    // Update existing color
                    $color = ProductColor::find($colorData['color_id']);
                    $color->update([
                        'color_name' => $colorData['color_name'],
                        'color_code' => $colorData['color_code']
                    ]);
                } else {
                    // Create new color
                    $color = ProductColor::create([
                        'product_id' => $product->product_id,
                        'color_name' => $colorData['color_name'],
                        'color_code' => $colorData['color_code']
                    ]);
                }

                // Get existing size IDs for this color
                $existingSizeIds = $color->inventory->pluck('inventory_id')->toArray();

                // Create or update sizes
                $newSizeIds = [];
                foreach ($colorData['sizes'] as $sizeData) {
                    if (isset($sizeData['inventory_id'])) {
                        // Update existing size
                        ProductInventory::where('inventory_id', $sizeData['inventory_id'])
                            ->update([
                                'size' => $sizeData['size'],
                                'stock_quantity' => $sizeData['stock_quantity'],
                                'price_adjustment' => $sizeData['price_adjustment'] ?? 0
                            ]);
                        $newSizeIds[] = $sizeData['inventory_id'];
                    } else {
                        // Create new size
                        $inventory = ProductInventory::create([
                            'color_id' => $color->color_id,
                            'size' => $sizeData['size'],
                            'stock_quantity' => $sizeData['stock_quantity'],
                            'price_adjustment' => $sizeData['price_adjustment'] ?? 0
                        ]);
                        $newSizeIds[] = $inventory->inventory_id;
                    }
                }

                // Delete sizes that are not in the update
                $deletedSizeIds = array_diff($existingSizeIds, $newSizeIds);
                if (!empty($deletedSizeIds)) {
                    ProductInventory::whereIn('inventory_id', $deletedSizeIds)->delete();
                }
            }

            DB::commit();

            // Load updated data with relationships
            $product->load(['colors.inventory', 'colors.images']);

            return response()->json([
                'status' => 'success',
                'message' => 'Product updated successfully',
                'data' => $product
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update product',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Thêm method trong ProductController
    public function testProductDetail($id)
    {
        $result = [
            'basic_info' => Product::find($id),
            'colors' => Product::find($id)->colors,
            'specifications' => Product::find($id)->specifications,
            'raw_data' => DB::select('SELECT * FROM products WHERE product_id = ?', [$id])
        ];

        return response()->json($result);
    }

    // Thêm phương thức này vào ProductController.php

    /**
     * Lấy thông tin các sản phẩm đã xem gần đây dựa trên danh sách ID
     */
    public function getRecentlyViewedProducts(Request $request)
    {
        try {
            $productIds = explode(',', $request->input('ids', ''));

            if (empty($productIds)) {
                return response()->json([
                    'status' => true,
                    'data' => []
                ]);
            }

            // Lấy thông tin sản phẩm từ database với cấu trúc dữ liệu đầy đủ
            $products = Product::whereIn('product_id', $productIds)
                ->where('is_active', true)
                ->with([
                    'colors' => function ($query) {
                        $query->with(['images' => function ($q) {
                            $q->orderBy('is_primary', 'desc')
                                ->orderBy('display_order');
                        }]);
                    }
                ])
                ->get();

            // Chuẩn hóa dữ liệu để phù hợp với ProductCard
            foreach ($products as $product) {
                foreach ($product->colors as $color) {
                    // Thêm primary_image vào mỗi color
                    if ($color->images && count($color->images) > 0) {
                        $primaryImage = $color->images->where('is_primary', true)->first();
                        // Nếu không có hình ảnh chính, sử dụng hình ảnh đầu tiên
                        $color->primary_image = $primaryImage ?: $color->images->first();
                    }
                }

                // Tính giá sau khi giảm giá
                $product->final_price = $product->base_price * (1 - $product->discount / 100);
            }

            // Sắp xếp sản phẩm theo thứ tự ID đã truyền vào
            $orderedProducts = collect($productIds)
                ->map(function ($id) use ($products) {
                    return $products->firstWhere('product_id', $id);
                })
                ->filter();

            return response()->json([
                'status' => true,
                'data' => $orderedProducts
            ]);
        } catch (\Exception $e) {
            Log::error('Lỗi khi lấy sản phẩm đã xem gần đây: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Đã xảy ra lỗi khi lấy sản phẩm',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getAlsoBoughtProducts($productId, Request $request)
    {
        try {
            // Kiểm tra và giới hạn tham số limit (1 đến 50)
            $limit = min(max((int)$request->input('limit', 12), 1), 50);

            // Tạo key cache dựa trên productId và limit
            $cacheKey = "also_bought_products_{$productId}_{$limit}";

            // Lấy dữ liệu từ cache hoặc tính toán mới
            $products = Cache::remember($cacheKey, now()->addHours(1), function () use ($productId, $limit) {
                // Bước 1: Tìm các đơn hàng chứa sản phẩm mục tiêu
                $ordersWithProduct = DB::table('order_details as od1')
                    ->select('od1.order_id')
                    ->join('product_inventory as pi1', 'od1.inventory_id', '=', 'pi1.inventory_id')
                    ->join('product_colors as pc1', 'pi1.color_id', '=', 'pc1.color_id')
                    ->where('pc1.product_id', $productId)
                    ->distinct()
                    ->pluck('order_id');

                // Nếu không có đơn hàng, lấy sản phẩm thay thế
                if ($ordersWithProduct->isEmpty()) {
                    return $this->getFallbackProducts($productId, $limit);
                }

                // Bước 2: Tìm các sản phẩm khác trong các đơn hàng đó
                $alsoBoughtProducts = DB::table('order_details as od')
                    ->select('pc.product_id', DB::raw('COUNT(*) as frequency'))
                    ->join('product_inventory as pi', 'od.inventory_id', '=', 'pi.inventory_id')
                    ->join('product_colors as pc', 'pi.color_id', '=', 'pc.color_id')
                    ->join('products as p', 'pc.product_id', '=', 'p.product_id')
                    ->whereIn('od.order_id', $ordersWithProduct)
                    ->where('pc.product_id', '!=', $productId)
                    ->where('p.is_active', true)
                    ->groupBy('pc.product_id')
                    ->orderByDesc('frequency')
                    ->take($limit)
                    ->pluck('product_id');

                // Nếu không có sản phẩm liên quan, lấy sản phẩm thay thế
                if ($alsoBoughtProducts->isEmpty()) {
                    return $this->getFallbackProducts($productId, $limit);
                }

                // Bước 3: Lấy thông tin chi tiết sản phẩm
                $products = Product::whereIn('product_id', $alsoBoughtProducts)
                    ->where('is_active', true)
                    ->with([
                        'colors' => function ($query) {
                            $query->with(['images' => function ($q) {
                                $q->orderBy('is_primary', 'desc')
                                    ->orderBy('display_order');
                            }]);
                        }
                    ])
                    ->get();

                // Bước 4: Chuẩn hóa dữ liệu
                foreach ($products as $product) {
                    foreach ($product->colors as $color) {
                        // Thêm primary_image, dùng ảnh mặc định nếu không có
                        $primaryImage = $color->images->where('is_primary', true)->first();
                        $color->primary_image = $primaryImage
                            ?: ($color->images->first() ?: ['image_url' => '/storage/products/default.jpg']);
                    }
                    // Tính giá sau giảm giá
                    $product->final_price = $product->base_price * (1 - $product->discount / 100);
                }

                // Sắp xếp theo thứ tự tần suất
                return collect($alsoBoughtProducts)
                    ->map(function ($id) use ($products) {
                        return $products->firstWhere('product_id', $id);
                    })
                    ->filter()
                    ->values();
            });

            return response()->json([
                'status' => true,
                'data' => $products
            ], 200);
        } catch (\Exception $e) {
            Log::error('Lỗi khi lấy sản phẩm người dùng cũng mua: ' . $e->getMessage(), [
                'product_id' => $productId,
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'status' => false,
                'message' => 'Đã xảy ra lỗi khi lấy sản phẩm',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Lấy sản phẩm thay thế (phổ biến trong cùng danh mục) nếu không có sản phẩm liên quan
     *
     * @param int $productId ID của sản phẩm
     * @param int $limit Số lượng sản phẩm cần lấy
     * @return \Illuminate\Support\Collection
     */
    private function getFallbackProducts($productId, $limit)
    {
        $product = Product::find($productId);
        if (!$product) {
            return collect([]);
        }

        $products = Product::where('category_id', $product->category_id)
            ->where('is_active', true)
            ->where('product_id', '!=', $productId)
            ->orderBy('view_count', 'desc')
            ->take($limit)
            ->with([
                'colors' => function ($query) {
                    $query->with(['images' => function ($q) {
                        $q->orderBy('is_primary', 'desc')
                            ->orderBy('display_order');
                    }]);
                }
            ])
            ->get();

        foreach ($products as $product) {
            foreach ($product->colors as $color) {
                $primaryImage = $color->images->where('is_primary', true)->first();
                $color->primary_image = $primaryImage
                    ?: ($color->images->first() ?: ['image_url' => '/storage/products/default.jpg']);
            }
            $product->final_price = $product->base_price * (1 - $product->discount / 100);
        }

        return $products;
    }
}
