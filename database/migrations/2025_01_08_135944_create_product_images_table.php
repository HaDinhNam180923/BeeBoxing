<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateProductImagesTable extends Migration
{
    public function up()
    {
        Schema::create('product_images', function (Blueprint $table) {
            $table->id('image_id');
            $table->foreignId('color_id')->constrained('product_colors', 'color_id')->onDelete('cascade');
            $table->string('image_url');
            $table->boolean('is_primary')->default(false);
            $table->string('alt_text')->nullable();
            $table->integer('display_order')->default(0);
        });
    }

    public function down()
    {
        Schema::dropIfExists('product_images');
    }
}
