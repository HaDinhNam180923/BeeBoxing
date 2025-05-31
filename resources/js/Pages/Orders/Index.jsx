import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { formatVND } from '@/Utils/format';
import axios from 'axios';

export default function OrderIndex({ auth }) {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('ALL');

    // Calculate order counts for each status
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
        { id: 'ALL', label: 'All Orders' },
        { id: 'PENDING', label: 'Pending' },
        { id: 'CONFIRMED', label: 'Confirmed' },
        { id: 'DELIVERING', label: 'Delivering' },
        { id: 'COMPLETED', label: 'Completed' },
        { id: 'CANCELLED', label: 'Cancelled' }
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
            console.error('Error fetching orders:', error);
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

    // Get counts for all statuses
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
            <Head title="Order History" />
            
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <h1 className="text-2xl font-bold mb-6">Order History</h1>
                    
                    {/* Status Tabs */}
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
                            No orders found
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
                                                    Order #{order.tracking_number}
                                                </p>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    Ordered on {new Date(order.order_date).toLocaleDateString()}
                                                </p>
                                                <div className="mt-2">
                                                    <span 
                                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.order_status)}`}
                                                    >
                                                        {order.order_status}
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            <div className="text-right">
                                                <p className="font-bold text-lg">
                                                    {formatVND(order.final_amount)}
                                                </p>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    {order.total_items} items
                                                </p>
                                                <p className={`text-sm mt-1 ${
                                                    order.payment_status === 'PAID' 
                                                        ? 'text-green-600' 
                                                        : 'text-yellow-600'
                                                }`}>
                                                    {order.payment_status}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        {order.items && order.items.length > 0 && (
                                            <div className="mt-4 flex space-x-4">
                                                {order.items.slice(0, 4).map((item, index) => (
                                                    <img 
                                                        key={index}
                                                        src={item.image_url} 
                                                        alt={`Product ${index + 1}`}
                                                        className="w-16 h-16 object-cover rounded"
                                                    />
                                                ))}
                                                {order.items.length > 4 && (
                                                    <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
                                                        <span className="text-sm text-gray-500">+{order.items.length - 4}</span>
                                                    </div>
                                                )}
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