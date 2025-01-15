<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProductImageSeeder extends Seeder
{
    public function run()
    {
        $imageId = 1;
        $colors = DB::table('product_colors')->get();

        foreach ($colors as $color) {
            // Create array of numbers 1-8 and shuffle it
            $imageOrder = range(1, 8);
            shuffle($imageOrder);

            foreach ($imageOrder as $index => $number) {
                DB::table('product_images')->insert([
                    'image_id' => $imageId,
                    'color_id' => $color->color_id,
                    'image_url' => "/storage/products/p{$number}.jpg",
                    'is_primary' => ($index === 0) ? 1 : 0, // First image is primary
                    'alt_text' => "Product image {$number}",
                    'display_order' => $index + 1
                ]);
                $imageId++;
            }
        }
    }
}
