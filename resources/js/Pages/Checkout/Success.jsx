import React from 'react';
import MainLayout from '@/components/layouts/MainLayout';
import { Link } from '@inertiajs/react';

export default function Success({ order }) {
    return (
        <MainLayout>
            <div className="max-w-2xl mx-auto py-16 px-4">
                <div className="text-center">
                    <div className="mb-6">
                        <svg className="w-16 h-16 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">
                        Thanh toán thành công!
                    </h1>
                    <p className="text-gray-600 mb-8">
                        Cảm ơn bạn đã đặt hàng. Mã đơn hàng của bạn là: {order?.tracking_number || 'N/A'}
                    </p>
                    <Link
                        href="/dashboard"
                        className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
                    >
                        Xem đơn hàng của bạn
                    </Link>
                </div>
            </div>
        </MainLayout>
    );
}