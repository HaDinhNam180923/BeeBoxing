<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateProductInventoryTable extends Migration
{
    public function up()
    {
        Schema::create('product_inventory', function (Blueprint $table) {
            $table->id('inventory_id');
            $table->foreignId('color_id')->constrained('product_colors', 'color_id')->onDelete('cascade');
            $table->string('size');
            $table->integer('stock_quantity')->default(0);
            $table->decimal('price_adjustment', 12, 2)->default(0);
        });
    }

    public function down()
    {
        Schema::dropIfExists('product_inventory');
    }
}
