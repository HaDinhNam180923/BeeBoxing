<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateAddressesTable extends Migration
{
    public function up()
    {
        Schema::create('addresses', function (Blueprint $table) {
            $table->id('address_id');
            $table->foreignId('user_id')->constrained('users', 'id')->onDelete('cascade');
            $table->string('receiver_name');
            $table->string('phone');
            $table->string('province');
            $table->string('district');
            $table->string('ward');
            $table->string('street_address');
            $table->boolean('is_default')->default(false);
            $table->string('note')->nullable();
        });
    }

    public function down()
    {
        Schema::dropIfExists('addresses');
    }
}
