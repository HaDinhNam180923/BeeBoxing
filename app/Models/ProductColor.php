<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductColor extends Model
{
    protected $primaryKey = 'color_id';
    public $timestamps = false;

    protected $fillable = [
        'product_id',
        'color_name',
        'color_code'
    ];

    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id');
    }

    public function images()
    {
        return $this->hasMany(ProductImage::class, 'color_id');
    }

    public function inventory()
    {
        return $this->hasMany(ProductInventory::class, 'color_id');
    }
}
