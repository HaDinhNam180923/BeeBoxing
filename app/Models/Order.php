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
        'voucher_id',
        'order_date',
        'subtotal_amount',
        'shipping_fee',
        'discount_amount',
        'final_amount',
        'payment_method',
        'payment_status',
        'order_status',
        'note',
        'tracking_number'
    ];

    protected $casts = [
        'order_date' => 'datetime',
        'subtotal_amount' => 'decimal:2',
        'shipping_fee' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'final_amount' => 'decimal:2'
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function address()
    {
        return $this->belongsTo(Address::class, 'address_id');
    }

    public function voucher()
    {
        return $this->belongsTo(Voucher::class, 'voucher_id');
    }

    public function orderDetails()
    {
        return $this->hasMany(OrderDetail::class, 'order_id');
    }
}
