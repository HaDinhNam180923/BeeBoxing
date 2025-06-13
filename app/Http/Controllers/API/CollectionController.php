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
            // Lấy bộ sưu tập với các sản phẩm và relationships đầy đủ
            $collection = Collection::where('slug', $slug)
                ->where('is_active', true)
                ->with(['products' => function ($query) {
                    $query->where('is_active', true)
                        ->with([
                            'category',
                            'colors' => function ($q) {
                                $q->orderBy('color_name')
                                    ->with([
                                        'images' => function ($q) {
                                            $q->orderBy('display_order');
                                        },
                                        'inventory' => function ($q) {
                                            $q->orderBy('size');
                                        }
                                    ]);
                            }
                        ])
                        ->orderBy('pivot_display_order');
                }])
                ->firstOrFail();

            // Chuẩn hóa dữ liệu sản phẩm
            $collection->products = $collection->products->map(function ($product) {
                // Tính giá cuối cùng
                $product->final_price = $product->base_price * (1 - $product->discount / 100);

                // Tính tổng tồn kho
                $product->total_stock = $product->colors->sum(function ($color) {
                    return $color->inventory->sum('stock_quantity');
                });

                // Chuẩn hóa colors
                $product->colors->transform(function ($color) {
                    // Thêm primary_image
                    $color->primary_image = $color->images->where('is_primary', true)->first();

                    // Chuẩn hóa inventory
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

                return $product;
            });

            return response()->json([
                'status' => true,
                'data' => $collection
            ], 200);
        } catch (\Exception $e) {
            Log::error('Lỗi khi lấy chi tiết bộ sưu tập: ' . $e->getMessage(), [
                'slug' => $slug,
                'trace' => $e->getTraceAsString()
            ]);
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
