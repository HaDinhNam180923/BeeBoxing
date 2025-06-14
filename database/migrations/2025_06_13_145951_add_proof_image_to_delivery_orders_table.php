<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddProofImageToDeliveryOrdersTable extends Migration
{
    public function up()
    {
        Schema::table('delivery_orders', function (Blueprint $table) {
            $table->string('proof_image')->nullable()->after('notes');
        });
    }

    public function down()
    {
        Schema::table('delivery_orders', function (Blueprint $table) {
            $table->dropColumn('proof_image');
        });
    }
}
