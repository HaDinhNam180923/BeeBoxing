<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class AdditionalProductsSeeder extends Seeder
{
    public function run()
    {
        $this->call([
            ProductSeeder::class,
            ProductColorSeeder::class,
            ProductImageSeeder::class,
            ProductInventorySeeder::class,
        ]);
    }
}
