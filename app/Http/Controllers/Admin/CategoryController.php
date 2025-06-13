<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class CategoryController extends Controller
{
    public function index(Request $request)
    {
        try {
            Log::info('Bắt đầu lấy danh sách danh mục');

            $query = Category::whereNull('parent_category_id')
                ->with(['children' => function ($query) {
                    $query->with('children');
                }]);

            if ($request->has('search')) {
                $search = $request->search;
                $query->where('name', 'like', "%{$search}%");
            }

            $categories = $query->orderBy('display_order')->get();

            Log::info('Số lượng danh mục: ' . $categories->count());

            return response()->json([
                'status' => true,
                'data' => $categories
            ]);
        } catch (\Exception $e) {
            Log::error('Lỗi khi lấy danh sách danh mục: ' . $e->getMessage());
            Log::error('Chi tiết lỗi: ' . $e->getTraceAsString());

            return response()->json([
                'status' => false,
                'message' => 'Lỗi khi lấy danh sách danh mục',
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ], 500);
        }
    }

    public function getParentOptions()
    {
        try {
            $categories = Category::where('is_active', true)
                ->with(['children' => function ($query) {
                    $query->with('children');
                }])
                ->whereNull('parent_category_id')
                ->orderBy('display_order')
                ->get();

            return response()->json([
                'status' => true,
                'data' => $categories
            ]);
        } catch (\Exception $e) {
            Log::error('Lỗi khi lấy danh sách danh mục cha: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Lỗi khi lấy danh sách danh mục cha',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $category = Category::findOrFail($id);

            return response()->json([
                'status' => true,
                'data' => $category
            ]);
        } catch (\Exception $e) {
            Log::error('Lỗi khi lấy thông tin danh mục: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Lỗi khi lấy thông tin danh mục',
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
                'parent_category_id' => 'nullable|exists:categories,category_id',
                'display_order' => 'integer|min:0',
                'is_active' => 'boolean',
                'meta_title' => 'nullable|string|max:255',
                'meta_description' => 'nullable|string',
                'image' => 'nullable|image|mimes:jpeg,png,jpg|max:2048'
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
                $image->storeAs('public/categories', $imageName);
                $imagePath = '/storage/categories/' . $imageName;
            }

            $level = 0;
            if ($request->parent_category_id) {
                $parentCategory = Category::find($request->parent_category_id);
                if ($parentCategory) {
                    $level = $parentCategory->level + 1;
                }
            }

            $category = Category::create([
                'name' => $request->name,
                'description' => $request->description,
                'parent_category_id' => $request->parent_category_id,
                'display_order' => $request->display_order ?? 0,
                'is_active' => $request->is_active ?? true,
                'level' => $level,
                'meta_title' => $request->meta_title,
                'meta_description' => $request->meta_description,
                'image_url' => $imagePath
            ]);

            DB::commit();

            return response()->json([
                'status' => true,
                'message' => 'Tạo danh mục thành công',
                'data' => $category
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Lỗi khi tạo danh mục: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Lỗi khi tạo danh mục',
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
                'parent_category_id' => 'nullable|exists:categories,category_id',
                'display_order' => 'integer|min:0',
                'is_active' => 'boolean',
                'meta_title' => 'nullable|string|max:255',
                'meta_description' => 'nullable|string',
                'image' => 'nullable|image|mimes:jpeg,png,jpg|max:2048'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => false,
                    'errors' => $validator->errors()
                ], 422);
            }

            DB::beginTransaction();

            $category = Category::findOrFail($id);

            if ($request->parent_category_id) {
                $isValidParent = !$this->isChildCategory($id, $request->parent_category_id);

                if (!$isValidParent || $request->parent_category_id == $id) {
                    return response()->json([
                        'status' => false,
                        'message' => 'Danh mục cha không hợp lệ'
                    ], 422);
                }
            }

            if ($request->hasFile('image')) {
                if ($category->image_url) {
                    $oldPath = str_replace('/storage', 'public', $category->image_url);
                    if (Storage::exists($oldPath)) {
                        Storage::delete($oldPath);
                    }
                }

                $image = $request->file('image');
                $imageName = time() . '.' . $image->getClientOriginalExtension();
                $image->storeAs('public/categories', $imageName);
                $category->image_url = '/storage/categories/' . $imageName;
            }

            $level = 0;
            if ($request->parent_category_id) {
                $parentCategory = Category::find($request->parent_category_id);
                if ($parentCategory) {
                    $level = $parentCategory->level + 1;
                }
            }

            $category->name = $request->name;
            $category->description = $request->description;
            $category->parent_category_id = $request->parent_category_id;
            $category->display_order = $request->display_order ?? 0;
            $category->is_active = $request->has('is_active') ? $request->is_active : true;
            $category->level = $level;
            $category->meta_title = $request->meta_title;
            $category->meta_description = $request->meta_description;
            $category->save();

            if ($category->wasChanged('parent_category_id')) {
                $this->updateChildrenLevels($category);
            }

            DB::commit();

            return response()->json([
                'status' => true,
                'message' => 'Cập nhật danh mục thành công',
                'data' => $category
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Lỗi khi cập nhật danh mục: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Lỗi khi cập nhật danh mục',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            DB::beginTransaction();

            $category = Category::findOrFail($id);

            $hasProducts = $category->products()->exists();
            $hasChildren = $category->children()->exists();

            if ($hasProducts) {
                return response()->json([
                    'status' => false,
                    'message' => 'Không thể xóa danh mục vì có sản phẩm liên kết'
                ], 422);
            }

            if ($hasChildren) {
                return response()->json([
                    'status' => false,
                    'message' => 'Không thể xóa danh mục vì có danh mục con'
                ], 422);
            }

            if ($category->image_url) {
                $imagePath = str_replace('/storage', 'public', $category->image_url);
                if (Storage::exists($imagePath)) {
                    Storage::delete($imagePath);
                }
            }

            $category->delete();

            DB::commit();

            return response()->json([
                'status' => true,
                'message' => 'Xóa danh mục thành công'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Lỗi khi xóa danh mục: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Lỗi khi xóa danh mục',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function toggleStatus($id)
    {
        try {
            $category = Category::findOrFail($id);
            $category->is_active = !$category->is_active;
            $category->save();

            return response()->json([
                'status' => true,
                'message' => 'Cập nhật trạng thái danh mục thành công',
                'data' => [
                    'is_active' => $category->is_active
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Lỗi khi cập nhật trạng thái danh mục: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Lỗi khi cập nhật trạng thái danh mục',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    private function isChildCategory($parentId, $childId)
    {
        $childCategory = Category::find($childId);

        if (!$childCategory) {
            return false;
        }

        $currentParentId = $childCategory->parent_category_id;

        if ($currentParentId == $parentId) {
            return true;
        } elseif ($currentParentId) {
            return $this->isChildCategory($parentId, $currentParentId);
        }

        return false;
    }

    private function updateChildrenLevels($category)
    {
        $children = Category::where('parent_category_id', $category->category_id)->get();

        foreach ($children as $child) {
            $child->level = $category->level + 1;
            $child->save();

            $this->updateChildrenLevels($child);
        }
    }

    public function getCategories()
    {
        $categories = Category::whereNull('parent_category_id')
            ->where('is_active', true)
            ->orderBy('display_order')
            ->get()
            ->map(function ($category) {
                return $this->buildCategoryTree($category);
            });

        return response()->json([
            'status' => 'success',
            'message' => 'Categories retrieved successfully',
            'data' => $categories
        ], 200);
    }

    private function buildCategoryTree($category)
    {
        $result = [
            'id' => $category->category_id,
            'name' => $category->name
        ];

        $children = Category::where('parent_category_id', $category->category_id)
            ->where('is_active', true)
            ->orderBy('display_order')
            ->get();

        if ($children->count() > 0) {
            $result['children'] = $children->map(function ($child) {
                return $this->buildCategoryTree($child);
            });
        }

        return $result;
    }
}
