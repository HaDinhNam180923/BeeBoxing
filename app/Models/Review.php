<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    protected $primaryKey = 'review_id';

    protected $fillable = [
        'user_id',
        'product_id',
        'rating',
        'comment',
        'is_visible',
        'admin_reply',
        'reply_at',
        'image_urls'
    ];

    protected $casts = [
        'is_visible' => 'boolean',
        'reply_at' => 'datetime',
        'image_urls' => 'array'
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
