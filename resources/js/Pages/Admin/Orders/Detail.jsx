import React, { useEffect, useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import AdminSidebar from '@/Layouts/AdminSidebar';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import OrderDetailInfo from './Components/OrderDetailInfo';
import OrderStatusUpdate from './Components/OrderStatusUpdate';
import OrderItems from './Components/OrderItems';
import OrderCustomerInfo from './Components/OrderCustomerInfo';
import OrderReturnInfo from './Components/OrderReturnInfo';
import OrderReturnActions from './Components/OrderReturnActions';

const Detail = ({ orderId }) => {
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [debug, setDebug] = useState(false);

    useEffect(() => {
        const fetchOrderDetail = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await axios.get(`/api/admin/orders/${orderId}`, {
                    withCredentials: true
                });
                if (response.data.status) {
                    setOrder(response.data.data);
                    console.log('Order data:', response.data.data);
                    if (response.data.data.order_details && response.data.data.order_details.length > 0) {
                        console.log('First product item:', response.data.data.order_details[0]);
                        const item = response.data.data.order_details[0];
                        const productImage = item?.inventory?.color?.product?.colors?.[0]?.images?.[0]?.image_url;
                        const colorImage = item?.inventory?.color?.images?.[0]?.image_url;
                        console.log('Product image path:', productImage);
                        console.log('Color image path:', colorImage);
                    }
                } else {
                    setError('Không thể tải thông tin đơn hàng');
                }
            } catch (err) {
                console.error('Lỗi chi tiết:', err);
                setError(err.response?.data?.message || 'Đã xảy ra lỗi khi tải thông tin đơn hàng');
            } finally {
                setLoading(false);
            }
        };

        fetchOrderDetail();
    }, [orderId]);

    const handleStatusChange = async (newStatus) => {
        try {
            const response = await axios.put(`/api/admin/orders/${orderId}/status`, {
                order_status: newStatus
            }, { withCredentials: true });
            if (response.data.status) {
                setOrder(response.data.data);
            }
        } catch (error) {
            console.error('Lỗi cập nhật trạng thái:', error);
            alert(error.response?.data?.message || 'Lỗi khi cập nhật trạng thái');
        }
    };

    const handleReturnUpdate = (updatedOrder) => {
        setOrder(updatedOrder);
    };

    const toggleDebug = () => {
        setDebug(!debug);
    };

    if (loading) {
        return (
            <AdminLayout>
                <AdminSidebar>
                    <div className="flex justify-center items-center h-screen">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                </AdminSidebar>
            </AdminLayout>
        );
    }

    if (error) {
        return (
            <AdminLayout>
                <AdminSidebar>
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                        <strong className="font-bold">Lỗi! </strong>
                        <span className="block sm:inline">{error}</span>
                    </div>
                </AdminSidebar>
            </AdminLayout>
        );
    }

    return (
        <>
            <Head title={`Chi tiết đơn hàng #${orderId}`} />
            <AdminLayout
                header={
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Chi tiết đơn hàng #{orderId}
                    </h2>
                }
            >
                <AdminSidebar>
                    {process.env.NODE_ENV !== 'production' && (
                        <button 
                            onClick={toggleDebug}
                            className="mb-4 px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm rounded"
                        >
                            {debug ? 'Tắt Debug' : 'Bật Debug'}
                        </button>
                    )}
                    {debug && order && (
                        <div className="mb-4 p-4 bg-gray-100 border border-gray-300 rounded overflow-auto max-h-96">
                            <h3 className="font-medium text-gray-700 mb-2">Debug Info:</h3>
                            <pre className="text-xs">{JSON.stringify(order, null, 2)}</pre>
                        </div>
                    )}
                    {order ? (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 space-y-6">
                                <OrderDetailInfo order={order} />
                                {order.order_details && (
                                    <OrderItems items={order.order_details} />
                                )}
                                <OrderReturnInfo order={order} />
                            </div>
                            <div className="space-y-6">
                                <OrderStatusUpdate 
                                    currentStatus={order.order_status}
                                    onStatusChange={handleStatusChange}
                                />
                                <OrderReturnActions
                                    order={order}
                                    onUpdate={handleReturnUpdate}
                                />
                                <OrderCustomerInfo
                                    user={order.user}
                                    address={order.address}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
                            <strong className="font-bold">Thông báo! </strong>
                            <span className="block sm:inline">Không có thông tin đơn hàng hoặc đang tải...</span>
                        </div>
                    )}
                </AdminSidebar>
            </AdminLayout>
        </>
    );
};

export default Detail;