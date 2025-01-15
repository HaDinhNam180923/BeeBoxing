<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateProductColorsTable extends Migration
{
    public function up()
    {
        Schema::create('product_colors', function (Blueprint $table) {
            $table->id('color_id');
            $table->foreignId('product_id')->constrained('products', 'product_id')->onDelete('cascade');
            $table->string('color_name');
            $table->string('color_code');
        });
    }

    public function down()
    {
        Schema::dropIfExists('product_colors');
    }
}
