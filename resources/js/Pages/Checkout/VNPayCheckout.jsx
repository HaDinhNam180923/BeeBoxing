// resources/js/Pages/Checkout/VNPayCheckout.jsx
import React, { useEffect } from 'react';
import MainLayout from '@/components/layouts/MainLayout';

export default function VNPayCheckout({ paymentUrl }) {
    useEffect(() => {
        // Khởi tạo timer trước khi chuyển hướng
        window.timer = 15 * 60; // 15 phút
        // Chuyển hướng sau 1 giây để đảm bảo timer được khởi tạo
        const redirectTimeout = setTimeout(() => {
            window.location.href = paymentUrl;
        }, 1000);

        return () => clearTimeout(redirectTimeout);
    }, [paymentUrl]);

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