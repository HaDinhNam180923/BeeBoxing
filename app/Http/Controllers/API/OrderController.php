<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderDetail;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Voucher;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

class OrderController extends Controller
{
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
                'payment_method' => 'required|in:COD,BANKING',
                'note' => 'nullable|string|max:255'
            ]);

            $userId = Auth::id();

            // Bắt đầu transaction
            DB::beginTransaction();

            // Lấy các sản phẩm được chọn từ giỏ hàng
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

            // Tính tổng tiền và kiểm tra tồn kho
            $subtotalAmount = 0;
            $orderItems = [];

            foreach ($cartItems as $item) {
                // Kiểm tra tồn kho
                if ($item->quantity > $item->inventory->stock_quantity) {
                    DB::rollBack();
                    return response()->json([
                        'status' => false,
                        'message' => "Sản phẩm {$item->inventory->color->product->name} không đủ số lượng trong kho"
                    ], 400);
                }

                // Tính giá sản phẩm sau khi áp dụng giảm giá
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
                // Log để debug
                Log::info('Processing voucher', ['code' => $validated['voucher_code']]);

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

                Log::info('Voucher found', ['voucher' => $voucher]);

                if ($voucher) {
                    if ($subtotalAmount >= $voucher->minimum_order_amount) {
                        $voucherId = $voucher->voucher_id;

                        // Tính số tiền giảm giá
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

                        Log::info('Discount calculated', [
                            'amount' => $discountAmount,
                            'type' => $voucher->discount_type
                        ]);

                        // Cập nhật số lần sử dụng voucher
                        $voucher->increment('used_count');
                    } else {
                        Log::info('Order amount not met minimum requirement', [
                            'subtotal' => $subtotalAmount,
                            'minimum_required' => $voucher->minimum_order_amount
                        ]);
                    }
                }
            }

            // Tính phí vận chuyển
            $shippingFee = 30000;

            // Tính tổng tiền cuối cùng
            $finalAmount = $subtotalAmount + $shippingFee - $discountAmount;

            Log::info('Final order amounts', [
                'subtotal' => $subtotalAmount,
                'shipping' => $shippingFee,
                'discount' => $discountAmount,
                'final' => $finalAmount,
                'voucher_id' => $voucherId
            ]);

            // Tạo đơn hàng
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
            Log::error('Order placement failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'status' => false,
                'message' => 'Có lỗi xảy ra khi đặt hàng',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
