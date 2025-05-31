<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Voucher;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class VoucherController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = Voucher::query();

            // Tìm kiếm theo từ khóa
            if ($request->filled('search')) {
                $search = $request->input('search');
                $query->where(function ($q) use ($search) {
                    $q->where('code', 'like', "%{$search}%")
                        ->orWhere('name', 'like', "%{$search}%");
                });
            }

            // Lọc theo trạng thái
            $status = $request->input('status', 'all');
            $now = Carbon::now();

            switch ($status) {
                case 'active':
                    $query->where('is_active', true)
                        ->where('start_date', '<=', $now)
                        ->where('end_date', '>=', $now)
                        ->whereRaw('used_count < usage_limit');
                    break;
                case 'inactive':
                    $query->where('is_active', false);
                    break;
                case 'upcoming':
                    $query->where('is_active', true)
                        ->where('start_date', '>', $now);
                    break;
                case 'expired':
                    $query->where(function ($q) use ($now) {
                        $q->where('end_date', '<', $now)
                            ->orWhereRaw('used_count >= usage_limit')
                            ->orWhere('is_active', false);
                    });
                    break;
            }

            // Sắp xếp theo start_date thay vì created_at
            $vouchers = $query->orderBy('start_date', 'desc')->get();

            return response()->json([
                'status' => true,
                'data' => $vouchers
            ]);
        } catch (\Exception $e) {
            Log::error('Voucher index method error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'input' => $request->all()
            ]);

            return response()->json([
                'status' => false,
                'message' => 'Lỗi khi lấy danh sách mã giảm giá',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Phương thức phụ trợ để xác định trạng thái voucher
    private function determineVoucherStatus($voucher)
    {
        $now = Carbon::now();

        if (!$voucher->is_active) {
            return 'Vô hiệu';
        }

        if ($now < Carbon::parse($voucher->start_date)) {
            return 'Sắp diễn ra';
        }

        if ($now > Carbon::parse($voucher->end_date)) {
            return 'Hết hạn';
        }

        if ($voucher->used_count >= $voucher->usage_limit) {
            return 'Đã sử dụng hết';
        }

        return 'Đang hoạt động';
    }

    public function show($id)
    {
        try {
            $voucher = Voucher::findOrFail($id);

            return response()->json([
                'status' => true,
                'data' => $voucher
            ]);
        } catch (\Exception $e) {
            Log::error('Lỗi khi lấy thông tin mã giảm giá: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Lỗi khi lấy thông tin mã giảm giá',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'code' => 'required|string|max:50|unique:vouchers,code',
                'name' => 'required|string|max:255',
                'description' => 'nullable|string',
                'discount_amount' => 'required|numeric|min:0',
                'minimum_order_amount' => 'required|numeric|min:0',
                'maximum_discount_amount' => 'required|numeric|min:0',
                'usage_limit' => 'required|integer|min:1',
                'start_date' => 'required|date',
                'end_date' => 'required|date|after:start_date',
                'is_active' => 'boolean',
                'discount_type' => 'required|in:percentage,fixed',
                'is_public' => 'boolean',
                'user_id' => 'nullable|exists:users,id'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => false,
                    'errors' => $validator->errors()
                ], 422);
            }

            // Kiểm tra phần trăm giảm giá nếu là loại phần trăm
            if ($request->discount_type === 'percentage' && $request->discount_amount > 100) {
                return response()->json([
                    'status' => false,
                    'errors' => ['discount_amount' => ['Giá trị phần trăm không được vượt quá 100%']]
                ], 422);
            }

            DB::beginTransaction();

            // Tạo mã giảm giá mới
            $voucher = Voucher::create([
                'code' => strtoupper($request->code),
                'name' => $request->name,
                'description' => $request->description,
                'discount_amount' => $request->discount_amount,
                'minimum_order_amount' => $request->minimum_order_amount,
                'maximum_discount_amount' => $request->maximum_discount_amount,
                'usage_limit' => $request->usage_limit,
                'used_count' => 0,
                'start_date' => Carbon::parse($request->start_date),
                'end_date' => Carbon::parse($request->end_date),
                'is_active' => $request->is_active ?? true,
                'discount_type' => $request->discount_type,
                'is_public' => $request->is_public ?? true,
                'user_id' => $request->is_public ? null : $request->user_id
            ]);

            DB::commit();

            return response()->json([
                'status' => true,
                'message' => 'Tạo mã giảm giá thành công',
                'data' => $voucher
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Lỗi khi tạo mã giảm giá: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Lỗi khi tạo mã giảm giá',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $voucher = Voucher::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'code' => 'required|string|max:50|unique:vouchers,code,' . $id . ',voucher_id',
                'name' => 'required|string|max:255',
                'description' => 'nullable|string',
                'discount_amount' => 'required|numeric|min:0',
                'minimum_order_amount' => 'required|numeric|min:0',
                'maximum_discount_amount' => 'required|numeric|min:0',
                'usage_limit' => 'required|integer|min:' . $voucher->used_count,
                'start_date' => 'required|date',
                'end_date' => 'required|date|after:start_date',
                'is_active' => 'boolean',
                'discount_type' => 'required|in:percentage,fixed',
                'is_public' => 'boolean',
                'user_id' => 'nullable|exists:users,id'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => false,
                    'errors' => $validator->errors()
                ], 422);
            }

            // Kiểm tra phần trăm giảm giá nếu là loại phần trăm
            if ($request->discount_type === 'percentage' && $request->discount_amount > 100) {
                return response()->json([
                    'status' => false,
                    'errors' => ['discount_amount' => ['Giá trị phần trăm không được vượt quá 100%']]
                ], 422);
            }

            DB::beginTransaction();

            // Cập nhật thông tin voucher
            $voucher->code = strtoupper($request->code);
            $voucher->name = $request->name;
            $voucher->description = $request->description;
            $voucher->discount_amount = $request->discount_amount;
            $voucher->minimum_order_amount = $request->minimum_order_amount;
            $voucher->maximum_discount_amount = $request->maximum_discount_amount;
            $voucher->usage_limit = $request->usage_limit;
            $voucher->start_date = Carbon::parse($request->start_date);
            $voucher->end_date = Carbon::parse($request->end_date);
            $voucher->is_active = $request->is_active ?? true;
            $voucher->discount_type = $request->discount_type;
            $voucher->is_public = $request->is_public ?? true;
            $voucher->user_id = $request->is_public ? null : $request->user_id;

            $voucher->save();

            DB::commit();

            return response()->json([
                'status' => true,
                'message' => 'Cập nhật mã giảm giá thành công',
                'data' => $voucher
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Lỗi khi cập nhật mã giảm giá: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Lỗi khi cập nhật mã giảm giá',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            DB::beginTransaction();

            $voucher = Voucher::findOrFail($id);

            // Kiểm tra xem voucher đã được sử dụng chưa
            if ($voucher->used_count > 0) {
                return response()->json([
                    'status' => false,
                    'message' => 'Không thể xóa mã giảm giá đã được sử dụng'
                ], 422);
            }

            $voucher->delete();

            DB::commit();

            return response()->json([
                'status' => true,
                'message' => 'Xóa mã giảm giá thành công'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Lỗi khi xóa mã giảm giá: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Lỗi khi xóa mã giảm giá',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function toggleStatus($id)
    {
        try {
            $voucher = Voucher::findOrFail($id);
            $voucher->is_active = !$voucher->is_active;
            $voucher->save();

            return response()->json([
                'status' => true,
                'message' => 'Cập nhật trạng thái mã giảm giá thành công',
                'data' => [
                    'is_active' => $voucher->is_active
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Lỗi khi cập nhật trạng thái mã giảm giá: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Lỗi khi cập nhật trạng thái mã giảm giá',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    public function getAvailableVouchers()
    {
        try {
            $currentTime = Carbon::now();
            $userId = Auth::id();

            // Debug logging
            Log::info('Current time: ' . $currentTime);
            Log::info('User ID: ' . $userId);

            $publicVouchers = Voucher::where('is_active', true)
                ->where('is_public', true)
                ->where('start_date', '<=', $currentTime)
                ->where('end_date', '>=', $currentTime)
                ->where('used_count', '<', DB::raw('usage_limit'))
                ->get();

            // Debug logging
            Log::info('Public vouchers: ' . $publicVouchers);

            $userVouchers = Voucher::where('is_active', true)
                ->where('user_id', $userId)
                ->where('start_date', '<=', $currentTime)
                ->where('end_date', '>=', $currentTime)
                ->where('used_count', '<', DB::raw('usage_limit'))
                ->get();

            // Debug logging
            Log::info('User vouchers: ' . $userVouchers);

            return response()->json([
                'status' => true,
                'data' => [
                    'public_vouchers' => $publicVouchers,
                    'user_vouchers' => $userVouchers
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Voucher error: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Lỗi khi lấy danh sách voucher',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    public function validateVoucher($code)
    {
        try {
            $currentTime = Carbon::now();
            $userId = Auth::id();

            $voucher = Voucher::where('code', $code)
                ->where('is_active', true)
                ->where('start_date', '<=', $currentTime)
                ->where('end_date', '>=', $currentTime)
                ->where('used_count', '<', 'usage_limit')
                ->where(function ($query) use ($userId) {
                    $query->where('is_public', true)
                        ->orWhere('user_id', $userId);
                })
                ->first();

            if (!$voucher) {
                return response()->json([
                    'status' => false,
                    'message' => 'Invalid or expired voucher code'
                ], 404);
            }

            return response()->json([
                'status' => true,
                'data' => [
                    'voucher_id' => $voucher->voucher_id,
                    'code' => $voucher->code,
                    'name' => $voucher->name,
                    'description' => $voucher->description,
                    'discount_amount' => $voucher->discount_amount,
                    'minimum_order_amount' => $voucher->minimum_order_amount,
                    'maximum_discount_amount' => $voucher->maximum_discount_amount,
                    'remaining_uses' => $voucher->usage_limit - $voucher->used_count,
                    'expires_in' => Carbon::parse($voucher->end_date)->diffForHumans(),
                    'discount_type' => $voucher->discount_type,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Error validating voucher',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
