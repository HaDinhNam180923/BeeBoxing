<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateCartTable extends Migration
{
    public function up()
    {
        Schema::create('carts', function (Blueprint $table) {
            $table->id('cart_id');
            $table->foreignId('user_id')->constrained('users', 'id')->onDelete('cascade');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('carts');
    }
}
