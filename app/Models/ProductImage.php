<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductImage extends Model
{
    protected $primaryKey = 'image_id';
    public $timestamps = false;

    protected $fillable = [
        'color_id',
        'image_url',
        'is_primary',
        'alt_text',
        'display_order'
    ];

    protected $casts = [
        'is_primary' => 'boolean'
    ];

    public function color()
    {
        return $this->belongsTo(ProductColor::class, 'color_id');
    }
}
