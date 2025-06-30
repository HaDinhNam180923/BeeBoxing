<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->enum('return_status', ['PENDING', 'APPROVED', 'REJECTED', 'COMPLETED'])->nullable()->after('order_status');
            $table->text('return_note')->nullable()->after('return_status');
            $table->json('return_images')->nullable()->after('return_note');
        });

        Schema::table('order_details', function (Blueprint $table) {
            $table->unsignedInteger('return_quantity')->default(0)->after('subtotal');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['return_status', 'return_note', 'return_images']);
        });

        Schema::table('order_details', function (Blueprint $table) {
            $table->dropColumn('return_quantity');
        });
    }
};
