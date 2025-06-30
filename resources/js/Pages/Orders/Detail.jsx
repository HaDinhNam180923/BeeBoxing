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
    const [returnModalOpen, setReturnModalOpen] = useState(false);
    const [returnDetails, setReturnDetails] = useState(null);
    const [returnForm, setReturnForm] = useState({
        order_detail_ids: [],
        quantities: [],
        reason: '',
        note: '',
        images: []
    });
    // Thêm state cho Alert
    const [alert, setAlert] = useState({
        isVisible: false,
        message: '',
        variant: 'success'
    });

    // Hàm hiển thị thông báo
    const showAlert = (message, variant = 'success') => {
        setAlert({ isVisible: true, message, variant });
        setTimeout(() => {
            setAlert(prev => ({ ...prev, isVisible: false }));
        }, 3000);
    };

    // Component Alert
    const Alert = ({ isVisible, message, variant = "success", onClose }) => {
        if (!isVisible) return null;

        const variants = {
            success: "bg-green-50 text-green-800 border-green-200",
            error: "bg-red-50 text-red-800 border-red-200",
            info: "bg-blue-50 text-blue-800 border-blue-200",
        };

        return (
            <div className={`fixed top-4 right-4 max-w-sm w-full z-50 transition-all duration-300 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}`}>
                <div className={`border rounded-lg p-4 shadow-lg ${variants[variant]}`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {variant === 'success' && (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                            )}
                            {variant === 'error' && (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            )}
                            <p className="text-sm font-medium">{message}</p>
                        </div>
                        <button 
                            onClick={onClose}
                            className="text-current hover:text-gray-600"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    useEffect(() => {
        axios.defaults.withCredentials = true; // Gửi cookie session
        if (auth.user) {
            fetchOrderDetail();
        } else {
            setError('Vui lòng đăng nhập để xem chi tiết đơn hàng');
            setLoading(false);
        }
    }, [orderId, auth.user]);

    useEffect(() => {
        if (order && auth.user) {
            fetchReturnDetails();
        }
    }, [order, auth.user]);

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

    const fetchReturnDetails = async () => {
        try {
            const response = await axios.get(`/api/orders/${orderId}/return`);
            if (response.data.status) {
                setReturnDetails(response.data.data);
            }
        } catch (error) {
            console.error('Lỗi khi lấy thông tin trả hàng:', error);
        }
    };

    const handleCancelOrder = async () => {
        try {
            const response = await axios.post(`/api/orders/${orderId}/cancel`);
            if (response.data.status) {
                showAlert('Đã hủy đơn hàng thành công!', 'success');
                await fetchOrderDetail();
            } else {
                showAlert(response.data.message, 'error');
            }
        } catch (error) {
            console.error('Lỗi khi hủy đơn hàng:', error);
            showAlert(error.response?.data?.message || 'Không thể hủy đơn hàng', 'error');
        }
    };

    const handleConfirmDelivery = async () => {
        try {
            const response = await axios.post(`/api/orders/${orderId}/confirm-delivery`);
            if (response.data.status) {
                showAlert('Xác nhận giao hàng thành công!', 'success');
                setConfirmationDialogOpen(true);
                await fetchOrderDetail();
            } else {
                showAlert(response.data.message, 'error');
            }
        } catch (error) {
            console.error('Lỗi khi xác nhận giao hàng:', error);
            showAlert(error.response?.data?.message || 'Không thể xác nhận giao hàng', 'error');
        }
    };

    const handleRequestReturn = async () => {
        try {
            const formData = new FormData();
            returnForm.order_detail_ids.forEach((id, index) => {
                formData.append(`order_detail_ids[${index}]`, id);
                formData.append(`quantities[${index}]`, returnForm.quantities[index]);
            });
            formData.append('reason', returnForm.reason);
            formData.append('note', returnForm.note);
            returnForm.images.forEach((image, index) => {
                formData.append(`images[${index}]`, image);
            });

            const response = await axios.post(`/api/orders/${orderId}/return`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.data.status) {
                setReturnModalOpen(false);
                setReturnForm({
                    order_detail_ids: [],
                    quantities: [],
                    reason: '',
                    note: '',
                    images: []
                });
                await fetchReturnDetails();
                await fetchOrderDetail();
                showAlert('Yêu cầu trả hàng đã được gửi thành công!', 'success');
            } else {
                showAlert(response.data.message, 'error');
            }
        } catch (error) {
            console.error('Lỗi khi gửi yêu cầu trả hàng:', error);
            showAlert(error.response?.data?.message || 'Không thể gửi yêu cầu trả hàng', 'error');
        }
    };

    const handleCancelReturn = async () => {
        try {
            const response = await axios.post(`/api/orders/${orderId}/return/cancel`);
            if (response.data.status) {
                showAlert('Hủy yêu cầu trả hàng thành công!', 'success');
                await fetchReturnDetails();
                await fetchOrderDetail();
            } else {
                showAlert(response.data.message, 'error');
            }
        } catch (error) {
            console.error('Lỗi khi hủy yêu cầu trả hàng:', error);
            showAlert(error.response?.data?.message || 'Không thể hủy yêu cầu trả hàng', 'error');
        }
    };

    const handleReturnItemChange = (detailId, checked, quantity) => {
        setReturnForm((prev) => {
            const newDetailIds = checked
                ? [...prev.order_detail_ids, detailId]
                : prev.order_detail_ids.filter((id) => id !== detailId);
            const newQuantities = checked
                ? [...prev.quantities, quantity]
                : prev.quantities.filter((_, index) => prev.order_detail_ids[index] !== detailId);

            return {
                ...prev,
                order_detail_ids: newDetailIds,
                quantities: newQuantities
            };
        });
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

    const getReturnStatusText = (status) => {
        const statusText = {
            PENDING: 'Chờ duyệt',
            APPROVED: 'Đã duyệt',
            REJECTED: 'Bị từ chối',
            COMPLETED: 'Hoàn tất'
        };
        return statusText[status] || 'Không xác định';
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

    const canRequestReturn = order.order.order_status === 'COMPLETED' &&
        order.order.delivery_order?.delivered_at &&
        new Date(order.order.delivery_order.delivered_at) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) &&
        !order.order.return_status;

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
                                {canRequestReturn && (
                                    <button
                                        onClick={() => setReturnModalOpen(true)}
                                        className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition duration-150"
                                    >
                                        Yêu cầu trả hàng
                                    </button>
                                )}
                                {order.order.return_status === 'PENDING' && (
                                    <button
                                        onClick={handleCancelReturn}
                                        className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition duration-150"
                                    >
                                        Hủy yêu cầu trả
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

                        {returnDetails && (
                            <div className="mb-6 p-4 bg-gray-100 rounded">
                                <h2 className="text-xl font-semibold mb-2">Thông tin trả hàng</h2>
                                <p>Trạng thái: {getReturnStatusText(returnDetails.return_status)}</p>
                                <p>Lý do: {returnDetails.return_note}</p>
                                {returnDetails.return_images?.length > 0 && (
                                    <div className="mt-2">
                                        <p>Hình ảnh minh chứng:</p>
                                        <div className="flex space-x-2">
                                            {returnDetails.return_images.map((url, index) => (
                                                <img key={index} src={url} alt="Return proof" className="w-20 h-20 object-cover rounded" />
                                            ))}
                                        </div>
                                    </div>
                                )}
                                <div className="mt-2">
                                    <p>Sản phẩm trả:</p>
                                    <ul className="list-disc pl-5">
                                        {returnDetails.return_items.map((item) => (
                                            <li key={item.order_detail_id}>
                                                {item.product_name} ({item.color_name}, {item.size}) x {item.return_quantity}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}

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
                                                {item.return_quantity > 0 && (
                                                    <p className="text-sm text-orange-600">
                                                        Đã yêu cầu trả: {item.return_quantity}
                                                    </p>
                                                )}
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

                        <Alert
                            isVisible={alert.isVisible}
                            message={alert.message}
                            variant={alert.variant}
                            onClose={() => setAlert(prev => ({ ...prev, isVisible: false }))}
                        />
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

                    <Dialog
                        open={returnModalOpen}
                        onClose={() => setReturnModalOpen(false)}
                        className="relative z-50"
                    >
                        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
                        
                        <div className="fixed inset-0 flex items-center justify-center p-4">
                            <Dialog.Panel className="w-full max-w-md rounded bg-white p-6">
                                <Dialog.Title className="text-lg font-medium mb-4">
                                    Yêu cầu trả hàng
                                </Dialog.Title>
                                
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Chọn sản phẩm muốn trả
                                        </label>
                                        {order.order_details.map((item) => (
                                            <div key={item.order_detail_id} className="flex items-center space-x-2 mt-2">
                                                <input
                                                    type="checkbox"
                                                    onChange={(e) => handleReturnItemChange(
                                                        item.order_detail_id,
                                                        e.target.checked,
                                                        1
                                                    )}
                                                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                                                />
                                                <span>{item.product_name} ({item.color_name}, {item.size})</span>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max={item.quantity}
                                                    value={returnForm.quantities[returnForm.order_detail_ids.indexOf(item.order_detail_id)] || 1}
                                                    onChange={(e) => {
                                                        const index = returnForm.order_detail_ids.indexOf(item.order_detail_id);
                                                        if (index !== -1) {
                                                            setReturnForm((prev) => {
                                                                const newQuantities = [...prev.quantities];
                                                                newQuantities[index] = parseInt(e.target.value) || 1;
                                                                return { ...prev, quantities: newQuantities };
                                                            });
                                                        }
                                                    }}
                                                    className="w-16 border-gray-300 rounded"
                                                    disabled={!returnForm.order_detail_ids.includes(item.order_detail_id)}
                                                />
                                            </div>
                                        ))}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Lý do trả hàng
                                        </label>
                                        <select
                                            value={returnForm.reason}
                                            onChange={(e) => setReturnForm({ ...returnForm, reason: e.target.value })}
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                                        >
                                            <option value="">Chọn lý do</option>
                                            <option value="DEFECTIVE">Sản phẩm lỗi</option>
                                            <option value="WRONG_ITEM">Sai sản phẩm</option>
                                            <option value="CHANGE_MIND">Thay đổi ý định</option>
                                            <option value="OTHER">Khác</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Ghi chú
                                        </label>
                                        <textarea
                                            value={returnForm.note}
                                            onChange={(e) => setReturnForm({ ...returnForm, note: e.target.value })}
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                                            rows="3"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Hình ảnh minh chứng
                                        </label>
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            onChange={(e) => setReturnForm({
                                                ...returnForm,
                                                images: Array.from(e.target.files)
                                            })}
                                            className="mt-1 block w-full"
                                        />
                                    </div>

                                    <div className="flex justify-end space-x-2">
                                        <button
                                            onClick={() => setReturnModalOpen(false)}
                                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                                        >
                                            Hủy
                                        </button>
                                        <button
                                            onClick={handleRequestReturn}
                                            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                                        >
                                            Gửi yêu cầu
                                        </button>
                                    </div>
                                </div>
                            </Dialog.Panel>
                        </div>
                    </Dialog>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}