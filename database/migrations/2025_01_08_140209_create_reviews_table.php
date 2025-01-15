<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateReviewsTable extends Migration
{
    public function up()
    {
        Schema::create('reviews', function (Blueprint $table) {
            $table->id('review_id');
            $table->foreignId('user_id')->constrained('users', 'id');
            $table->foreignId('product_id')->constrained('products', 'product_id');
            $table->integer('rating');
            $table->text('comment');
            $table->timestamps();
            $table->boolean('is_visible')->default(true);
            $table->text('admin_reply')->nullable();
            $table->timestamp('reply_at')->nullable();
            $table->json('image_urls')->nullable();
        });
    }

    public function down()
    {
        Schema::dropIfExists('reviews');
    }
}
