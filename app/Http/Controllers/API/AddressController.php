<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Address;
use App\Models\VnAddress;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class AddressController extends Controller
{
    public function getProvinces()
    {
        try {
            $provinces = VnAddress::select('province')
                ->distinct()
                ->get();

            return response()->json([
                'status' => true,
                'data' => $provinces
            ]);
        } catch (\Exception $e) {
            Log::error('Error getting provinces: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Error getting provinces',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getDistricts($province)
    {
        try {
            $districts = VnAddress::select('district')
                ->where('province', $province)
                ->distinct()
                ->get();

            return response()->json([
                'status' => true,
                'data' => $districts
            ]);
        } catch (\Exception $e) {
            Log::error('Error getting districts: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Error getting districts',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getWards($province, $district)
    {
        try {
            $wards = VnAddress::select('ward')
                ->where('province', $province)
                ->where('district', $district)
                ->get();

            return response()->json([
                'status' => true,
                'data' => $wards
            ]);
        } catch (\Exception $e) {
            Log::error('Error getting wards: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Error getting wards',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getUserAddresses()
    {
        try {
            $userId = Auth::id();
            $addresses = Address::where('user_id', $userId)->get();

            return response()->json([
                'status' => true,
                'data' => $addresses
            ]);
        } catch (\Exception $e) {
            Log::error('Error getting user addresses: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Error getting user addresses',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'receiver_name' => 'required|string',
                'phone' => 'required|string',
                'province' => 'required|string',
                'district' => 'required|string',
                'ward' => 'required|string',
                'street_address' => 'required|string',
                'is_default' => 'boolean'
            ]);

            $userId = Auth::id();

            if ($validated['is_default']) {
                Address::where('user_id', $userId)
                    ->update(['is_default' => false]);
            }

            $address = Address::create([
                'user_id' => $userId,
                ...$validated
            ]);

            return response()->json([
                'status' => true,
                'message' => 'Đã thêm địa chỉ mới',
                'data' => $address
            ]);
        } catch (\Exception $e) {
            Log::error('Error creating address: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Error creating address',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function setDefault($addressId)
    {
        try {
            $userId = Auth::id();

            Address::where('user_id', $userId)
                ->update(['is_default' => false]);

            Address::where('address_id', $addressId)
                ->where('user_id', $userId)
                ->update(['is_default' => true]);

            return response()->json([
                'status' => true,
                'message' => 'Đã cập nhật địa chỉ mặc định'
            ]);
        } catch (\Exception $e) {
            Log::error('Error setting default address: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Error setting default address',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy($addressId)
    {
        try {
            $userId = Auth::id();

            Address::where('address_id', $addressId)
                ->where('user_id', $userId)
                ->delete();

            return response()->json([
                'status' => true,
                'message' => 'Đã xóa địa chỉ'
            ]);
        } catch (\Exception $e) {
            Log::error('Error deleting address: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Error deleting address',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
