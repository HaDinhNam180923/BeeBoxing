<?php

namespace App\Services;

use App\Models\Order;
use Illuminate\Support\Facades\Log;

class VNPayService
{
    /**
     * Tạo URL thanh toán VNPay cho thanh toán thẻ
     * 
     * @param Order $order Đơn hàng cần thanh toán
     * @param string $bankCode Mã ngân hàng (mặc định NCB trong sandbox)
     * @return string URL thanh toán VNPay
     */
    public function createPaymentUrl($order, $bankCode = 'NCB')
    {
        $vnp_TmnCode = config('vnpay.tmn_code');
        $vnp_HashSecret = config('vnpay.hash_secret');
        $vnp_Url = config('vnpay.url');
        $vnp_ReturnUrl = config('vnpay.return_url');

        // Thông tin đơn hàng
        $vnp_TxnRef = $order->tracking_number;
        $vnp_OrderInfo = "Thanh toan don hang #{$order->tracking_number}";
        $vnp_Amount = (int)($order->final_amount * 100); // Convert to VND, nhân 100 vì VNPay yêu cầu

        // Tạo mảng dữ liệu thanh toán
        $inputData = [
            "vnp_Version" => "2.1.0",
            "vnp_TmnCode" => $vnp_TmnCode,
            "vnp_Amount" => $vnp_Amount,
            "vnp_Command" => "pay",
            "vnp_CreateDate" => date('YmdHis'),
            "vnp_CurrCode" => "VND",
            "vnp_IpAddr" => request()->ip(),
            "vnp_Locale" => "vn",
            "vnp_OrderInfo" => $vnp_OrderInfo,
            "vnp_OrderType" => "billpayment",
            "vnp_ReturnUrl" => $vnp_ReturnUrl,
            "vnp_TxnRef" => $vnp_TxnRef,
            "vnp_ExpireDate" => date('YmdHis', strtotime('+15 minutes')),
            "vnp_BankCode" => $bankCode,
        ];

        // Sắp xếp dữ liệu theo thứ tự a-z
        ksort($inputData);

        // Tạo chuỗi hash data
        $hashData = http_build_query($inputData);
        $vnp_SecureHash = hash_hmac('sha512', $hashData, $vnp_HashSecret);

        // Tạo URL thanh toán
        $vnpayUrl = $vnp_Url . "?" . http_build_query($inputData) . '&vnp_SecureHash=' . $vnp_SecureHash;

        Log::info('VNPay Payment URL', ['url' => $vnpayUrl, 'order_id' => $order->order_id, 'tracking_number' => $order->tracking_number, 'input_data' => $inputData]);

        return $vnpayUrl;
    }

    /**
     * Tạo dữ liệu thanh toán VNPay
     * 
     * @param Order $order Đơn hàng cần thanh toán
     * @return array Dữ liệu thanh toán
     */
    public function createPaymentData($order)
    {
        $vnp_TmnCode = config('vnpay.tmn_code');
        $vnp_HashSecret = config('vnpay.hash_secret');
        $vnp_Url = config('vnpay.url');
        $vnp_ReturnUrl = config('vnpay.return_url');

        // Tạo thông tin thanh toán
        $inputData = [
            "vnp_Version" => "2.1.0",
            "vnp_TmnCode" => $vnp_TmnCode,
            "vnp_Amount" => (int)($order->final_amount * 100),
            "vnp_Command" => "pay",
            "vnp_CreateDate" => date('YmdHis'),
            "vnp_CurrCode" => "VND",
            "vnp_IpAddr" => request()->ip(),
            "vnp_Locale" => "vn",
            "vnp_OrderInfo" => "Thanh toan don hang " . $order->tracking_number,
            "vnp_OrderType" => "billpayment",
            "vnp_ReturnUrl" => $vnp_ReturnUrl,
            "vnp_TxnRef" => $order->tracking_number,
            "vnp_ExpireDate" => date('YmdHis', strtotime('+15 minutes')),
            "vnp_BankCode" => "NCB",
        ];

        // Tạo chuỗi hash
        ksort($inputData);
        $hashData = http_build_query($inputData);
        $vnp_SecureHash = hash_hmac('sha512', $hashData, $vnp_HashSecret);

        Log::info('VNPay Payment Data', ['data' => $inputData, 'hash' => $vnp_SecureHash, 'order_id' => $order->order_id, 'tracking_number' => $order->tracking_number]);

        return [
            'data' => $inputData,
            'hash' => $vnp_SecureHash,
            'payment_url' => $vnp_Url,
            'expire_time' => strtotime('+15 minutes') * 1000,
            'amount' => number_format($order->final_amount, 0, ',', '.') . ' VNĐ'
        ];
    }

