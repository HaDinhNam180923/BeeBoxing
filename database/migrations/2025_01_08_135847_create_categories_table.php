<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateCategoriesTable extends Migration
{
    public function up()
    {
        Schema::create('categories', function (Blueprint $table) {
            $table->id('category_id');
            $table->foreignId('parent_category_id')->nullable()->constrained('categories', 'category_id')->onDelete('set null');
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('image_url')->nullable();
            $table->boolean('is_active')->default(true);
            $table->integer('level')->default(0);
            $table->integer('display_order')->default(0);
            $table->string('meta_title')->nullable();
            $table->string('meta_description')->nullable();
        });
    }

    public function down()
    {
        Schema::dropIfExists('categories');
    }
}
