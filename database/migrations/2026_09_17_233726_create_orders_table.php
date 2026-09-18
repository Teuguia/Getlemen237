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
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('delivery_zone_id')->nullable()->constrained()->nullOnDelete();
            $table->string('order_number')->unique();
            $table->string('customer_name');
            $table->string('customer_phone');
            $table->string('customer_email')->nullable();
            $table->string('delivery_city')->default('Yaounde');
            $table->string('delivery_district')->nullable();
            $table->text('delivery_address');
            $table->string('status')->default('pending_payment');
            $table->string('payment_status')->default('unpaid');
            $table->string('payment_method')->default('cash_on_delivery');
            $table->bigInteger('subtotal_cents')->default(0);
            $table->bigInteger('delivery_fee_cents')->default(0);
            $table->bigInteger('total_cents')->default(0);
            $table->text('notes')->nullable();
            $table->timestamp('confirmed_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
