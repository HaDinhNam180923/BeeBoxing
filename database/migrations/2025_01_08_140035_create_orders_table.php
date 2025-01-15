<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateOrdersTable extends Migration
{
    public function up()
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id('order_id');
            $table->foreignId('user_id')->constrained('users', 'id');
            $table->foreignId('address_id')->constrained('addresses', 'address_id');
            $table->foreignId('voucher_id')->nullable()->constrained('vouchers', 'voucher_id');
            $table->timestamp('order_date');
            $table->decimal('subtotal_amount', 12, 2);
            $table->decimal('shipping_fee', 12, 2);
            $table->decimal('discount_amount', 12, 2)->default(0);
            $table->decimal('final_amount', 12, 2);
            $table->string('payment_method');
            $table->string('payment_status');
            $table->string('order_status');
            $table->text('note')->nullable();
            $table->string('tracking_number')->nullable();
        });
    }

    public function down()
    {
        Schema::dropIfExists('orders');
    }
}
