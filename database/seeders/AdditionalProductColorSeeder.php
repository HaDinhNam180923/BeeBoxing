<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AdditionalProductColorSeeder extends Seeder
{
    public function run()
    {
        $colors = [
            ['name' => 'Black', 'code' => '#000000'],
            ['name' => 'White', 'code' => '#FFFFFF'],
            ['name' => 'Red', 'code' => '#FF0000'],
            ['name' => 'Blue', 'code' => '#0000FF'],
            ['name' => 'Green', 'code' => '#00FF00'],
            ['name' => 'Navy', 'code' => '#000080'],
            ['name' => 'Grey', 'code' => '#808080'],
            ['name' => 'Beige', 'code' => '#F5F5DC'],
            ['name' => 'Brown', 'code' => '#A52A2A'],
            ['name' => 'Yellow', 'code' => '#FFFF00']
        ];

        $lastOldProductId = DB::table('products')->max('product_id');

        // Lấy các sản phẩm mới (những sản phẩm có ID lớn hơn lastOldProductId)
        $newProducts = DB::table('products')
            ->where('product_id', '>', $lastOldProductId)
            ->get();

        $lastColorId = DB::table('product_colors')->max('color_id') ?? 0;
        $colorId = $lastColorId + 1;

        $productColors = [];

        foreach ($newProducts as $product) {
            $numColors = rand(1, 3); // 1 đến 3 màu mỗi sản phẩm
            $selectedColorIndices = array_rand($colors, $numColors);

            if (!is_array($selectedColorIndices)) {
                $selectedColorIndices = [$selectedColorIndices];
            }

            foreach ($selectedColorIndices as $colorIndex) {
                $productColors[] = [
                    'color_id' => $colorId,
                    'product_id' => $product->product_id,
                    'color_name' => $colors[$colorIndex]['name'],
                    'color_code' => $colors[$colorIndex]['code']
                ];
                $colorId++;
            }
        }

        // Insert theo lô
        $chunks = array_chunk($productColors, 100);
        foreach ($chunks as $chunk) {
            DB::table('product_colors')->insert($chunk);
        }

        echo "Đã thêm màu sắc cho " . count($newProducts) . " sản phẩm mới\n";
    }
}
