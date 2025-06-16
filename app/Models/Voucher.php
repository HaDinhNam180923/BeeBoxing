<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Voucher extends Model
{
    protected $primaryKey = 'voucher_id';
    public $timestamps = false;

    protected $fillable = [
        'code',
        'name',
        'description',
        'discount_amount',
        'minimum_order_amount',
        'maximum_discount_amount',
        'usage_limit',
        'used_count',
        'start_date',
        'end_date',
        'is_active',
        'discount_type',
        'voucher_type', // Thêm trường này
        'is_public',
        'is_new_user_only', // Thêm trường này
        'user_id'
    ];

    protected $casts = [
        'discount_amount' => 'decimal:2',
        'minimum_order_amount' => 'decimal:2',
        'maximum_discount_amount' => 'decimal:2',
        'start_date' => 'datetime',
        'end_date' => 'datetime',
        'is_active' => 'boolean',
        'is_public' => 'boolean',
        'is_new_user_only' => 'boolean', // Thêm cast cho trường này
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function orders()
    {
        return $this->hasMany(Order::class, 'voucher_id');
    }
}
