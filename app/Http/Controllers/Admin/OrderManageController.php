<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\DeliveryOrder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class OrderManageController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = Order::with(['user', 'address', 'orderDetails.inventory.color.product', 'deliveryOrder']);

            if ($request->has('status') && $request->status != 'all') {
                $query->where('order_status', $request->status);
            }

            if ($request->has('search') && !empty($request->search)) {
                $search = $request->search;
                $query->whereHas('user', function ($q) use ($search) {
                    $q->where('email', 'like', "%{$search}%");
                });
            }

            if ($request->has('date_from') && !empty($request->date_from)) {
                $query->whereDate('order_date', '>=', $request->date_from);
            }

            if ($request->has('date_to') && !empty($request->date_to)) {
                $query->whereDate('order_date', '<=', $request->date_to);
            }

            $sortField = $request->input('sort_by', 'order_date');
            $sortDirection = $request->input('sort_direction', 'desc');
            $query->orderBy($sortField, $sortDirection);

            $perPage = $request->input('per_page', 15);
            $orders = $query->paginate($perPage);

            return response()->json([
                'status' => true,
                'data' => $orders
            ]);
        } catch (\Exception $e) {
            Log::error('Lỗi khi lấy danh sách đơn hàng: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Lỗi khi lấy danh sách đơn hàng',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $order = Order::with([
                'user',
                'address',
                'voucher',
                'deliveryOrder', // Load delivery order
                'orderDetails.inventory.color' => function ($query) {
                    $query->with(['images', 'product']);
                }
            ])->findOrFail($id);

            return response()->json([
                'status' => true,
                'data' => $order
            ]);
        } catch (\Exception $e) {
            Log::error('Lỗi khi lấy chi tiết đơn hàng: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Lỗi khi lấy chi tiết đơn hàng',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function updateStatus(Request $request, $id)
    {
        try {
            $request->validate([
                'order_status' => 'required|in:CONFIRMED,CANCELLED', // Chỉ cho phép CONFIRMED và CANCELLED
            ]);

            DB::beginTransaction();

            $order = Order::findOrFail($id);
            $oldStatus = $order->order_status;
            $newStatus = $request->order_status;

            if (!$this->validateStatusTransition($oldStatus, $newStatus)) {
                return response()->json([
                    'status' => false,
                    'message' => 'Không thể chuyển từ trạng thái ' . $oldStatus . ' sang ' . $newStatus
                ], 422);
            }

            if ($newStatus === 'CANCELLED' && $oldStatus === 'PENDING') {
                foreach ($order->orderDetails as $detail) {
                    $detail->inventory->increment('stock_quantity', $detail->quantity);
                }
            }

            $order->order_status = $newStatus;
            $order->save();

            $order->load([
                'user',
                'address',
                'voucher',
                'deliveryOrder',
                'orderDetails.inventory.color' => function ($query) {
                    $query->with(['images', 'product']);
                }
            ]);

            DB::commit();

            return response()->json([
                'status' => true,
                'message' => 'Cập nhật trạng thái đơn hàng thành công',
                'data' => $order
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Lỗi khi cập nhật trạng thái đơn hàng: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Lỗi khi cập nhật trạng thái đơn hàng',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    private function validateStatusTransition($oldStatus, $newStatus)
    {
        $validTransitions = [
            'PENDING' => ['CONFIRMED', 'CANCELLED'], // Chỉ cho phép từ PENDING
        ];

        return in_array($newStatus, $validTransitions[$oldStatus] ?? []);
    }

    public function createDeliveryOrder($orderId)
    {
        try {
            $order = Order::findOrFail($orderId);
            if ($order->order_status !== 'CONFIRMED') {
                return response()->json([
                    'status' => false,
                    'message' => 'Chỉ có thể tạo đơn giao cho đơn hàng đã xác nhận'
                ], 422);
            }

            if ($order->deliveryOrder) {
                return response()->json([
                    'status' => false,
                    'message' => 'Đơn hàng đã có đơn giao'
                ], 422);
            }

            DB::beginTransaction();

            // Sinh mã vận đơn tự động
            $trackingNumber = 'SHP' . now()->format('YmdHis') . mt_rand(1000, 9999);
            while (DeliveryOrder::where('tracking_number', $trackingNumber)->exists()) {
                $trackingNumber = 'SHP' . now()->format('YmdHis') . mt_rand(1000, 9999);
            }

            $deliveryOrder = DeliveryOrder::create([
                'order_id' => $orderId,
                'tracking_number' => $trackingNumber,
                'status' => 'created',
            ]);

            $order->load(['deliveryOrder']);

            DB::commit();

            return response()->json([
                'status' => true,
                'message' => 'Tạo đơn giao thành công',
                'data' => $order
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Lỗi khi tạo đơn giao: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Lỗi khi tạo đơn giao',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function statistics()
    {
        try {
            $statistics = [
                'total' => Order::count(),
                'pending' => Order::where('order_status', 'PENDING')->count(),
                'confirmed' => Order::where('order_status', 'CONFIRMED')->count(),
                'delivering' => Order::where('order_status', 'DELIVERING')->count(),
                'completed' => Order::where('order_status', 'COMPLETED')->count(),
                'cancelled' => Order::where('order_status', 'CANCELLED')->count(),
                'revenue' => Order::where('order_status', 'COMPLETED')
                    ->where('payment_status', 'PAID')
                    ->sum('final_amount'),
                'recent_orders' => Order::with(['user', 'orderDetails.inventory.color.product', 'deliveryOrder'])
                    ->orderBy('order_date', 'desc')
                    ->limit(5)
                    ->get()
            ];

            return response()->json([
                'status' => true,
                'data' => $statistics
            ]);
        } catch (\Exception $e) {
            Log::error('Lỗi khi lấy thống kê đơn hàng: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Lỗi khi lấy thống kê đơn hàng',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
