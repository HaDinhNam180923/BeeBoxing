<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Voucher;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class VoucherController extends Controller
{
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
