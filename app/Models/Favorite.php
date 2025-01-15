<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Favorite extends Model
{
    protected $primaryKey = 'favorite_id';
    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'product_id'
    ];

    protected $casts = [
        'created_at' => 'datetime'
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id');
    }
}
