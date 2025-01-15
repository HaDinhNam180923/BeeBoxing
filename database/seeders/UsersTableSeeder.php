<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Faker\Factory as Faker;

class UsersTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = Faker::create();

        for ($i = 0; $i < 10; $i++) {
            DB::table('users')->insert([
                'name' => $faker->name,
                'email' => $faker->unique()->safeEmail,
                'email_verified_at' => now(),
                'password' => Hash::make('password'), // Tạo password mặc định
                'phone' => $faker->phoneNumber,
                'is_active' => $faker->boolean, // Random true/false
                'role' => $faker->randomElement(['user', 'admin']), // Random vai trò
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
