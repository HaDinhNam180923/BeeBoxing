<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProductColorSeeder extends Seeder
{
    public function run()
    {
        $colors = [
            ['name' => 'Black', 'code' => '#000000'],
            ['name' => 'White', 'code' => '#FFFFFF'],
            ['name' => 'Red', 'code' => '#FF0000'],
            ['name' => 'Blue', 'code' => '#0000FF'],
            ['name' => 'Green', 'code' => '#00FF00']
        ];

        $colorId = 1;
        for ($productId = 1; $productId <= 50; $productId++) {
            $numColors = rand(1, 2); // 1 or 2 colors per product
            $selectedColors = array_rand($colors, $numColors);

            if (!is_array($selectedColors)) {
                $selectedColors = [$selectedColors];
            }

            foreach ($selectedColors as $colorIndex) {
                DB::table('product_colors')->insert([
                    'color_id' => $colorId,
                    'product_id' => $productId,
                    'color_name' => $colors[$colorIndex]['name'],
                    'color_code' => $colors[$colorIndex]['code']
                ]);
                $colorId++;
            }
        }
    }
}
