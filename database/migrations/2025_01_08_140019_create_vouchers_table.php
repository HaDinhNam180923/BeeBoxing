<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

class CreateVouchersTable extends Migration
{
    public function up()
    {
        Schema::create('vouchers', function (Blueprint $table) {
            $table->id('voucher_id');
            $table->string('code')->unique();
            $table->string('name');
            $table->text('description')->nullable();
            $table->decimal('discount_amount', 12, 2);
            $table->decimal('minimum_order_amount', 12, 2);
            $table->decimal('maximum_discount_amount', 12, 2);
            $table->integer('usage_limit');
            $table->integer('used_count')->default(0);
            $table->timestamp('start_date')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->timestamp('end_date')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->boolean('is_active')->default(true);
            $table->string('discount_type');
            $table->boolean('is_public')->default(true);
            $table->foreignId('user_id')->nullable()->constrained('users', 'id')->onDelete('set null');
        });
    }

    public function down()
    {
        Schema::dropIfExists('vouchers');
    }
}
