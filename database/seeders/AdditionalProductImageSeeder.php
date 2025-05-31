<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AdditionalProductImageSeeder extends Seeder
{
    public function run()
    {
        // Lấy ID cuối cùng trước khi thêm màu sắc mới
        $lastColorIdBeforeAdding = DB::table('product_colors')->max('color_id') -
            count(DB::table('products')
                ->where('product_id', '>', DB::table('products')->max('product_id') - 250)
                ->get()) * 2; // Ước tính trung bình 2 màu mỗi sản phẩm

        // Lấy các màu sắc mới được thêm
        $newColors = DB::table('product_colors')
            ->where('color_id', '>', $lastColorIdBeforeAdding)
            ->get();

        // Lấy ID cuối cùng của product_images
        $lastImageId = DB::table('product_images')->max('image_id') ?? 0;
        $imageId = $lastImageId + 1;

        $productImages = [];

        foreach ($newColors as $color) {
            // Tạo 3-5 ảnh cho mỗi màu
            $imageCount = rand(3, 5);

            for ($i = 0; $i < $imageCount; $i++) {
                // Chọn ảnh ngẫu nhiên từ p1.jpg đến p20.jpg
                $imageNumber = rand(1, 8);

                $productImages[] = [
                    'image_id' => $imageId,
                    'color_id' => $color->color_id,
                    'image_url' => "/storage/products/p{$imageNumber}.jpg",
                    'is_primary' => ($i === 0) ? 1 : 0, // Ảnh đầu tiên là ảnh chính
                    'alt_text' => "Product image {$imageNumber}",
                    'display_order' => $i + 1
                ];
                $imageId++;
            }
        }

        // Insert theo lô
        $chunks = array_chunk($productImages, 100);
        foreach ($chunks as $chunk) {
            DB::table('product_images')->insert($chunk);
        }

        echo "Đã thêm " . count($productImages) . " hình ảnh cho " . count($newColors) . " màu sắc mới\n";
    }
}
