<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class OrderManageController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = Order::with(['user', 'address', 'orderDetails.inventory.color.product']);

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
                'order_status' => 'required|in:PENDING,CONFIRMED,DELIVERING,COMPLETED,CANCELLED',
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

            if ($newStatus === 'CANCELLED' && ($oldStatus === 'PENDING' || $oldStatus === 'CONFIRMED')) {
                foreach ($order->orderDetails as $detail) {
                    $detail->inventory->increment('stock_quantity', $detail->quantity);
                }
            }

            if ($newStatus === 'COMPLETED' && $order->payment_method === 'COD') {
                $order->payment_status = 'PAID';
            }

            $order->order_status = $newStatus;
            $order->save();

            $order->load([
                'user',
                'address',
                'voucher',
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
            'PENDING' => ['CONFIRMED', 'CANCELLED'],
            'CONFIRMED' => ['DELIVERING', 'CANCELLED'],
            'DELIVERING' => ['COMPLETED', 'CANCELLED'],
            'COMPLETED' => [],
            'CANCELLED' => []
        ];

        return in_array($newStatus, $validTransitions[$oldStatus] ?? []);
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
                'recent_orders' => Order::with(['user', 'orderDetails.inventory.color.product'])
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
