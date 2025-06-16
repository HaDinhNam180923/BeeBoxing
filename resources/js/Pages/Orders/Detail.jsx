import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { formatVND } from '@/Utils/format';
import axios from 'axios';
import ReviewModal from '@/Components/Reviews/ReviewModal';
import { Dialog } from '@headlessui/react';

export default function OrderDetail({ auth, orderId }) {
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);

    useEffect(() => {
        fetchOrderDetail();
    }, [orderId]);

    const fetchOrderDetail = async () => {
        try {
            const response = await axios.get(`/api/orders/${orderId}`, {
                params: { include_delivery_order: true }
            });
            if (response.data.status) {
                setOrder(response.data.data);
            } else {
                setError('Không thể tải chi tiết đơn hàng');
            }
        } catch (error) {
            console.error('Lỗi khi lấy chi tiết đơn hàng:', error);
            setError(error.response?.data?.message || 'Đã xảy ra lỗi khi tải chi tiết đơn hàng');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelOrder = async () => {
        try {
            const response = await axios.post(`/api/orders/${orderId}/cancel`);
            if (response.data.status) {
                await fetchOrderDetail();
            } else {
                alert(response.data.message);
            }
        } catch (error) {
            console.error('Lỗi khi hủy đơn hàng:', error);
            alert(error.response?.data?.message || 'Không thể hủy đơn hàng');
        }
    };

    const handleConfirmDelivery = async () => {
        try {
            const response = await axios.post(`/api/orders/${orderId}/confirm-delivery`);
            if (response.data.status) {
                setConfirmationDialogOpen(true);
                await fetchOrderDetail();
            } else {
                alert(response.data.message);
            }
        } catch (error) {
            console.error('Lỗi khi xác nhận giao hàng:', error);
            alert(error.response?.data?.message || 'Không thể xác nhận giao hàng');
        }
    };

    const getStatusColor = (status) => {
        const statusColors = {
            PENDING: 'text-yellow-600',
            CONFIRMED: 'text-blue-600',
            DELIVERING: 'text-indigo-600',
            COMPLETED: 'text-green-700',
            CANCELLED: 'text-red-600'
        };
        return statusColors[status] || 'text-gray-600';
    };

    if (loading) {
        return (
            <AuthenticatedLayout user={auth.user}>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                </div>
            </AuthenticatedLayout>
        );
    }

    if (error) {
        return (
            <AuthenticatedLayout user={auth.user}>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-red-600">{error}</div>
                </div>
            </AuthenticatedLayout>
        );
    }

    if (!order) {
        return (
            <AuthenticatedLayout user={auth.user}>
                <div className="flex items-center justify-center min-h-screen">
                    <div>Không tìm thấy đơn hàng</div>
                </div>
            </AuthenticatedLayout>
        );
    }

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={`Đơn hàng #${order.order.tracking_number}`} />
            
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <div className="mb-6 flex justify-between items-start">
                            <div>
                                <h1 className="text-2xl font-bold">
                                    Đơn hàng #{order.order.tracking_number}
                                </h1>
                                <div className={`text-lg font-semibold ${getStatusColor(order.order.order_status)}`}>
                                    {order.order.order_status === 'PENDING' ? 'Chờ xác nhận' :
                                     order.order.order_status === 'CONFIRMED' ? 'Đã xác nhận' :
                                     order.order.order_status === 'DELIVERING' ? 'Đang giao' :
                                     order.order.order_status === 'COMPLETED' ? 'Hoàn thành' :
                                     order.order.order_status === 'CANCELLED' ? 'Đã hủy' : order.order.order_status}
                                </div>
                            </div>

                            <div className="space-x-2">
                                {order.order.order_status === 'PENDING' && (
                                    <button
                                        onClick={handleCancelOrder}
                                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition duration-150"
                                    >
                                        Hủy đơn hàng
                                    </button>
                                )}
                                {order.order.delivery_order?.status === 'delivered' && order.order.order_status !== 'COMPLETED' && (
                                    <button
                                        onClick={handleConfirmDelivery}
                                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition duration-150"
                                    >
                                        Xác nhận giao hàng
                                    </button>
                                )}
                                {order.order.order_status === 'COMPLETED' && (
                                    <Link
                                        href={route('reorder', { id: order.order.order_id })}
                                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-150"
                                    >
                                        Đặt lại
                                    </Link>
                                )}
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <h2 className="text-xl font-semibold mb-4">Chi tiết đơn hàng</h2>
                                <div className="space-y-2">
                                    <p>Ngày đặt hàng: {new Date(order.order.order_date).toLocaleString('vi-VN')}</p>
                                    <p>Phương thức thanh toán: {order.order.payment_method === 'COD' ? 'Thanh toán khi nhận hàng' : 'VNPay'}</p>
                                    <p>Trạng thái thanh toán: {order.order.payment_status === 'PAID' ? 'Đã thanh toán' : 'Chưa thanh toán'}</p>
                                </div>
                            </div>

                            <div>
                                <h2 className="text-xl font-semibold mb-4">Địa chỉ giao hàng</h2>
                                <div className="space-y-2">
                                    <p>{order.order.address.receiver_name}</p>
                                    <p>{order.order.address.phone}</p>
                                    <p>
                                        {order.order.address.street_address}, {' '}
                                        {order.order.address.ward}, {' '}
                                        {order.order.address.district}, {' '}
                                        {order.order.address.province}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8">
                            <h2 className="text-xl font-semibold mb-4">Sản phẩm trong đơn hàng</h2>
                            <div className="divide-y divide-gray-200 pl-4">
                                {order.order_details.map(item => (
                                    <Link
                                        href={route('products.detail', { id: item.product_id })}
                                        key={item.order_detail_id}
                                        className="block py-4 hover:bg-gray-100 rounded transition"
                                    >
                                        <div className="flex items-center space-x-4">
                                            <img 
                                                src={item.image_url} 
                                                alt={item.product_name} 
                                                className="w-16 h-16 object-cover rounded"
                                            />
                                            <div className="flex-grow">
                                                <p className="font-semibold">{item.product_name}</p>
                                                <p className="text-sm text-gray-500">
                                                    {item.color_name} | Kích cỡ: {item.size}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    Số lượng: {item.quantity} x {formatVND(item.unit_price)}
                                                </p>
                                                {order.order.order_status === 'COMPLETED' && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            if (item.product_id) {
                                                                setSelectedProduct({
                                                                    id: String(item.product_id),
                                                                    name: item.product_name || 'Sản phẩm không xác định'
                                                                });
                                                                setReviewModalOpen(true);
                                                            } else {
                                                                console.error('Product ID không xác định:', item);
                                                            }
                                                        }}
                                                        className="mt-2 text-sm text-indigo-600 hover:text-indigo-800"
                                                    >
                                                        Viết đánh giá
                                                    </button>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold">{formatVND(item.subtotal)}</p>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        <div className="mt-8 border-t pt-4">
                            <div className="flex justify-between">
                                <p>Tạm tính</p>
                                <p>{formatVND(order.order.subtotal_amount)}</p>
                            </div>
                            <div className="flex justify-between">
                                <p>Phí vận chuyển</p>
                                <p>{formatVND(order.order.shipping_fee)}</p>
                            </div>
                            {order.order.discount_amount > 0 && (
                                <div className="flex justify-between text-green-600">
                                    <p>Giảm giá</p>
                                    <p>-{formatVND(order.order.discount_amount)}</p>
                                </div>
                            )}
                            <div className="flex justify-between font-bold text-xl mt-4">
                                <p>Tổng cộng</p>
                                <p>{formatVND(order.order.final_amount)}</p>
                            </div>
                        </div>
                    </div>

                    {selectedProduct && (
                        <ReviewModal
                            isOpen={reviewModalOpen}
                            onClose={() => {
                                setReviewModalOpen(false);
                                setSelectedProduct(null);
                            }}
                            orderId={orderId.toString()}
                            productId={selectedProduct.id}
                            productName={selectedProduct.name}
                        />
                    )}

                    <Dialog
                        open={confirmationDialogOpen}
                        onClose={() => setConfirmationDialogOpen(false)}
                        className="relative z-50"
                    >
                        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
                        
                        <div className="fixed inset-0 flex items-center justify-center p-4">
                            <Dialog.Panel className="w-full max-w-sm rounded bg-white p-6">
                                <Dialog.Title className="text-lg font-medium mb-4">
                                    Bạn có muốn đánh giá sản phẩm?
                                </Dialog.Title>
                                
                                <div className="flex justify-end space-x-2">
                                    <button
                                        onClick={() => setConfirmationDialogOpen(false)}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                                    >
                                        Để sau
                                    </button>
                                    <button
                                        onClick={() => {
                                            setConfirmationDialogOpen(false);
                                            setSelectedProduct({
                                                id: order.order_details[0].product_id.toString(),
                                                name: order.order_details[0].product_name
                                            });
                                            setReviewModalOpen(true);
                                        }}
                                        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                                    >
                                        Viết đánh giá
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </div>
                    </Dialog>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}