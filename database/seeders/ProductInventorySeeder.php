<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProductInventorySeeder extends Seeder
{
    public function run()
    {
        $sizes = ['S', 'M', 'L', 'XL', 'XXL'];
        $inventoryId = 1;
        $colors = DB::table('product_colors')->get();

        // Mảng điều chỉnh giá theo size, giảm giá tối đa 30%
        $adjustments = [
            'S' => [-30, -20],    // Size S giảm 20-30%
            'M' => [-20, -10],    // Size M giảm 10-20%
            'L' => [0, 0],        // Size L giá gốc
            'XL' => [0, 0],      // Size XL tăng 10-20%
            'XXL' => [0, 0]     // Size XXL tăng 20-30%
        ];

        foreach ($colors as $color) {
            foreach ($sizes as $size) {
                $range = $adjustments[$size];
                // Random trong khoảng và làm tròn đến 10
                $adjustment = round(rand($range[0], $range[1]) / 10) * 10;

                DB::table('product_inventory')->insert([
                    'inventory_id' => $inventoryId,
                    'color_id' => $color->color_id,
                    'size' => $size,
                    'stock_quantity' => rand(0, 100),
                    'price_adjustment' => $adjustment
                ]);
                $inventoryId++;
            }
        }
    }
}
