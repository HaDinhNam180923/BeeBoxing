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
            ['name' => 'Green', 'code' => '#00FF00'],
            ['name' => 'Yellow', 'code' => '#FFFF00'],
            ['name' => 'Orange', 'code' => '#FFA500'],
            ['name' => 'Pink', 'code' => '#FFC0CB'],
            ['name' => 'Purple', 'code' => '#800080'],
            ['name' => 'Gray', 'code' => '#808080'],
            ['name' => 'Brown', 'code' => '#A52A2A'],
            ['name' => 'Beige', 'code' => '#F5F5DC'],
            ['name' => 'Navy', 'code' => '#000080'],
            ['name' => 'Sky Blue', 'code' => '#87CEEB'],
            ['name' => 'Mint', 'code' => '#98FF98'],
            ['name' => 'Olive', 'code' => '#808000'],
            ['name' => 'Maroon', 'code' => '#800000'],
            ['name' => 'Coral', 'code' => '#FF7F50'],
            ['name' => 'Khaki', 'code' => '#F0E68C'],
            ['name' => 'Ivory', 'code' => '#FFFFF0'],
            ['name' => 'Gold', 'code' => '#FFD700'],
            ['name' => 'Silver', 'code' => '#C0C0C0'],
            ['name' => 'Teal', 'code' => '#008080'],
            ['name' => 'Turquoise', 'code' => '#40E0D0'],
            ['name' => 'Lavender', 'code' => '#E6E6FA'],
            ['name' => 'Charcoal', 'code' => '#36454F'],
            ['name' => 'Crimson', 'code' => '#DC143C'],
            ['name' => 'Indigo', 'code' => '#4B0082'],
            ['name' => 'Cyan', 'code' => '#00FFFF'],
            ['name' => 'Magenta', 'code' => '#FF00FF']
        ];


        $colorId = 1;
        for ($productId = 1; $productId <= 500; $productId++) {
            $numColors = rand(1, 3); // 1 or 2 colors per product
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
