<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Category;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
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

    public function getCategoryAncestors($categoryId)
    {
        try {
            $ancestors = [];
            $category = Category::findOrFail($categoryId);

            while ($category) {
                $ancestors[] = [
                    'id' => $category->category_id,
                    'name' => $category->name,
                    'slug' => $category->slug ?? Str::slug($category->name),
                ];
                $category = $category->parent_category_id ? Category::find($category->parent_category_id) : null;
            }

            return response()->json([
                'status' => 'success',
                'data' => array_reverse($ancestors)
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve category ancestors',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
