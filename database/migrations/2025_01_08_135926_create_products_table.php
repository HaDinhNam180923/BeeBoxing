<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateProductsTable extends Migration
{
    public function up()
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id('product_id');
            $table->string('name');
            $table->text('description');
            $table->decimal('base_price', 12, 2);
            $table->foreignId('category_id')->constrained('categories', 'category_id');
            $table->timestamps();
            $table->boolean('is_active')->default(true);
            $table->string('brand');
            $table->decimal('discount', 5, 2)->default(0);
            $table->text('specifications')->nullable();
            $table->integer('view_count')->default(0);
            $table->boolean('is_featured')->default(false);
        });
    }

    public function down()
    {
        Schema::dropIfExists('products');
    }
}
