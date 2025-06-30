<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $primaryKey = 'order_id';
    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'address_id',
        'price_voucher_id',
        'shipping_voucher_id',
        'order_date',
        'subtotal_amount',
        'shipping_fee',
        'discount_amount',
        'final_amount',
        'payment_method',
        'payment_status',
        'order_status',
        'note',
        'tracking_number',
        'return_status',
        'return_note',
        'return_images',
    ];

    protected $casts = [
        'order_date' => 'datetime',
        'subtotal_amount' => 'decimal:2',
        'shipping_fee' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'final_amount' => 'decimal:2',
        'return_images' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function address()
    {
        return $this->belongsTo(Address::class, 'address_id');
    }

    public function priceVoucher()
    {
        return $this->belongsTo(Voucher::class, 'price_voucher_id');
    }

    public function shippingVoucher()
    {
        return $this->belongsTo(Voucher::class, 'shipping_voucher_id');
    }

    public function deliveryOrder()
    {
        return $this->hasOne(DeliveryOrder::class, 'order_id', 'order_id');
    }

    public function orderDetails()
    {
        return $this->hasMany(OrderDetail::class, 'order_id');
    }
}
