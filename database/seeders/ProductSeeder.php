<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ProductSeeder extends Seeder
{
    private function generateRandomName()
    {
        $adjectives = [
            'Cao cấp',
            'Thể thao',
            'Chuyên nghiệp',
            'Năng động',
            'Thời trang',
            'Classic',
            'Hiện đại',
            'Truyền thống',
            'Đơn giản',
            'Sang trọng',
            'Thoải mái',
            'Nhẹ nhàng',
            'Đẳng cấp',
            'Limited',
            'Đặc biệt',
            'Premium',
            'Mới',
            'Đổi mới',
            'Cực chất',
            'Cổ điển',
            'Siêu nhẹ',
            'Siêu bền',
            'Tiện lợi',
            'Phong cách',
            'Độc đáo',
            'Tinh tế',
            'Xu hướng',
            'Tối giản',
            'Thịnh hành',
            'Bền bỉ',
            'Mạnh mẽ'
        ];

        $items = [
            'Áo thun',
            'Áo polo',
            'Áo khoác',
            'Quần short',
            'Quần jean',
            'Quần thể thao',
            'Áo hoodie',
            'Áo sweater',
            'Áo blazer',
            'Quần tây',
            'Áo vest',
            'Áo sơ mi',
            'Áo len',
            'Áo gió',
            'Áo bomber',
            'Quần jogger',
            'Áo tanktop',
            'Quần dài',
            'Áo dạ',
            'Áo cổ lọ',
            'Bộ đồ thể thao',
            'Set đồ nam',
            'Set đồ nữ',
            'Quần ống rộng',
            'Quần kaki',
            'Áo thun dài tay',
            'Áo khoác len',
            'Áo khoác dạ',
            'Áo phông',
            'Áo form rộng'
        ];

        $collections = [
            'Essential',
            'Sport',
            'Lifestyle',
            'Original',
            'Ultra',
            'Pro',
            'Elite',
            'Premium',
            'Active',
            'Basic',
            'Authentic',
            'Modern',
            'Classic',
            'Urban',
            'Signature',
            'Limited',
            'Freedom',
            'Infinity',
            'Edge',
            'Zen',
            'Boost',
            'Bold',
            'True Fit',
            'Iconic',
            'Motion',
            'Performance',
            'Chill',
            'Vibe',
            'Flex',
            'Heritage',
            'Core',
            'Studio',
            'Rush',
            'Onyx',
            'Glide'
        ];

        return $adjectives[array_rand($adjectives)] . ' ' .
            $items[array_rand($items)] . ' ' .
            $collections[array_rand($collections)];
    }


    private function roundPrice($price)
    {
        // Làm tròn đến hàng chục nghìn
        return round($price / 10000) * 10000;
    }

    public function run()
    {
        // Tắt kiểm tra khóa ngoại
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');

        // Xóa dữ liệu cũ
        DB::table('product_inventory')->truncate();
        DB::table('product_images')->truncate();
        DB::table('product_colors')->truncate();
        DB::table('products')->truncate();

        // Bật lại kiểm tra khóa ngoại
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        $categories = [5, 7, 8, 9, 10, 14, 15, 16, 17, 18];
        $brands = [
            'Nike',
            'Adidas',
            'Puma',
            'Under Armour',
            'New Balance',
            'Reebok',
            'Converse',
            'Vans',
            'Champion',
            'Fila'
        ];

        for ($i = 1; $i <= 500; $i++) {
            $basePrice = $this->roundPrice(rand(100000, 2000000));
            DB::table('products')->insert([
                'product_id' => $i,
                'name' => $this->generateRandomName(),
                'description' => "Sản phẩm cao cấp, chất liệu thoáng mát, thiết kế hiện đại, phù hợp với nhiều phong cách khác nhau.",
                'base_price' => $basePrice,
                'category_id' => $categories[array_rand($categories)],
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
                'is_active' => 1,
                'brand' => $brands[array_rand($brands)],
                'discount' => rand(0, 6) * 5, // Discount sẽ là bội số của 5 (0, 5, 10, 15, 20, 25, 30)
                'specifications' => json_encode([
                    'Chất liệu' => 'Cotton cao cấp',
                    'Xuất xứ' => 'Việt Nam',
                    'Phom dáng' => 'Regular fit',
                    'Hướng dẫn giặt' => 'Giặt máy ở nhiệt độ thường',
                    'Bảo quản' => 'Giặt riêng với sản phẩm cùng màu'
                ]),
                'view_count' => rand(0, 1000),
                'is_featured' => rand(0, 1)
            ]);
        }
    }
}
