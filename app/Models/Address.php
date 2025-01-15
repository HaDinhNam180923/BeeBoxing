<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Address extends Model
{
    protected $primaryKey = 'address_id';
    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'receiver_name',
        'phone',
        'province',
        'district',
        'ward',
        'street_address',
        'is_default',
        'note'
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function orders()
    {
        return $this->hasMany(Order::class, 'address_id');
    }
}
