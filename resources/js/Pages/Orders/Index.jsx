import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { formatVND } from '@/Utils/format';
import axios from 'axios';

export default function OrderIndex({ auth }) {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('ALL');

    const getStatusCounts = () => {
        const counts = {
            ALL: orders.length,
            PENDING: 0,
            CONFIRMED: 0,
            DELIVERING: 0,
            COMPLETED: 0,
            CANCELLED: 0
        };

        orders.forEach(order => {
            if (counts.hasOwnProperty(order.order_status)) {
                counts[order.order_status]++;
            }
        });

        return counts;
    };

    const tabs = [
        { id: 'ALL', label: 'Tất cả đơn hàng' },
        { id: 'PENDING', label: 'Chờ xác nhận' },
        { id: 'CONFIRMED', label: 'Đã xác nhận' },
        { id: 'DELIVERING', label: 'Đang giao' },
        { id: 'COMPLETED', label: 'Hoàn thành' },
        { id: 'CANCELLED', label: 'Đã hủy' }
    ];

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await axios.get('/api/orders');
            setOrders(response.data.data);
            setLoading(false);
        } catch (error) {
            console.error('Lỗi khi lấy danh sách đơn hàng:', error);
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'PENDING': return 'bg-yellow-100 text-yellow-800';
            case 'CONFIRMED': return 'bg-blue-100 text-blue-800';
            case 'DELIVERING': return 'bg-indigo-100 text-indigo-800';
            case 'COMPLETED': return 'bg-green-100 text-green-800';
            case 'CANCELLED': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const filteredOrders = activeTab === 'ALL' 
        ? orders 
        : orders.filter(order => order.order_status === activeTab);

    const statusCounts = getStatusCounts();

    if (loading) {
        return (
            <AuthenticatedLayout user={auth.user}>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                </div>
            </AuthenticatedLayout>
        );
    }

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Lịch sử đơn hàng" />
            
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <h1 className="text-2xl font-bold mb-6">Lịch sử đơn hàng</h1>
                    
                    <div className="mb-6 border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`
                                        whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                                        ${activeTab === tab.id
                                            ? 'border-indigo-500 text-indigo-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }
                                    `}
                                >
                                    {tab.label}
                                    <span className="ml-2 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                                        {statusCounts[tab.id]}
                                    </span>
                                </button>
                            ))}
                        </nav>
                    </div>

                    {filteredOrders.length === 0 ? (
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6 text-center">
                            Không tìm thấy đơn hàng
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredOrders.map(order => (
                                <Link 
                                    href={route('orders.detail', { id: order.order_id })}
                                    key={order.order_id} 
                                    className="block"
                                >
                                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6 hover:bg-gray-50 transition">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-semibold text-lg">
                                                    Đơn hàng #{order.tracking_number}
                                                </p>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    Đặt ngày {new Date(order.order_date).toLocaleDateString('vi-VN')}
                                                </p>
                                                <div className="mt-2">
                                                    <span 
                                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.order_status)}`}
                                                    >
                                                        {order.order_status === 'PENDING' ? 'Chờ xác nhận' :
                                                         order.order_status === 'CONFIRMED' ? 'Đã xác nhận' :
                                                         order.order_status === 'DELIVERING' ? 'Đang giao' :
                                                         order.order_status === 'COMPLETED' ? 'Hoàn thành' :
                                                         order.order_status === 'CANCELLED' ? 'Đã hủy' : order.order_status}
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            <div className="text-right">
                                                <p className="font-bold text-lg">
                                                    {formatVND(order.final_amount)}
                                                </p>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    {order.total_items} sản phẩm
                                                </p>
                                                <p className={`text-sm mt-1 ${
                                                    order.payment_status === 'PAID' 
                                                        ? 'text-green-600' 
                                                        : 'text-yellow-600'
                                                }`}>
                                                    {order.payment_status === 'PAID' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        {order.items && order.items.length > 0 && (
                                            <div className="mt-4 pl-4">
                                                <div className="flex flex-col space-y-2">
                                                    {order.items.slice(0, 4).map((item, index) => (
                                                        <div key={index} className="flex items-center space-x-4">
                                                            <img 
                                                                src={item.image_url} 
                                                                alt={item.product_name}
                                                                className="w-16 h-16 object-cover rounded"
                                                            />
                                                            <div>
                                                                <p className="text-sm text-gray-600 font-semibold">
                                                                    {item.product_name}
                                                                </p>
                                                                <p className="text-sm text-gray-500">
                                                                    {item.color_name}, {item.size} x {item.quantity}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {order.items.length > 4 && (
                                                        <div className="text-sm text-gray-600">
                                                            và {order.items.length - 4} sản phẩm khác
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}