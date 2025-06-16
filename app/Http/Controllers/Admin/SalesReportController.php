<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\OrderDetail;
use App\Models\Product;
use App\Models\Category;
use App\Models\User;
use App\Models\ProductImage;
use App\Models\ProductColor;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class SalesReportController extends Controller
{
    /**
     * Thống kê doanh số tổng quan
     */
    public function getOverview(Request $request)
    {
        try {
            // Xác định khoảng thời gian
            $startDate = $request->input('start_date', Carbon::now()->startOfMonth());
            $endDate = $request->input('end_date', Carbon::now()->endOfMonth());
            $start = Carbon::parse($startDate)->startOfDay();
            $end = Carbon::parse($endDate)->endOfDay();

            // Tổng doanh thu
            $totalRevenue = Order::whereBetween('order_date', [$start, $end])
                ->where('order_status', 'COMPLETED')
                ->sum('final_amount');

            // Tổng số đơn hàng
            $totalOrders = Order::whereBetween('order_date', [$start, $end])
                ->where('order_status', 'COMPLETED')
                ->count();

            // Tổng số sản phẩm bán ra
            $totalProductsSold = OrderDetail::whereHas('order', function ($query) use ($start, $end) {
                $query->whereBetween('order_date', [$start, $end])
                    ->where('order_status', 'COMPLETED');
            })->sum('quantity');

            // Doanh thu theo danh mục
            $revenueByCategory = Category::select('categories.category_id', 'categories.name')
                ->leftJoin('products', 'categories.category_id', '=', 'products.category_id')
                ->leftJoin('product_colors', 'products.product_id', '=', 'product_colors.product_id')
                ->leftJoin('product_inventory', 'product_colors.color_id', '=', 'product_inventory.color_id')
                ->leftJoin('order_details', 'product_inventory.inventory_id', '=', 'order_details.inventory_id')
                ->leftJoin('orders', 'order_details.order_id', '=', 'orders.order_id')
                ->whereBetween('orders.order_date', [$start, $end])
                ->where('orders.order_status', 'COMPLETED')
                ->groupBy('categories.category_id', 'categories.name')
                ->selectRaw('COALESCE(SUM(order_details.quantity * order_details.unit_price), 0) as revenue')
                ->get();

            // Top sản phẩm bán chạy
            $topProducts = Product::select(
                'products.product_id',
                'products.name',
                'product_images.image_url'
            )
                ->leftJoin('product_colors', 'products.product_id', '=', 'product_colors.product_id')
                ->leftJoin('product_images', function ($join) {
                    $join->on('product_colors.color_id', '=', 'product_images.color_id')
                        ->where('product_images.is_primary', 1);
                })
                ->leftJoin('product_inventory', 'product_colors.color_id', '=', 'product_inventory.color_id')
                ->leftJoin('order_details', 'product_inventory.inventory_id', '=', 'order_details.inventory_id')
                ->leftJoin('orders', 'order_details.order_id', '=', 'orders.order_id')
                ->whereBetween('orders.order_date', [$start, $end])
                ->where('orders.order_status', 'COMPLETED')
                ->groupBy('products.product_id', 'products.name', 'product_images.image_url')
                ->selectRaw('COALESCE(SUM(order_details.quantity), 0) as total_sold, COALESCE(SUM(order_details.quantity * order_details.unit_price), 0) as revenue')
                ->orderByDesc('total_sold')
                ->take(5)
                ->get();

            // Sản phẩm bán ế nhất
            $lowestSellingProducts = Product::select(
                'products.product_id',
                'products.name',
                'product_images.image_url'
            )
                ->leftJoin('product_colors', 'products.product_id', '=', 'product_colors.product_id')
                ->leftJoin('product_images', function ($join) {
                    $join->on('product_colors.color_id', '=', 'product_images.color_id')
                        ->where('product_images.is_primary', 1);
                })
                ->leftJoin('product_inventory', 'product_colors.color_id', '=', 'product_inventory.color_id')
                ->leftJoin('order_details', 'product_inventory.inventory_id', '=', 'order_details.inventory_id')
                ->leftJoin('orders', 'order_details.order_id', '=', 'orders.order_id')
                ->whereBetween('orders.order_date', [$start, $end])
                ->where('orders.order_status', 'COMPLETED')
                ->groupBy('products.product_id', 'products.name', 'product_images.image_url')
                ->selectRaw('COALESCE(SUM(order_details.quantity), 0) as total_sold, COALESCE(SUM(order_details.quantity * order_details.unit_price), 0) as revenue')
                ->orderBy('total_sold', 'asc')
                ->take(5)
                ->get();

            // Người dùng tiêu nhiều nhất
            $topSpendingUsers = User::select('users.id', 'users.name', 'users.email')
                ->leftJoin('orders', 'users.id', '=', 'orders.user_id')
                ->whereBetween('orders.order_date', [$start, $end])
                ->where('orders.order_status', 'COMPLETED')
                ->groupBy('users.id', 'users.name', 'users.email')
                ->selectRaw('COALESCE(SUM(orders.final_amount), 0) as total_spent')
                ->orderByDesc('total_spent')
                ->take(5)
                ->get();

            return response()->json([
                'status' => 'success',
                'message' => 'Sales report retrieved successfully',
                'data' => [
                    'total_revenue' => (float) $totalRevenue,
                    'total_orders' => $totalOrders,
                    'total_products_sold' => $totalProductsSold,
                    'revenue_by_category' => $revenueByCategory,
                    'top_products' => $topProducts,
                    'lowest_selling_products' => $lowestSellingProducts,
                    'top_spending_users' => $topSpendingUsers,
                    'start_date' => $start->toDateString(),
                    'end_date' => $end->toDateString(),
                ]
            ], 200);
        } catch (\Exception $e) {
            Log::error('Failed to retrieve sales report', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request' => $request->all(),
            ]);
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve sales report',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Thống kê doanh số theo ngày
     */
    public function getDailyReport(Request $request)
    {
        try {
            $startDate = $request->input('start_date', Carbon::now()->startOfMonth());
            $endDate = $request->input('end_date', Carbon::now()->endOfMonth());
            $start = Carbon::parse($startDate)->startOfDay();
            $end = Carbon::parse($endDate)->endOfDay();

            $dailyRevenue = Order::select(
                DB::raw('DATE(order_date) as date'),
                DB::raw('SUM(final_amount) as revenue'),
                DB::raw('COUNT(*) as order_count')
            )
                ->whereBetween('order_date', [$start, $end])
                ->where('order_status', 'COMPLETED')
                ->groupBy(DB::raw('DATE(order_date)'))
                ->orderBy('date')
                ->get();

            return response()->json([
                'status' => 'success',
                'message' => 'Daily sales report retrieved successfully',
                'data' => $dailyRevenue
            ], 200);
        } catch (\Exception $e) {
            Log::error('Failed to retrieve daily sales report', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request' => $request->all(),
            ]);
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve daily sales report',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
