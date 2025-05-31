<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AdditionalProductInventorySeeder extends Seeder
{
    public function run()
    {
        $sizes = ['S', 'M', 'L', 'XL', 'XXL'];

        // Lấy ID cuối cùng trước khi thêm màu sắc mới
        $lastColorIdBeforeAdding = DB::table('product_colors')->max('color_id') -
            count(DB::table('products')
                ->where('product_id', '>', DB::table('products')->max('product_id') - 250)
                ->get()) * 2; // Ước tính trung bình 2 màu mỗi sản phẩm

        // Lấy các màu sắc mới được thêm
        $newColors = DB::table('product_colors')
            ->where('color_id', '>', $lastColorIdBeforeAdding)
            ->get();

        // Lấy ID cuối cùng của product_inventory
        $lastInventoryId = DB::table('product_inventory')->max('inventory_id') ?? 0;
        $inventoryId = $lastInventoryId + 1;

        // Mảng điều chỉnh giá theo size
        $adjustments = [
            'S' => [-30, -20],    // Size S giảm 20-30%
            'M' => [-20, -10],    // Size M giảm 10-20%
            'L' => [0, 0],        // Size L giá gốc
            'XL' => [10, 20],     // Size XL tăng 10-20%
            'XXL' => [20, 30]     // Size XXL tăng 20-30%
        ];

        $productInventories = [];

        foreach ($newColors as $color) {
            // Không phải tất cả màu đều có đủ size
            $sizeCount = rand(2, count($sizes));
            $availableSizes = array_slice($sizes, 0, $sizeCount);

            foreach ($availableSizes as $size) {
                $range = $adjustments[$size];
                // Random trong khoảng và làm tròn đến 10
                $adjustment = round(rand($range[0], $range[1]) / 10) * 10;

                $productInventories[] = [
                    'inventory_id' => $inventoryId,
                    'color_id' => $color->color_id,
                    'size' => $size,
                    'stock_quantity' => rand(0, 100),
                    'price_adjustment' => $adjustment
                ];
                $inventoryId++;
            }
        }

        // Insert theo lô
        $chunks = array_chunk($productInventories, 100);
        foreach ($chunks as $chunk) {
            DB::table('product_inventory')->insert($chunk);
        }

        echo "Đã thêm " . count($productInventories) . " bản ghi tồn kho cho " . count($newColors) . " màu sắc mới\n";
    }
}
