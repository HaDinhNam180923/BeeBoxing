<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateOrderDetailsTable extends Migration
{
    public function up()
    {
        Schema::create('order_details', function (Blueprint $table) {
            $table->id('order_detail_id');
            $table->foreignId('order_id')->constrained('orders', 'order_id')->onDelete('cascade');
            $table->foreignId('inventory_id')->constrained('product_inventory', 'inventory_id');
            $table->integer('quantity');
            $table->decimal('unit_price', 12, 2);
            $table->decimal('subtotal', 12, 2);
        });
    }

    public function down()
    {
        Schema::dropIfExists('order_details');
    }
}
