<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddVoucherTypeAndIsNewUserOnlyToVouchersTable extends Migration
{
    public function up()
    {
        Schema::table('vouchers', function (Blueprint $table) {
            $table->string('voucher_type')->default('price')->after('discount_type');
            $table->boolean('is_new_user_only')->default(0)->after('is_public');
        });
    }

    public function down()
    {
        Schema::table('vouchers', function (Blueprint $table) {
            $table->dropColumn(['voucher_type', 'is_new_user_only']);
        });
    }
}
