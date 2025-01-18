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
use Inertia\Inertia;

class OrderController extends Controller
{
    protected $vnpayService;

    // Khởi tạo VNPayService để xử lý các tác vụ liên quan đến thanh toán
    public function __construct(VNPayService $vnpayService)
    {
        $this->vnpayService = $vnpayService;
    }

    // Hàm tạo mã đơn hàng unique
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
            // Validate dữ liệu đầu vào
            $validated = $request->validate([
                'address_id' => 'required|exists:addresses,address_id',
                'selected_items' => 'required|array',
                'selected_items.*' => 'exists:cart_items,cart_item_id',
                'voucher_code' => 'nullable|string|exists:vouchers,code',
                'payment_method' => 'required|in:COD,VNPAY',
                'note' => 'nullable|string|max:255'
            ]);

            $userId = Auth::id();

            // Bắt đầu transaction để đảm bảo tính nhất quán của dữ liệu
            DB::beginTransaction();

            // Lấy thông tin các sản phẩm được chọn từ giỏ hàng
            $cartItems = CartItem::whereIn('cart_item_id', $validated['selected_items'])
                ->whereHas('cart', function ($query) use ($userId) {
                    $query->where('user_id', $userId);
                })
                ->with(['inventory.color.product'])
                ->get();

            // Kiểm tra xem có sản phẩm nào được chọn không
            if ($cartItems->isEmpty()) {
                return response()->json([
                    'status' => false,
                    'message' => 'Không tìm thấy sản phẩm nào được chọn'
                ], 400);
            }

            // Xử lý từng sản phẩm trong giỏ hàng
            $subtotalAmount = 0;
            $orderItems = [];

            foreach ($cartItems as $item) {
                // Kiểm tra số lượng tồn kho
                if ($item->quantity > $item->inventory->stock_quantity) {
                    DB::rollBack();
                    return response()->json([
                        'status' => false,
                        'message' => "Sản phẩm {$item->inventory->color->product->name} không đủ số lượng trong kho"
                    ], 400);
                }

                // Tính giá sản phẩm sau khi áp dụng các loại giảm giá
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

                // Cập nhật số lượng tồn kho
                $item->inventory->decrement('stock_quantity', $item->quantity);
            }

            // Xử lý voucher nếu có
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

                    // Tính số tiền giảm giá dựa vào loại voucher
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

                    // Cập nhật số lần sử dụng voucher
                    $voucher->increment('used_count');
                }
            }

            // Tính tổng tiền cuối cùng
            $shippingFee = 30000; // Phí vận chuyển cố định
            $finalAmount = $subtotalAmount + $shippingFee - $discountAmount;

            // Tạo đơn hàng mới
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

            // Tạo chi tiết đơn hàng
            foreach ($orderItems as $item) {
                OrderDetail::create([
                    'order_id' => $order->order_id,
                    'inventory_id' => $item['inventory_id'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'subtotal' => $item['subtotal']
                ]);
            }

            // Xóa sản phẩm đã đặt khỏi giỏ hàng
            CartItem::whereIn('cart_item_id', $validated['selected_items'])->delete();

            // Xử lý phương thức thanh toán
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

            // Nếu là thanh toán COD
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

    // Xử lý callback từ VNPay
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
}
