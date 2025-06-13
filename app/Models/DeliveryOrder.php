<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DeliveryOrder extends Model
{
    use HasFactory;

    protected $table = 'delivery_orders';
    protected $primaryKey = 'delivery_order_id';
    public $incrementing = true;
    protected $keyType = 'int';

    /**
     * Các thuộc tính có thể gán hàng loạt.
     *
     * @var array
     */
    protected $fillable = [
        'order_id',
        'shipper_id',
        'tracking_number',
        'status',
        'assigned_at',
        'received_at',
        'delivered_at',
        'notes',
    ];

    /**
     * Các thuộc tính cần cast.
     *
     * @var array
     */
    protected $casts = [
        'assigned_at' => 'datetime',
        'received_at' => 'datetime',
        'delivered_at' => 'datetime',
    ];

    /**
     * Quan hệ với bảng orders.
     */
    public function order()
    {
        return $this->belongsTo(Order::class, 'order_id', 'order_id');
    }

    /**
     * Quan hệ với bảng users (shipper).
     */
    public function shipper()
    {
        return $this->belongsTo(User::class, 'shipper_id', 'id');
    }

    /**
     * Scope để lấy đơn giao của shipper.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param int $shipperId
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeAssignedToShipper($query, $shipperId)
    {
        return $query->where('shipper_id', $shipperId);
    }

    /**
     * Scope để lấy đơn giao theo trạng thái.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param string $status
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }
}
