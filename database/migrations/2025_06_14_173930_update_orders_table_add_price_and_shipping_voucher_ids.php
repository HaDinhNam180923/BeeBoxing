<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class UpdateOrdersTableAddPriceAndShippingVoucherIds extends Migration
{
    public function up()
    {
        Schema::table('orders', function (Blueprint $table) {
            // Thêm hai cột mới
            $table->unsignedBigInteger('price_voucher_id')->nullable()->after('address_id');
            $table->unsignedBigInteger('shipping_voucher_id')->nullable()->after('price_voucher_id');

            // Thêm foreign key
            $table->foreign('price_voucher_id')->references('voucher_id')->on('vouchers');
            $table->foreign('shipping_voucher_id')->references('voucher_id')->on('vouchers');

            // Xóa cột voucher_id cũ
            $table->dropForeign(['voucher_id']);
            $table->dropColumn('voucher_id');
        });
    }

    public function down()
    {
        Schema::table('orders', function (Blueprint $table) {
            // Khôi phục cột voucher_id
            $table->unsignedBigInteger('voucher_id')->nullable()->after('address_id');
            $table->foreign('voucher_id')->references('voucher_id')->on('vouchers');

            // Xóa hai cột mới
            $table->dropForeign(['price_voucher_id']);
            $table->dropForeign(['shipping_voucher_id']);
            $table->dropColumn(['price_voucher_id', 'shipping_voucher_id']);
        });
    }
}
