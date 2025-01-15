<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateVNAddressesTable extends Migration
{
    public function up()
    {
        Schema::create('vn_addresses', function (Blueprint $table) {
            $table->id();
            $table->string('province');
            $table->string('district');
            $table->string('ward');
            $table->string('type');
            $table->string('prefix');
            $table->string('code');
        });
    }

    public function down()
    {
        Schema::dropIfExists('vn_addresses');
    }
}
