<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductInventory extends Model
{
    protected $primaryKey = 'inventory_id';
    public $timestamps = false;
    protected $table = 'product_inventory';

    protected $fillable = [
        'color_id',
        'size',
        'stock_quantity',
        'price_adjustment'
    ];

    protected $casts = [
        'price_adjustment' => 'decimal:2'
    ];

    public function color()
    {
        return $this->belongsTo(ProductColor::class, 'color_id');
    }

    public function cartItems()
    {
        return $this->hasMany(CartItem::class, 'inventory_id');
    }

    public function orderDetails()
    {
        return $this->hasMany(OrderDetail::class, 'inventory_id');
    }
}
