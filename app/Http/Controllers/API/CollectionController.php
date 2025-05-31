<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Collection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class CollectionController extends Controller
{
    /**
     * Lấy danh sách tất cả bộ sưu tập đang hoạt động
     */
    public function getCollections()
    {
        try {
            $collections = Collection::where('is_active', true)
                ->orderBy('display_order')
                ->get();

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

    /**
     * Lấy chi tiết bộ sưu tập và các sản phẩm trong bộ sưu tập
     */
    public function getCollectionDetail($slug)
    {
        try {
            $collection = Collection::where('slug', $slug)
                ->where('is_active', true)
                ->with(['products' => function ($query) {
                    $query->where('is_active', true)
                        ->with(['colors' => function ($q) {
                            $q->with(['images' => function ($q) {
                                $q->where('is_primary', true);
                            }]);
                        }])
                        ->orderBy('pivot_display_order');
                }])
                ->firstOrFail();

            // Tính giá cuối cùng cho mỗi sản phẩm
            $collection->products->each(function ($product) {
                $product->final_price = $product->base_price * (1 - ($product->discount / 100));

                // Đảm bảo mỗi màu có primary_image
                $product->colors->each(function ($color) {
                    $color->primary_image = $color->images->first();
                });
            });

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

    /**
     * Lấy danh sách các bộ sưu tập nổi bật cho trang chủ
     */
    public function getFeaturedCollections()
    {
        try {
            $collections = Collection::where('is_active', true)
                ->orderBy('display_order')
                ->limit(3)
                ->get();

            return response()->json([
                'status' => true,
                'data' => $collections
            ]);
        } catch (\Exception $e) {
            Log::error('Lỗi khi lấy bộ sưu tập nổi bật: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Lỗi khi lấy bộ sưu tập nổi bật',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
