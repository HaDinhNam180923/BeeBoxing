<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Collection;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class CollectionManageController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = Collection::with(['products' => function ($query) {
                $query->select('products.product_id', 'name', 'base_price', 'discount')
                    ->where('is_active', true);
            }])->withCount('products');

            if ($request->filled('search')) {
                $search = $request->search;
                $query->where('name', 'like', "%{$search}%");
            }

            if ($request->has('status') && in_array($request->status, ['true', 'false'])) {
                $query->where('is_active', $request->boolean('status'));
            }

            $collections = $query->orderBy('display_order')->get();

            Log::info('Collections fetched', [
                'count' => $collections->count(),
                'request' => $request->all()
            ]);

            return response()->json([
                'status' => true,
                'data' => $collections
            ]);
        } catch (\Exception $e) {
            Log::error('Lỗi khi lấy danh sách bộ sưu tập: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Lỗi khi lấy danh sách bộ sưu tập',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $collection = Collection::with(['products' => function ($query) {
                $query->where('is_active', true)
                    ->with(['colors' => function ($q) {
                        $q->with(['images' => function ($q) {
                            $q->where('is_primary', true);
                        }]);
                    }]);
            }])->withCount('products')->findOrFail($id);

            return response()->json([
                'status' => true,
                'data' => $collection
            ]);
        } catch (\Exception $e) {
            Log::error('Lỗi khi lấy chi tiết bộ sưu tập: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Lỗi khi lấy chi tiết bộ sưu tập',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'description' => 'nullable|string',
                'image' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
                'is_active' => 'boolean',
                'display_order' => 'integer|min:0',
                'products' => 'nullable|array',
                'products.*.product_id' => 'exists:products,product_id',
                'products.*.display_order' => 'integer|min:0'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => false,
                    'errors' => $validator->errors()
                ], 422);
            }

            DB::beginTransaction();

            $imagePath = null;
            if ($request->hasFile('image')) {
                $image = $request->file('image');
                $imageName = time() . '.' . $image->getClientOriginalExtension();
                $image->storeAs('public/collections', $imageName);
                $imagePath = '/storage/collections/' . $imageName;
            }

            $slug = Str::slug($request->name);
            $baseSlug = $slug;
            $counter = 1;
            while (Collection::where('slug', $slug)->exists()) {
                $slug = $baseSlug . '-' . $counter;
                $counter++;
            }

            $collection = Collection::create([
                'name' => $request->name,
                'description' => $request->description,
                'image_url' => $imagePath,
                'is_active' => $request->is_active ?? true,
                'display_order' => $request->display_order ?? 0,
                'slug' => $slug
            ]);

            if ($request->has('products') && is_array($request->products)) {
                $productData = [];
                foreach ($request->products as $product) {
                    $productData[$product['product_id']] = [
                        'display_order' => $product['display_order'] ?? 0
                    ];
                }
                $collection->products()->attach($productData);
            }

            DB::commit();

            return response()->json([
                'status' => true,
                'message' => 'Tạo bộ sưu tập thành công',
                'data' => $collection
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Lỗi khi tạo bộ sưu tập: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Lỗi khi tạo bộ sưu tập',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'description' => 'nullable|string',
                'image' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
                'is_active' => 'boolean',
                'display_order' => 'integer|min:0',
                'products' => 'nullable|array',
                'products.*.product_id' => 'exists:products,product_id',
                'products.*.display_order' => 'integer|min:0'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => false,
                    'errors' => $validator->errors()
                ], 422);
            }

            DB::beginTransaction();

            $collection = Collection::findOrFail($id);

            if ($request->hasFile('image')) {
                if ($collection->image_url) {
                    $oldPath = str_replace('/storage', 'public', $collection->image_url);
                    if (Storage::exists($oldPath)) {
                        Storage::delete($oldPath);
                    }
                }

                $image = $request->file('image');
                $imageName = time() . '.' . $image->getClientOriginalExtension();
                $image->storeAs('public/collections', $imageName);
                $collection->image_url = '/storage/collections/' . $imageName;
            }

            if ($collection->name !== $request->name) {
                $slug = Str::slug($request->name);
                $baseSlug = $slug;
                $counter = 1;
                while (Collection::where('slug', $slug)->where('collection_id', '!=', $id)->exists()) {
                    $slug = $baseSlug . '-' . $counter;
                    $counter++;
                }
                $collection->slug = $slug;
            }

            $collection->name = $request->name;
            $collection->description = $request->description;
            $collection->is_active = $request->has('is_active') ? $request->is_active : true;
            $collection->display_order = $request->display_order ?? 0;
            $collection->save();

            if ($request->has('products')) {
                $productData = [];
                foreach ($request->products as $product) {
                    $productData[$product['product_id']] = [
                        'display_order' => $product['display_order'] ?? 0
                    ];
                }
                $collection->products()->sync($productData);
            }

            DB::commit();

            return response()->json([
                'status' => true,
                'message' => 'Cập nhật bộ sưu tập thành công',
                'data' => $collection
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Lỗi khi cập nhật bộ sưu tập: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Lỗi khi cập nhật bộ sưu tập',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            DB::beginTransaction();

            $collection = Collection::findOrFail($id);

            if ($collection->image_url) {
                $imagePath = str_replace('/storage', 'public', $collection->image_url);
                if (Storage::exists($imagePath)) {
                    Storage::delete($imagePath);
                }
            }

            $collection->products()->detach();
            $collection->delete();

            DB::commit();

            return response()->json([
                'status' => true,
                'message' => 'Xóa bộ sưu tập thành công'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Lỗi khi xóa bộ sưu tập: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Lỗi khi xóa bộ sưu tập',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function toggleStatus($id)
    {
        try {
            $collection = Collection::findOrFail($id);
            $collection->is_active = !$collection->is_active;
            $collection->save();

            return response()->json([
                'status' => true,
                'message' => 'Cập nhật trạng thái bộ sưu tập thành công',
                'data' => [
                    'is_active' => $collection->is_active
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Lỗi khi cập nhật trạng thái bộ sưu tập: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Lỗi khi cập nhật trạng thái bộ sưu tập',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function manageProducts(Request $request, $id)
    {
        try {
            $validator = Validator::make($request->all(), [
                'products' => 'required|array',
                'products.*.product_id' => 'required|exists:products,product_id',
                'products.*.display_order' => 'integer|min:0'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => false,
                    'errors' => $validator->errors()
                ], 422);
            }

            DB::beginTransaction();

            $collection = Collection::findOrFail($id);

            $productData = [];
            foreach ($request->products as $product) {
                $productData[$product['product_id']] = [
                    'display_order' => $product['display_order'] ?? 0
                ];
            }

            $collection->products()->sync($productData);

            DB::commit();

            return response()->json([
                'status' => true,
                'message' => 'Cập nhật sản phẩm trong bộ sưu tập thành công'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Lỗi khi cập nhật sản phẩm trong bộ sưu tập: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Lỗi khi cập nhật sản phẩm trong bộ sưu tập',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getProductsForSelection(Request $request)
    {
        try {
            $query = Product::where('is_active', true);

            if ($request->has('search')) {
                $search = $request->search;
                $query->where('name', 'like', "%{$search}%");
            }

            if ($request->has('category_id')) {
                $query->where('category_id', $request->category_id);
            }

            $products = $query->select('product_id', 'name', 'base_price', 'discount')
                ->with(['colors' => function ($q) {
                    $q->with(['images' => function ($q) {
                        $q->where('is_primary', true)->orderBy('display_order'); // Bỏ ->first()
                    }]);
                }])
                ->paginate(10);

            return response()->json([
                'status' => true,
                'data' => $products
            ]);
        } catch (\Exception $e) {
            Log::error('Lỗi khi lấy danh sách sản phẩm: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Lỗi khi lấy danh sách sản phẩm',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
