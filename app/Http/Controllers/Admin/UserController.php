<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class UserController extends Controller
{
    /**
     * Tìm kiếm người dùng theo tên hoặc email
     */
    public function search(Request $request)
    {
        try {
            $query = $request->query('query');

            if (empty($query) || strlen($query) < 2) {
                return response()->json([
                    'status' => true,
                    'data' => []
                ]);
            }

            $users = User::where('name', 'like', "%{$query}%")
                ->orWhere('email', 'like', "%{$query}%")
                ->orderBy('name')
                ->limit(10)
                ->get(['id', 'name', 'email']);

            return response()->json([
                'status' => true,
                'data' => $users
            ]);
        } catch (\Exception $e) {
            Log::error('Lỗi khi tìm kiếm người dùng: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Lỗi khi tìm kiếm người dùng',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
