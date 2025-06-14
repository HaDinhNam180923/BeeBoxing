import React, { useEffect } from 'react';
import MainLayout from '@/components/layouts/MainLayout';

export default function VNPayPayment({ paymentData, orderId }) {
    useEffect(() => {
        // Khởi tạo timer để tránh lỗi 'timer is not defined' trên trang VNPay
        window.timer = 15 * 60; // 15 phút

        // Tạo URL thanh toán hoàn chỉnh
        const fullPaymentUrl = `${paymentData.payment_url}?${new URLSearchParams(paymentData.data).toString()}&vnp_SecureHash=${paymentData.hash}`;
        console.log('VNPay Full Payment URL:', fullPaymentUrl);

        // Chuyển hướng đến trang thanh toán VNPay
        const redirectTimeout = setTimeout(() => {
            window.location.href = fullPaymentUrl;
        }, 1000);

        return () => clearTimeout(redirectTimeout);
    }, [paymentData]);

    return (
        <MainLayout>
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center p-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <h2 className="text-xl font-semibold mb-2">Đang chuyển đến cổng thanh toán VNPay</h2>
                    <p className="text-gray-600">Vui lòng không tắt trình duyệt...</p>
                </div>
            </div>
        </MainLayout>
    );
}