<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Faker\Factory as Faker;

class ReviewSeeder extends Seeder
{
    public function run()
    {
        $faker = Faker::create();

        $userIds = DB::table('users')->pluck('id')->toArray();
        $productIds = DB::table('products')->pluck('product_id')->toArray();

        // Ảnh mẫu từ p1.jpg đến p8.jpg
        $sampleImages = [];
        for ($i = 1; $i <= 8; $i++) {
            $sampleImages[] = "/storage/products/p{$i}.jpg";
        }

        for ($i = 0; $i < 500; $i++) {
            $hasReply = rand(0, 1);
            $imageCount = rand(0, 3);

            DB::table('reviews')->insert([
                'user_id' => $faker->randomElement($userIds),
                'product_id' => $faker->randomElement($productIds),
                'rating' => rand(1, 5),
                'comment' => $faker->realText(rand(80, 150)),
                'is_visible' => true,
                'admin_reply' => $hasReply ? $faker->sentence() : null,
                'reply_at' => $hasReply ? now() : null,
                'image_urls' => $imageCount > 0
                    ? json_encode($faker->randomElements($sampleImages, $imageCount))
                    : null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
