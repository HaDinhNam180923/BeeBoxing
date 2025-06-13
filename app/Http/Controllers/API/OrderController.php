<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderDetail;
use App\Models\Cart;
use App\Models\Review;
use App\Models\CartItem;
use App\Models\Voucher;
use App\Services\VNPayService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class OrderController extends Controller
{
    protected $vnpayService;

    public function __construct(VNPayService $vnpayService)
    {
        $this->vnpayService = $vnpayService;
    }

    private function generateTrackingNumber()
    {
        do {
            $trackingNumber = 'BB-' . Carbon::now()->format('Ymd') . '-' .
                str_pad(random_int(0, 99999), 5, '0', STR_PAD_LEFT);
            $exists = Order::where('tracking_number', $trackingNumber)->exists();
        } while ($exists);

        return $trackingNumber;
    }

    public function placeOrder(Request $request)
    {
        try {
            $validated = $request->validate([
                'address_id' => 'required|exists:addresses,address_id',
                'selected_items' => 'required|array',
                'selected_items.*' => 'exists:cart_items,cart_item_id',
                'voucher_code' => 'nullable|string|exists:vouchers,code',
                'payment_method' => 'required|in:COD,VNPAY',
                'note' => 'nullable|string|max:255'
            ]);

            $userId = Auth::id();

            DB::beginTransaction();

            $cartItems = CartItem::whereIn('cart_item_id', $validated['selected_items'])
                ->whereHas('cart', function ($query) use ($userId) {
                    $query->where('user_id', $userId);
                })
                ->with(['inventory.color.product'])
                ->get();

            if ($cartItems->isEmpty()) {
                return response()->json([
                    'status' => false,
                    'message' => 'Không tìm thấy sản phẩm nào được chọn'
                ], 400);
            }

            $subtotalAmount = 0;
            $orderItems = [];

            foreach ($cartItems as $item) {
                if ($item->quantity > $item->inventory->stock_quantity) {
                    DB::rollBack();
                    return response()->json([
                        'status' => false,
                        'message' => "Sản phẩm {$item->inventory->color->product->name} không đủ số lượng trong kho"
                    ], 400);
                }

                $product = $item->inventory->color->product;
                $basePrice = $product->base_price * (1 - ($product->discount / 100));
                $finalPrice = round($basePrice * (1 + ($item->inventory->price_adjustment / 100)));
                $subtotal = $finalPrice * $item->quantity;

                $subtotalAmount += $subtotal;
                $orderItems[] = [
                    'inventory_id' => $item->inventory_id,
                    'quantity' => $item->quantity,
                    'unit_price' => $finalPrice,
                    'subtotal' => $subtotal
                ];

                $item->inventory->decrement('stock_quantity', $item->quantity);
            }

            $voucherId = null;
            $discountAmount = 0;

            if (!empty($validated['voucher_code'])) {
                $voucher = Voucher::where('code', $validated['voucher_code'])
                    ->where('is_active', true)
                    ->where('start_date', '<=', now())
                    ->where('end_date', '>=', now())
                    ->where('used_count', '<', DB::raw('usage_limit'))
                    ->where(function ($query) use ($userId) {
                        $query->where('is_public', true)
                            ->orWhere('user_id', $userId);
                    })
                    ->first();

                if ($voucher && $subtotalAmount >= $voucher->minimum_order_amount) {
                    $voucherId = $voucher->voucher_id;

                    if ($voucher->discount_type === 'percentage') {
                        $discountAmount = min(
                            ($subtotalAmount * $voucher->discount_amount / 100),
                            $voucher->maximum_discount_amount
                        );
                    } else {
                        $discountAmount = min(
                            $voucher->discount_amount,
                            $voucher->maximum_discount_amount
                        );
                    }

                    $voucher->increment('used_count');
                }
            }

            $shippingFee = 30000;
            $finalAmount = $subtotalAmount + $shippingFee - $discountAmount;

            $order = Order::create([
                'user_id' => $userId,
                'address_id' => $validated['address_id'],
                'voucher_id' => $voucherId,
                'order_date' => now(),
                'subtotal_amount' => $subtotalAmount,
                'shipping_fee' => $shippingFee,
                'discount_amount' => $discountAmount,
                'final_amount' => $finalAmount,
                'payment_method' => $validated['payment_method'],
                'payment_status' => 'PENDING',
                'order_status' => 'PENDING',
                'note' => $validated['note'] ?? null,
                'tracking_number' => $this->generateTrackingNumber()
            ]);

            foreach ($orderItems as $item) {
                OrderDetail::create([
                    'order_id' => $order->order_id,
                    'inventory_id' => $item['inventory_id'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'subtotal' => $item['subtotal']
                ]);
            }

            CartItem::whereIn('cart_item_id', $validated['selected_items'])->delete();

            if ($validated['payment_method'] === 'VNPAY') {
                $paymentData = $this->vnpayService->createPaymentData($order);

                DB::commit();

                return response()->json([
                    'status' => true,
                    'message' => 'Đơn hàng đã được tạo',
                    'data' => [
                        'order_id' => $order->order_id,
                        'redirect_url' => route('payment.vnpay', [
                            'orderId' => $order->order_id,
                            'paymentData' => $paymentData
                        ])
                    ]
                ]);
            }

            DB::commit();

            return response()->json([
                'status' => true,
                'message' => 'Đặt hàng thành công',
                'data' => [
                    'order_id' => $order->order_id,
                    'tracking_number' => $order->tracking_number,
                    'final_amount' => $order->final_amount,
                    'order_status' => $order->order_status,
                    'payment_status' => $order->payment_status
                ]
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => false,
                'message' => 'Có lỗi xảy ra khi đặt hàng: ' . $e->getMessage()
            ], 500);
        }
    }

    public function handleVNPayReturn(Request $request)
    {
        if ($this->vnpayService->verifyReturnUrl($request->all())) {
            $vnp_ResponseCode = $request->vnp_ResponseCode;
            $vnp_TxnRef = $request->vnp_TxnRef;

            try {
                $order = Order::where('tracking_number', $vnp_TxnRef)->firstOrFail();

                if ($vnp_ResponseCode == '00') {
                    $order->payment_status = 'PAID';
                    $order->save();

                    return redirect()->route('payment.success', [
                        'order_id' => $order->order_id
                    ]);
                } else {
                    $order->payment_status = 'FAILED';
                    $order->save();

                    return redirect()->route('payment.failed', [
                        'order_id' => $order->order_id
                    ]);
                }
            } catch (\Exception $e) {
                return redirect()->route('payment.failed')->with('error', 'Không tìm thấy đơn hàng');
            }
        }

        return redirect()->route('payment.failed')->with('error', 'Dữ liệu không hợp lệ');
    }

    public function getOrderHistory()
    {
        try {
            $userId = Auth::id();
            $orders = Order::where('user_id', $userId)
                ->with([
                    'orderDetails.inventory.color.product',
                    'address'
                ])
                ->orderBy('order_date', 'desc')
                ->get()
                ->map(function ($order) {
                    return [
                        'order_id' => $order->order_id,
                        'tracking_number' => $order->tracking_number,
                        'order_date' => $order->order_date->format('Y-m-d H:i:s'),
                        'final_amount' => $order->final_amount,
                        'order_status' => $order->order_status,
                        'payment_status' => $order->payment_status,
                        'total_items' => $order->orderDetails->sum('quantity'),
                        'items' => $order->orderDetails->map(function ($detail) {
                            $product = $detail->inventory->color->product;
                            $color = $detail->inventory->color;
                            return [
                                'product_id' => $product->product_id,
                                'product_name' => $product->name,
                                'color_name' => $color->color_name,
                                'size' => $detail->inventory->size,
                                'quantity' => $detail->quantity,
                                'unit_price' => $detail->unit_price,
                                'subtotal' => $detail->subtotal,
                                'image_url' => $color->images->first()->image_url ?? null
                            ];
                        })
                    ];
                });

            return response()->json([
                'status' => true,
                'data' => $orders
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Lỗi khi lấy lịch sử đơn hàng',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getOrderDetail($orderId)
    {
        try {
            $order = Order::where('user_id', Auth::id())
                ->where('order_id', $orderId)
                ->with([
                    'orderDetails.inventory.color.product',
                    'address',
                    'voucher'
                ])
                ->firstOrFail();

            $orderDetails = $order->orderDetails->map(function ($detail) {
                $product = $detail->inventory->color->product;
                $color = $detail->inventory->color;

                return [
                    'order_detail_id' => $detail->order_detail_id,
                    'product_id' => $product->product_id,
                    'product_name' => $product->name,
                    'color_name' => $color->color_name,
                    'size' => $detail->inventory->size,
                    'quantity' => $detail->quantity,
                    'unit_price' => $detail->unit_price,
                    'subtotal' => $detail->subtotal,
                    'image_url' => $color->images->first()->image_url ?? null
                ];
            });

            return response()->json([
                'status' => true,
                'data' => [
                    'order' => [
                        'order_id' => $order->order_id,
                        'tracking_number' => $order->tracking_number,
                        'order_date' => $order->order_date->format('Y-m-d H:i:s'),
                        'subtotal_amount' => $order->subtotal_amount,
                        'shipping_fee' => $order->shipping_fee,
                        'discount_amount' => $order->discount_amount,
                        'final_amount' => $order->final_amount,
                        'payment_method' => $order->payment_method,
                        'payment_status' => $order->payment_status,
                        'order_status' => $order->order_status,
                        'note' => $order->note,
                        'address' => $order->address,
                        'voucher' => $order->voucher
                    ],
                    'order_details' => $orderDetails
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Lỗi khi lấy chi tiết đơn hàng',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function cancelOrder($orderId)
    {
        try {
            $order = Order::where('order_id', $orderId)
                ->where('user_id', Auth::id())
                ->whereIn('order_status', ['PENDING', 'CONFIRMED'])
                ->first();

            if (!$order) {
                return response()->json([
                    'status' => false,
                    'message' => 'Không tìm thấy đơn hàng hoặc không thể hủy'
                ], 404);
            }

            $order->update([
                'order_status' => 'CANCELLED'
            ]);

            return response()->json([
                'status' => true,
                'message' => 'Hủy đơn hàng thành công'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Lỗi khi hủy đơn hàng',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function confirmDelivery($orderId)
    {
        try {
            DB::beginTransaction();

            $order = Order::where('order_id', $orderId)
                ->where('user_id', Auth::id())
                ->where('order_status', 'DELIVERING')
                ->first();

            if (!$order) {
                return response()->json([
                    'status' => false,
                    'message' => 'Không tìm thấy đơn hàng hoặc không thể xác nhận'
                ], 404);
            }

            $order->update([
                'order_status' => 'COMPLETED',
                'payment_status' => $order->payment_method === 'COD' ? 'PAID' : $order->payment_status
            ]);

            DB::commit();

            return response()->json([
                'status' => true,
                'message' => 'Xác nhận giao hàng thành công'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Lỗi khi xác nhận giao hàng: ' . $e->getMessage());

            return response()->json([
                'status' => false,
                'message' => 'Lỗi khi xác nhận giao hàng',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
