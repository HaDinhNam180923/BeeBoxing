<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VnAddress extends Model
{
    protected $fillable = [
        'province',
        'district',
        'ward',
        'type',
        'prefix',
        'code'
    ];

    public $timestamps = false;
}
