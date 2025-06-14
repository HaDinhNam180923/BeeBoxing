<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DeliveryOrder;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

class ShipperController extends Controller
{
    public function getOrderByTrackingNumber(Request $request)
    {
        $trackingNumber = null; // Khởi tạo biến
        try {
            $request->validate([
                'tracking_number' => 'required|string|exists:delivery_orders,tracking_number',
            ]);

            $trackingNumber = $request->input('tracking_number');

            // Kiểm tra xác thực
            if (!Auth::check()) {
                Log::warning('Người dùng chưa xác nhận khi tìm đơn hàng', ['tracking_number' => $trackingNumber]);
                return response()->json([
                    'status' => false,
                    'message' => 'Vui lòng đăng nhập để tiếp tục'
                ], 401);
            }

            Log::info('Tìm đơn hàng bằng mã vận đơn', [
                'tracking_number' => $trackingNumber,
                'shipper_id' => Auth::id()
            ]);

            DB::beginTransaction();

            // Tìm đơn giao
            $deliveryOrder = DeliveryOrder::where('tracking_number', $trackingNumber)
                ->with(['order.user', 'order.address'])
                ->first();

            if (!$deliveryOrder) {
                return response()->json([
                    'status' => false,
                    'message' => 'Không tìm thấy đơn giao'
                ], 404);
            }

            // Kiểm tra trạng thái đơn
            if ($deliveryOrder->status !== 'created') {
                return response()->json([
                    'status' => false,
                    'message' => 'Đơn giao đã được nhận hoặc xử lý'
                ], 422);
            }

            // Cập nhật shipper_id, status, và assigned_at
            $deliveryOrder->shipper_id = Auth::id();
            $deliveryOrder->status = 'delivering';
            $deliveryOrder->assigned_at = now();
            $deliveryOrder->received_at = now();
            $deliveryOrder->save();

            // Cập nhật trạng thái đơn hàng trong bảng orders
            $deliveryOrder->order->update(['order_status' => 'DELIVERING']);

            DB::commit();

            return response()->json([
                'status' => true,
                'data' => $deliveryOrder
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Lỗi lấy đơn hàng bằng mã đơn hàng: ', [
                'tracking_number' => $trackingNumber ?? 'N/A',
                'shipper_id' => Auth::check() ? Auth::id() : 'null',
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'status' => false,
                'message' => 'Lỗi khi xử lý đơn hàng',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getDeliveringOrders(Request $request)
    {
        try {
            if (!Auth::check()) {
                Log::warning('Người dùng chưa xác thực khi lấy danh sách đơn hàng đang giao');
                return response()->json([
                    'status' => false,
                    'message' => 'Vui lòng đăng nhập để tiếp tục'
                ], 401);
            }

            Log::info('Bắt đầu lấy đơn hàng đang giao', [
                'shipper_id' => Auth::id(),
                'per_page' => $request->input('per_page', 15)
            ]);

            $deliveryOrders = DeliveryOrder::where('shipper_id', Auth::id())
                ->where('status', 'delivering')
                ->with(['order.user', 'order.address'])
                ->orderBy('assigned_at', 'desc')
                ->paginate($request->input('per_page', 15));

            return response()->json([
                'status' => true,
                'data' => $deliveryOrders ?: ['data' => [], 'total' => 0, 'current_page' => 1, 'last_page' => 1]
            ]);
        } catch (\Exception $e) {
            Log::error('Lỗi lấy danh sách đơn hàng đang giao: ', [
                'shipper_id' => Auth::check() ? Auth::id() : 'null',
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'status' => false,
                'message' => 'Lỗi khi lấy danh sách đơn hàng đang giao',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getDeliveredOrders(Request $request)
    {
        try {
            if (!Auth::check()) {
                Log::warning('Người dùng chưa xác thực khi lấy danh sách đơn hàng đã giao');
                return response()->json([
                    'status' => false,
                    'message' => 'Vui lòng đăng nhập để tiếp tục'
                ], 401);
            }

            Log::info('Bắt đầu lấy đơn hàng đã giao', [
                'shipper_id' => Auth::id(),
                'per_page' => $request->input('per_page', 15)
            ]);

            $deliveryOrders = DeliveryOrder::where('shipper_id', Auth::id())
                ->where('status', 'delivered')
                ->with(['order.user', 'order.address'])
                ->orderBy('delivered_at', 'desc')
                ->paginate($request->input('per_page', 15));

            return response()->json([
                'status' => true,
                'data' => $deliveryOrders ?: ['data' => [], 'total' => 0, 'current_page' => 1, 'last_page' => 1]
            ]);
        } catch (\Exception $e) {
            Log::error('Lỗi lấy danh sách đơn hàng đã giao: ', [
                'shipper_id' => Auth::check() ? Auth::id() : 'null',
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'status' => false,
                'message' => 'Lỗi khi lấy danh sách đơn hàng đã giao',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getOrderDetail($orderId)
    {
        try {
            if (!Auth::check()) {
                Log::warning('Người dùng chưa xác thực khi lấy chi tiết đơn hàng', ['order_id' => $orderId]);
                return response()->json([
                    'status' => false,
                    'message' => 'Vui lòng đăng nhập để tiếp tục'
                ], 401);
            }

            Log::info('Lấy chi tiết đơn hàng', [
                'order_id' => $orderId,
                'shipper_id' => Auth::id()
            ]);

            $deliveryOrder = DeliveryOrder::where('order_id', $orderId)
                ->where('shipper_id', Auth::id())
                ->with(['order.user', 'order.address'])
                ->first();

            if (!$deliveryOrder) {
                return response()->json([
                    'status' => false,
                    'message' => 'Không tìm thấy đơn hàng hoặc bạn không có quyền truy cập'
                ], 404);
            }

            return response()->json([
                'status' => true,
                'data' => $deliveryOrder
            ]);
        } catch (\Exception $e) {
            Log::error('Lỗi lấy chi tiết đơn hàng: ', [
                'order_id' => $orderId,
                'shipper_id' => Auth::check() ? Auth::id() : 'null',
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'status' => false,
                'message' => 'Lỗi khi lấy chi tiết đơn hàng',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function markAsReceived(Request $request, $orderId)
    {
        try {
            if (!Auth::check()) {
                Log::warning('Người dùng chưa xác thực khi đánh dấu đã lấy hàng', ['order_id' => $orderId]);
                return response()->json([
                    'status' => false,
                    'message' => 'Vui lòng đăng nhập để tiếp tục'
                ], 401);
            }

            Log::info('Đánh dấu đơn hàng đã lấy hàng', [
                'order_id' => $orderId,
                'shipper_id' => Auth::id()
            ]);

            DB::beginTransaction();

            $deliveryOrder = DeliveryOrder::where('order_id', $orderId)
                ->where('shipper_id', Auth::id())
                ->where('status', 'created')
                ->first();

            if (!$deliveryOrder) {
                return response()->json([
                    'status' => false,
                    'message' => 'Không tìm thấy đơn hàng hoặc trạng thái không phù hợp'
                ], 404);
            }

            $deliveryOrder->status = 'delivering';
            $deliveryOrder->received_at = now();
            $deliveryOrder->save();

            $deliveryOrder->order->update(['order_status' => 'DELIVERING']);

            DB::commit();

            $deliveryOrder->load(['order.user', 'order.address']);

            return response()->json([
                'status' => true,
                'data' => $deliveryOrder
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Lỗi đánh dấu đã lấy hàng: ', [
                'order_id' => $orderId,
                'shipper_id' => Auth::check() ? Auth::id() : 'null',
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'status' => false,
                'message' => 'Lỗi khi đánh dấu đã lấy hàng',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function markAsDelivered(Request $request, $orderId)
    {
        try {
            $request->validate([
                'proof_image' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
            ]);

            if (!Auth::check()) {
                Log::warning('Người dùng chưa xác thực khi đánh dấu đã giao hàng', ['order_id' => $orderId]);
                return response()->json([
                    'status' => false,
                    'message' => 'Vui lòng đăng nhập để tiếp tục'
                ], 401);
            }

            Log::info('Đánh dấu đơn hàng đã giao hàng', [
                'order_id' => $orderId,
                'shipper_id' => Auth::id()
            ]);

            DB::beginTransaction();

            $deliveryOrder = DeliveryOrder::where('order_id', $orderId)
                ->where('shipper_id', Auth::id())
                ->where('status', 'delivering')
                ->first();

            if (!$deliveryOrder) {
                return response()->json([
                    'status' => false,
                    'message' => 'Không tìm thấy đơn hàng hoặc trạng thái không phù hợp'
                ], 404);
            }

            // Lưu ảnh chứng minh
            // Lưu ảnh chứng minh
            $imagePath = $request->file('proof_image')->store('proof_images', 'public');
            $imageUrl = url('storage/' . $imagePath);

            $deliveryOrder->status = 'delivered';
            $deliveryOrder->delivered_at = now();
            $deliveryOrder->proof_image = $imageUrl;
            $deliveryOrder->save();

            DB::commit();

            $deliveryOrder->load(['order.user', 'order.address']);

            return response()->json([
                'status' => true,
                'data' => $deliveryOrder
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Lỗi đánh dấu đã giao hàng: ', [
                'order_id' => $orderId,
                'shipper_id' => Auth::check() ? Auth::id() : 'null',
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'status' => false,
                'message' => 'Lỗi khi đánh dấu đã giao hàng',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
