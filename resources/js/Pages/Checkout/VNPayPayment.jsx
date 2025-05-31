import React, { useState, useEffect, useRef } from 'react';
import MainLayout from '@/components/layouts/MainLayout';
import { Link } from '@inertiajs/react';
import QRCode from 'qrcode';

export default function VNPayPayment({ paymentData, orderId }) {
    const [timeLeft, setTimeLeft] = useState(
        Math.floor((paymentData.expire_time - Date.now()) / 1000)
    );
    const canvasRef = useRef(null);

    useEffect(() => {
        // Tạo QR code
        if (canvasRef.current) {
            const fullPaymentUrl = `${paymentData.payment_url}?${new URLSearchParams(paymentData.data).toString()}&vnp_SecureHash=${paymentData.hash}`;
            QRCode.toCanvas(canvasRef.current, fullPaymentUrl, {
                width: 256,
                errorCorrectionLevel: 'H'
            }, function (error) {
                if (error) console.error(error);
            });
        }

        // Timer
        const timer = setInterval(() => {
            setTimeLeft(prevTime => {
                if (prevTime <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prevTime - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [paymentData]);

    // Tạo URL thanh toán hoàn chỉnh
    const fullPaymentUrl = `${paymentData.payment_url}?${new URLSearchParams(paymentData.data).toString()}&vnp_SecureHash=${paymentData.hash}`;

    return (
        <MainLayout>
            <div className="max-w-2xl mx-auto py-8 px-4">
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h1 className="text-2xl font-bold text-center mb-6">
                        Thanh toán qua VNPAY-QR
                    </h1>

                    <div className="text-center mb-6">
                        <p className="text-lg font-medium mb-2">
                            Số tiền: {paymentData.amount}
                        </p>
                        <p className="text-sm text-gray-600">
                            Thời gian còn lại: {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                        </p>
                    </div>

                    <div className="flex justify-center mb-6">
                        <div className="p-4 border-2 border-blue-500 rounded-lg">
                            <canvas ref={canvasRef} width="256" height="256" />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="text-center text-sm text-gray-600">
                            <p>1. Mở ứng dụng ngân hàng hoặc Ví VNPAY</p>
                            <p>2. Quét mã QR để thanh toán</p>
                            <p>3. Xác nhận thanh toán trên ứng dụng</p>
                        </div>

                        <div className="flex justify-center space-x-4">
                            <Link
                                href={`/checkout/failed?order_id=${orderId}`}
                                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                            >
                                Hủy thanh toán
                            </Link>
                            <a 
                                href={fullPaymentUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Mở trang web VNPAY
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}