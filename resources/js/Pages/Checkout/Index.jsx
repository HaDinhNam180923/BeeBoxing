import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layouts/MainLayout';
import axios from 'axios';
import { useForm } from '@inertiajs/react';
import Modal from '@/Components/Modal';

export default function Checkout({ selectedItems }) {
    const [addresses, setAddresses] = useState([]);
    const [vouchers, setVouchers] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [selectedVoucher, setSelectedVoucher] = useState(null);
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [showVoucherModal, setShowVoucherModal] = useState(false);
    const [orderItems, setOrderItems] = useState([]);
    const [orderSummary, setOrderSummary] = useState({
        subtotal: 0,
        shipping: 30000, // Giá shipping cơ bản
        discount: 0,
        total: 0
    });

    useEffect(() => {
        fetchAddresses();
        fetchVouchers();
        fetchSelectedItems();
    }, []);

    const fetchSelectedItems = async () => {
        try {
            const response = await axios.get('/api/cart/selected-items', {
                params: { selected_items: selectedItems }
            });
            if (response.data.status) {
                setOrderItems(response.data.data.items);
                updateOrderSummary(response.data.data.items, null);
            }
        } catch (error) {
            console.error('Error fetching selected items:', error);
        }
    };

    const fetchAddresses = async () => {
        try {
            const response = await axios.get('/addresses');
            if (response.data.status) {
                setAddresses(response.data.data);
                const defaultAddress = response.data.data.find(addr => addr.is_default);
                setSelectedAddress(defaultAddress);
            }
        } catch (error) {
            console.error('Error fetching addresses:', error);
        }
    };

    const fetchVouchers = async () => {
        try {
            const response = await axios.get('/api/vouchers/available');
            if (response.data.status) {
                setVouchers([...response.data.data.public_vouchers, ...response.data.data.user_vouchers]);
            }
        } catch (error) {
            console.error('Error fetching vouchers:', error);
        }
    };

    const updateOrderSummary = (items, voucher) => {
        const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
        let discount = 0;
        
        if (voucher) {
            if (voucher.discount_type === 'percentage') {
                discount = Math.min(
                    (subtotal * voucher.discount_amount / 100),
                    voucher.maximum_discount_amount
                );
            } else {
                discount = Math.min(voucher.discount_amount, voucher.maximum_discount_amount);
            }
        }

        setOrderSummary({
            subtotal,
            shipping: 30000,
            discount,
            total: subtotal + 30000 - discount
        });
    };

    const handlePlaceOrder = async () => {
        if (!selectedAddress) {
            alert('Vui lòng chọn địa chỉ giao hàng');
            return;
        }
    
        try {
            const response = await axios.post('/api/orders', {
                address_id: selectedAddress.address_id,
                voucher_code: selectedVoucher?.code,
                payment_method: 'COD',
                selected_items: Array.from(selectedItems) // Chuyển đổi Set thành Array
            });
    
            if (response.data.status) {
                window.location.href = '/dashboard';
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Có lỗi xảy ra khi đặt hàng');
        }
    };

    return (
        <MainLayout title="Thanh toán">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Cột thông tin đơn hàng */}
                <div className="md:col-span-2 space-y-6">
                    {/* Địa chỉ giao hàng */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-medium">Địa chỉ giao hàng</h2>
                            <button
                                onClick={() => setShowAddressModal(true)}
                                className="text-blue-600 hover:text-blue-800"
                            >
                                Thay đổi
                            </button>
                        </div>
                        {selectedAddress && (
                            <div className="text-gray-600">
                                <p className="font-medium">{selectedAddress.receiver_name}</p>
                                <p>{selectedAddress.phone}</p>
                                <p>{selectedAddress.street_address}, {selectedAddress.ward},</p>
                                <p>{selectedAddress.district}, {selectedAddress.province}</p>
                            </div>
                        )}
                    </div>

                    {/* Danh sách sản phẩm */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-lg font-medium mb-4">Sản phẩm</h2>
                        <div className="space-y-4">
                            {orderItems.map(item => (
                                <div key={item.cart_item_id} className="flex space-x-4">
                                    <img
                                        src={item.image_url}
                                        alt={item.product_name}
                                        className="w-20 h-20 object-cover rounded"
                                    />
                                    <div className="flex-1">
                                        <h3 className="font-medium">{item.product_name}</h3>
                                        <p className="text-gray-500">
                                            {item.color_name} - {item.size}
                                        </p>
                                        <p className="text-gray-500">
                                            {item.quantity} × {item.unit_price.toLocaleString('vi-VN')}đ
                                        </p>
                                        <p className="font-medium text-blue-600">
                                            {item.subtotal.toLocaleString('vi-VN')}đ
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Cột tổng kết đơn hàng */}
                <div className="md:col-span-1">
                    <div className="bg-white p-6 rounded-lg shadow sticky top-8">
                        <h2 className="text-lg font-medium mb-4">Tổng cộng</h2>
                        
                        {/* Voucher */}
                        <div className="border-b pb-4 mb-4">
                            <div className="flex justify-between items-center">
                                <span>Mã giảm giá</span>
                                <button
                                    onClick={() => setShowVoucherModal(true)}
                                    className="text-blue-600 hover:text-blue-800"
                                >
                                    {selectedVoucher ? 'Thay đổi' : 'Chọn mã'}
                                </button>
                            </div>
                            {selectedVoucher && (
                                <div className="mt-2 text-green-600">
                                    Đang áp dụng: {selectedVoucher.name}
                                </div>
                            )}
                        </div>

                        {/* Chi tiết giá */}
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span>Tạm tính</span>
                                <span>{orderSummary.subtotal.toLocaleString('vi-VN')}đ</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Phí vận chuyển</span>
                                <span>{orderSummary.shipping.toLocaleString('vi-VN')}đ</span>
                            </div>
                            {orderSummary.discount > 0 && (
                                <div className="flex justify-between text-green-600">
                                    <span>Giảm giá</span>
                                    <span>-{orderSummary.discount.toLocaleString('vi-VN')}đ</span>
                                </div>
                            )}
                            <div className="flex justify-between font-medium text-lg pt-4 border-t">
                                <span>Tổng cộng</span>
                                <span>{orderSummary.total.toLocaleString('vi-VN')}đ</span>
                            </div>
                        </div>

                        <button
                            onClick={handlePlaceOrder}
                            className="w-full mt-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Đặt hàng
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal chọn địa chỉ */}
            <Modal show={showAddressModal} onClose={() => setShowAddressModal(false)}>
                <div className="p-6">
                    <h2 className="text-lg font-medium mb-4">Chọn địa chỉ giao hàng</h2>
                    <div className="space-y-4">
                        {addresses.map(address => (
                            <label
                                key={address.address_id}
                                className="flex items-start space-x-3 p-4 border rounded-lg cursor-pointer"
                            >
                                <input
                                    type="radio"
                                    name="delivery_address"
                                    checked={selectedAddress?.address_id === address.address_id}
                                    onChange={() => setSelectedAddress(address)}
                                    className="mt-1"
                                />
                                <div>
                                    <p className="font-medium">{address.receiver_name}</p>
                                    <p className="text-gray-600">{address.phone}</p>
                                    <p className="text-gray-600">
                                        {address.street_address}, {address.ward},
                                        {address.district}, {address.province}
                                    </p>
                                </div>
                            </label>
                        ))}
                    </div>
                    <div className="mt-6 flex justify-end">
                        <button
                            onClick={() => setShowAddressModal(false)}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            Xác nhận
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Modal chọn voucher */}
            <Modal show={showVoucherModal} onClose={() => setShowVoucherModal(false)}>
                <div className="p-6 max-h-[80vh] flex flex-col">
                    <h2 className="text-lg font-medium mb-4">Chọn mã giảm giá</h2>
                    
                    {/* Scrollable voucher list */}
                    <div className="flex-1 overflow-y-auto min-h-0">
                        <div className="space-y-3">
                            {vouchers.map(voucher => (
                                <label
                                    key={voucher.voucher_id}
                                    className="flex items-start space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                                >
                                    <input
                                        type="radio"
                                        name="voucher"
                                        checked={selectedVoucher?.voucher_id === voucher.voucher_id}
                                        onChange={() => {
                                            setSelectedVoucher(voucher);
                                            updateOrderSummary(orderItems, voucher);
                                        }}
                                        className="mt-1"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <p className="font-medium truncate pr-2">{voucher.name}</p>
                                            <p className="text-green-600 whitespace-nowrap">
                                                {voucher.discount_type === 'percentage' 
                                                    ? `Giảm ${voucher.discount_amount}%` 
                                                    : `Giảm ${voucher.discount_amount.toLocaleString('vi-VN')}đ`}
                                            </p>
                                        </div>
                                        <p className="text-sm text-gray-500 line-clamp-2">{voucher.description}</p>
                                        <div className="mt-1 text-xs text-gray-500 flex flex-wrap gap-x-4">
                                            <p>Đơn tối thiểu: {voucher.minimum_order_amount.toLocaleString('vi-VN')}đ</p>
                                            <p>Giảm tối đa: {voucher.maximum_discount_amount.toLocaleString('vi-VN')}đ</p>
                                            <p>HSD: {voucher.expires_in}</p>
                                        </div>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Fixed button section at bottom */}
                    <div className="mt-4 pt-3 border-t flex justify-between">
                        <button
                            onClick={() => {
                                setSelectedVoucher(null);
                                updateOrderSummary(orderItems, null);
                                setShowVoucherModal(false);
                            }}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800"
                        >
                            Bỏ chọn mã
                        </button>
                        <button
                            onClick={() => setShowVoucherModal(false)}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            Xác nhận
                        </button>
                    </div>
                </div>
            </Modal>
        </MainLayout>
    );
}