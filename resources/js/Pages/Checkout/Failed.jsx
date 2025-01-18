// resources/js/Pages/Checkout/Failed.jsx
import React from 'react';
import MainLayout from '@/components/layouts/MainLayout';
import { Link } from '@inertiajs/react';

export default function Failed() {
    return (
        <MainLayout>
            <div className="max-w-2xl mx-auto py-16 px-4">
                <div className="text-center">
                    <div className="mb-6">
                        <svg className="w-16 h-16 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">
                        Thanh toán thất bại
                    </h1>
                    <p className="text-gray-600 mb-8">
                        Đã có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại sau.
                    </p>
                    <div className="space-x-4">
                        <Link
                            href="/checkout"
                            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
                        >
                            Thử lại
                        </Link>
                        <Link
                            href="/dashboard"
                            className="inline-block bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300"
                        >
                            Quay về trang chủ
                        </Link>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}