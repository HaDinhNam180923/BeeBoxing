<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CartItem extends Model
{
    protected $primaryKey = 'cart_item_id';

    protected $fillable = [
        'cart_id',
        'inventory_id',
        'quantity'
    ];

    public function cart()
    {
        return $this->belongsTo(Cart::class, 'cart_id');
    }

    public function inventory()
    {
        return $this->belongsTo(ProductInventory::class, 'inventory_id');
    }
}
