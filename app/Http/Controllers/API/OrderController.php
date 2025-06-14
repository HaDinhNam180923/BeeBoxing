<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderDetail;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Voucher;
use App\Services\VNPayService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

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
                'price_voucher_id' => 'nullable|exists:vouchers,voucher_id',
                'shipping_voucher_id' => 'nullable|exists:vouchers,voucher_id',
                'payment_method' => 'required|in:COD,VNPAY',
                'note' => 'nullable|string|max:255'
            ]);

            $userId = Auth::id();
            $todayStart = Carbon::today()->startOfDay();
            $todayEnd = Carbon::today()->endOfDay();

            DB::beginTransaction();

            // Kiểm tra voucher đã dùng hôm nay
            $priceVoucherId = isset($validated['price_voucher_id']) ? $validated['price_voucher_id'] : null;
            $shippingVoucherId = isset($validated['shipping_voucher_id']) ? $validated['shipping_voucher_id'] : null;

            if ($priceVoucherId || $shippingVoucherId) {
                $usedVouchers = Order::where('user_id', $userId)
                    ->whereBetween('order_date', [$todayStart, $todayEnd])
                    ->where(function ($query) use ($priceVoucherId, $shippingVoucherId) {
                        if ($priceVoucherId) {
                            $query->orWhere('price_voucher_id', $priceVoucherId);
                        }
                        if ($shippingVoucherId) {
                            $query->orWhere('shipping_voucher_id', $shippingVoucherId);
                        }
                    })
                    ->exists();

                if ($usedVouchers) {
                    DB::rollBack();
                    return response()->json([
                        'status' => false,
                        'message' => 'Bạn đã sử dụng một trong các voucher này hôm nay'
                    ], 422);
                }
            }

            $cartItems = CartItem::whereIn('cart_item_id', $validated['selected_items'])
                ->whereHas('cart', function ($query) use ($userId) {
                    $query->where('user_id', $userId);
                })
                ->with(['inventory.color.product'])
                ->get();

            if ($cartItems->isEmpty()) {
                DB::rollBack();
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

            // Kiểm tra voucher
            $priceVoucher = $priceVoucherId ? Voucher::where('voucher_id', $priceVoucherId)
                ->where('is_active', true)
                ->where('start_date', '<=', now())
                ->where('end_date', '>=', now())
                ->where('used_count', '<', DB::raw('usage_limit'))
                ->where('voucher_type', 'price')
                ->where(function ($query) use ($userId) {
                    $query->where('is_public', true)
                        ->orWhere('user_id', $userId);
                })
                ->first() : null;

            $shippingVoucher = $shippingVoucherId ? Voucher::where('voucher_id', $shippingVoucherId)
                ->where('is_active', true)
                ->where('start_date', '<=', now())
                ->where('end_date', '>=', now())
                ->where('used_count', '<', DB::raw('usage_limit'))
                ->where('voucher_type', 'shipping')
                ->where(function ($query) use ($userId) {
                    $query->where('is_public', true)
                        ->orWhere('user_id', $userId);
                })
                ->first() : null;

            $priceDiscount = 0;
            $shippingDiscount = 0;
            $shippingFee = 30000;

            if ($priceVoucher && $subtotalAmount >= $priceVoucher->minimum_order_amount) {
                if ($priceVoucher->discount_type === 'percentage') {
                    $priceDiscount = min(
                        ($subtotalAmount * $priceVoucher->discount_amount / 100),
                        $priceVoucher->maximum_discount_amount
                    );
                } else {
                    $priceDiscount = min(
                        $priceVoucher->discount_amount,
                        $priceVoucher->maximum_discount_amount
                    );
                }
                $priceVoucher->increment('used_count');
            }

            if ($shippingVoucher && $subtotalAmount >= $shippingVoucher->minimum_order_amount) {
                if ($shippingVoucher->discount_type === 'percentage') {
                    $shippingDiscount = min(
                        ($shippingFee * $shippingVoucher->discount_amount / 100),
                        $shippingVoucher->maximum_discount_amount
                    );
                } else {
                    $shippingDiscount = min(
                        $shippingVoucher->discount_amount,
                        $shippingVoucher->maximum_discount_amount
                    );
                }
                $shippingVoucher->increment('used_count');
            }

            $discountAmount = $priceDiscount + $shippingDiscount;
            $finalAmount = $subtotalAmount + $shippingFee - $discountAmount;

            $order = Order::create([
                'user_id' => $userId,
                'address_id' => $validated['address_id'],
                'price_voucher_id' => $priceVoucher ? $priceVoucher->voucher_id : null,
                'shipping_voucher_id' => $shippingVoucher ? $shippingVoucher->voucher_id : null,
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

                Log::info('VNPay Order Created', [
                    'order_id' => $order->order_id,
                    'tracking_number' => $order->tracking_number,
                    'redirect_url' => route('payment.vnpay', ['orderId' => $order->order_id]),
                    'payment_data' => $paymentData
                ]);

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
            Log::error('Order Creation Error', ['error' => $e->getMessage(), 'request' => $request->all()]);
            return response()->json([
                'status' => false,
                'message' => 'Có lỗi xảy ra khi đặt hàng: ' . $e->getMessage()
            ], 500);
        }
    }

    public function handleVNPayReturn(Request $request)
    {
        Log::info('VNPay Return Request Received', ['url' => $request->fullUrl(), 'data' => $request->all(), 'headers' => $request->headers->all()]);

        try {
            if ($this->vnpayService->verifyReturnUrl($request->all())) {
                $vnp_ResponseCode = $request->vnp_ResponseCode;
                $vnp_TxnRef = $request->vnp_TxnRef;

                Log::info('VNPay Return Verified', ['response_code' => $vnp_ResponseCode, 'txn_ref' => $vnp_TxnRef]);

                $order = Order::where('tracking_number', $vnp_TxnRef)->first();

                if (!$order) {
                    Log::error('VNPay Order Not Found', ['txn_ref' => $vnp_TxnRef, 'request_data' => $request->all()]);
                    return redirect()->route('payment.failed')->with('error', 'Không tìm thấy đơn hàng');
                }

                if ($vnp_ResponseCode == '00') {
                    $order->payment_status = 'PAID';
                    $order->save();

                    Log::info('VNPay Payment Success', ['order_id' => $order->order_id, 'tracking_number' => $order->tracking_number, 'payment_status' => $order->payment_status]);

                    return redirect()->route('payment.success', [
                        'order_id' => $order->order_id
                    ]);
                } else {
                    $order->payment_status = 'FAILED';
                    $order->save();

                    $errorInfo = $this->vnpayService->getErrorInfo($request->all());
                    Log::error('VNPay Payment Failed', ['order_id' => $order->order_id, 'tracking_number' => $order->tracking_number, 'error_code' => $errorInfo['code'], 'error_message' => $errorInfo['message']]);

                    return redirect()->route('payment.failed', [
                        'order_id' => $order->order_id
                    ])->with('error', $errorInfo['message']);
                }
            } else {
                Log::warning('VNPay Invalid Secure Hash', ['data' => $request->all()]);
                return redirect()->route('payment.failed')->with('error', 'Dữ liệu không hợp lệ');
            }
        } catch (\Exception $e) {
            Log::error('VNPay Return Error', ['error' => $e->getMessage(), 'data' => $request->all()]);
            return redirect()->route('payment.failed')->with('error', 'Lỗi xử lý thanh toán: ' . $e->getMessage());
        }
    }

    public function getOrderHistory()
    {
        try {
            $userId = Auth::id();
            $orders = Order::where('user_id', $userId)
                ->with([
                    'orderDetails.inventory.color.product',
                    'address',
                    'priceVoucher' => function ($query) {
                        $query->select('voucher_id', 'code', 'name', 'discount_amount', 'discount_type');
                    },
                    'shippingVoucher' => function ($query) {
                        $query->select('voucher_id', 'code', 'name', 'discount_amount', 'discount_type');
                    }
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

    public function getOrderDetail(Request $request, $orderId)
    {
        try {
            $includeDeliveryOrder = $request->query('include_delivery_order', false);

            $query = Order::where('user_id', Auth::id())
                ->where('order_id', $orderId)
                ->with([
                    'orderDetails.inventory.color.product',
                    'address',
                    'priceVoucher' => function ($query) {
                        $query->select('voucher_id', 'code', 'name', 'discount_amount', 'discount_type', 'voucher_type');
                    },
                    'shippingVoucher' => function ($query) {
                        $query->select('voucher_id', 'code', 'name', 'discount_amount', 'discount_type', 'voucher_type');
                    }
                ]);

            if ($includeDeliveryOrder) {
                $query->with('deliveryOrder');
            }

            $order = $query->firstOrFail();

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

            $responseData = [
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
                        'price_voucher' => $order->priceVoucher,
                        'shipping_voucher' => $order->shippingVoucher,
                        'delivery_order' => $includeDeliveryOrder && $order->deliveryOrder ? [
                            'delivery_order_id' => $order->deliveryOrder->delivery_order_id,
                            'status' => $order->deliveryOrder->status
                        ] : null
                    ],
                    'order_details' => $orderDetails
                ]
            ];

            return response()->json($responseData);
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
                ->whereIn('order_status', ['PENDING'])
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

            // Hoàn lại used_count của voucher nếu cần
            if ($order->price_voucher_id) {
                Voucher::where('voucher_id', $order->price_voucher_id)->decrement('used_count');
            }
            if ($order->shipping_voucher_id) {
                Voucher::where('voucher_id', $order->shipping_voucher_id)->decrement('used_count');
            }

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
                ->with('deliveryOrder')
                ->first();

            if (!$order) {
                return response()->json([
                    'status' => false,
                    'message' => 'Không tìm thấy đơn hàng'
                ], 404);
            }

            if (!$order->deliveryOrder || $order->deliveryOrder->status !== 'delivered') {
                return response()->json([
                    'status' => false,
                    'message' => 'Đơn hàng chưa được shipper xác nhận giao'
                ], 403);
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