    /**
     * Xác thực dữ liệu trả về từ VNPay
     * 
     * @param array $vnpayData Dữ liệu VNPay gửi về
     * @return bool
     */
    public function verifyReturnUrl($vnpayData)
    {
        $vnp_SecureHash = $vnpayData['vnp_SecureHash'] ?? '';
        $inputData = array();

        foreach ($vnpayData as $key => $value) {
            if (substr($key, 0, 4) == "vnp_" && $key != 'vnp_SecureHash') {
                $inputData[$key] = $value;
            }
        }

        ksort($inputData);
        $hashData = http_build_query($inputData);
        $vnp_HashSecret = config('vnpay.hash_secret');
        $secureHash = hash_hmac('sha512', $hashData, $vnp_HashSecret);

        Log::info('VNPay Verify Return', [
            'inputData' => $inputData,
            'hashData' => $hashData,
            'secureHash' => $secureHash,
            'receivedHash' => $vnp_SecureHash,
            'isValid' => $vnp_SecureHash === $secureHash
        ]);

        return $vnp_SecureHash === $secureHash;
    }

    /**
     * Kiểm tra trạng thái giao dịch
     * 
     * @param array $vnpayData Dữ liệu VNPay gửi về
     * @return bool
     */
    public function isSuccessful($vnpayData)
    {
        return isset($vnpayData['vnp_ResponseCode'])
            && $vnpayData['vnp_ResponseCode'] == '00';
    }

    /**
     * Lấy mã lỗi và thông báo lỗi từ VNPay
     * 
     * @param array $vnpayData Dữ liệu VNPay gửi về
     * @return array [mã lỗi, thông báo]
     */
    public function getErrorInfo($vnpayData)
    {
        $responseCode = $vnpayData['vnp_ResponseCode'] ?? '';
        $errorMessages = [
            '00' => 'Giao dịch thành công',
            '01' => 'Giao dịch đã tồn tại',
            '02' => 'Merchant không hợp lệ',
            '03' => 'Dữ liệu gửi sang không đúng định dạng',
            '04' => 'Khởi tạo GD không thành công do Website đang bị tạm khóa',
            '05' => 'Giao dịch không thành công do: Quý khách nhập sai mật khẩu quá số lần quy định',
            '06' => 'Giao dịch không thành công do Quý khách nhập sai mật khẩu',
            '07' => 'Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).',
            '09' => 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng',
            '10' => 'Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần',
            '11' => 'Giao dịch không thành công do: Đã hết hạn chờ thanh toán',
            '24' => 'Giao dịch không thành công do: Khách hàng hủy giao dịch',
            '51' => 'Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch',
            '65' => 'Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày',
            '75' => 'Ngân hàng thanh toán đang bảo trì',
            '76' => 'Ngân hàng không hỗ trợ giao dịch này',
            '79' => 'Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định',
            '99' => 'Các lỗi khác',
        ];

        Log::info('VNPay Response', ['code' => $responseCode, 'message' => $errorMessages[$responseCode] ?? 'Lỗi không xác định', 'data' => $vnpayData]);

        return [
            'code' => $responseCode,
            'message' => $errorMessages[$responseCode] ?? 'Lỗi không xác định'
        ];
    }
}
