import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layouts/MainLayout';
import axios from 'axios';
import { useForm } from '@inertiajs/react';
import Modal from '@/Components/Modal';

export default function Checkout({ selectedItems }) {
    const [addresses, setAddresses] = useState([]);
    const [vouchers, setVouchers] = useState([]);
    const [paymentMethod, setPaymentMethod] = useState('COD');
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [orderNote, setOrderNote] = useState('');
    const [priceVoucher, setPriceVoucher] = useState(null);
    const [shippingVoucher, setShippingVoucher] = useState(null);
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [showVoucherModal, setShowVoucherModal] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [orderItems, setOrderItems] = useState([]);
    const [usedVouchersToday, setUsedVouchersToday] = useState([]);
    const [orderSummary, setOrderSummary] = useState({
        subtotal: 0,
        shipping: 30000,
        priceDiscount: 0,
        shippingDiscount: 0,
        total: 0
    });

    useEffect(() => {
        // Gửi tất cả request với cookie
        axios.defaults.withCredentials = true;
        fetchAddresses();
        fetchVouchers();
        fetchSelectedItems();
        fetchUsedVouchersToday();
    }, []);

    const fetchUsedVouchersToday = async () => {
        try {
            console.log('Fetching used vouchers...');
            const response = await axios.get('/api/vouchers/used-today');
            if (response.data.status) {
                setUsedVouchersToday(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching used vouchers today:', error);
            console.log('Error response:', error.response?.data);
        }
    };

    const fetchSelectedItems = async () => {
        try {
            const response = await axios.get('/api/cart/selected-items', {
                params: { selected_items: selectedItems }
            });
            if (response.data.status) {
                setOrderItems(response.data.data.items);
                updateOrderSummary(response.data.data.items, null, null);
            }
        } catch (error) {
            console.error('Error fetching selected items:', error);
        }
    };

    const isVoucherEligible = (voucher) => {
        return voucher.voucher_type === 'shipping' || orderSummary.subtotal >= voucher.minimum_order_amount;
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

    const updateOrderSummary = (items, priceVoucher, shippingVoucher) => {
        const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
        let priceDiscount = 0;
        let shippingDiscount = 0;
        let shipping = 30000;

        if (priceVoucher && priceVoucher.voucher_type === 'price') {
            if (priceVoucher.discount_type === 'percentage') {
                priceDiscount = Math.min(
                    (subtotal * priceVoucher.discount_amount / 100),
                    priceVoucher.maximum_discount_amount
                );
            } else {
                priceDiscount = Math.min(priceVoucher.discount_amount, priceVoucher.maximum_discount_amount);
            }
        }

        if (shippingVoucher && shippingVoucher.voucher_type === 'shipping') {
            if (shippingVoucher.discount_type === 'percentage') {
                shippingDiscount = Math.min(
                    (shipping * shippingVoucher.discount_amount / 100),
                    shippingVoucher.maximum_discount_amount
                );
            } else {
                shippingDiscount = Math.min(shippingVoucher.discount_amount, shippingVoucher.maximum_discount_amount);
            }
        }

        setOrderSummary({
            subtotal,
            shipping,
            priceDiscount,
            shippingDiscount,
            total: subtotal + shipping - priceDiscount - shippingDiscount
        });
    };

    const handlePlaceOrder = async () => {
        if (!selectedAddress) {
            alert('Vui lòng chọn địa chỉ giao hàng');
            return;
        }

        try {
            setIsProcessing(true);
            const payload = {
                address_id: selectedAddress.address_id,
                payment_method: paymentMethod,
                selected_items: Array.from(selectedItems),
                note: orderNote || '',
                price_voucher_id: priceVoucher ? priceVoucher.voucher_id : null,
                shipping_voucher_id: shippingVoucher ? shippingVoucher.voucher_id : null
            };
            console.log('Sending payload:', payload); // Debug payload
            const response = await axios.post('/api/orders', payload);
            if (response.data.status) {
                if (paymentMethod === 'VNPAY') {
                    window.location.href = response.data.data.redirect_url;
                } else {
                    window.location.href = '/dashboard';
                }
            }
        } catch (error) {
            console.error('Lỗi đặt hàng:', error);
            alert(error.response?.data?.message || 'Có lỗi xảy ra khi đặt hàng');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <MainLayout title="Thanh toán">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto px-4 py-8">
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
                                    {priceVoucher || shippingVoucher ? 'Thay đổi' : 'Chọn mã'}
                                </button>
                            </div>
                            {priceVoucher && (
                                <div className="mt-2 text-green-600 truncate">
                                    Giá sản phẩm: {priceVoucher.name}
                                </div>
                            )}
                            {shippingVoucher && (
                                <div className="mt-2 text-green-600 truncate">
                                    Phí vận chuyển: {shippingVoucher.name}
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
                            {orderSummary.priceDiscount > 0 && (
                                <div className="flex justify-between text-green-600">
                                    <span>Giảm giá sản phẩm</span>
                                    <span>-{orderSummary.priceDiscount.toLocaleString('vi-VN')}đ</span>
                                </div>
                            )}
                            {orderSummary.shippingDiscount > 0 && (
                                <div className="flex justify-between text-green-600">
                                    <span>Giảm phí vận chuyển</span>
                                    <span>-{orderSummary.shippingDiscount.toLocaleString('vi-VN')}đ</span>
                                </div>
                            )}
                            <div className="flex justify-between font-medium text-lg pt-4 border-t">
                                <span>Tổng cộng</span>
                                <span>{orderSummary.total.toLocaleString('vi-VN')}đ</span>
                            </div>
                        </div>

                        <button
                            onClick={handlePlaceOrder}
                            disabled={isProcessing}
                            className="w-full mt-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                        >
                            {isProcessing ? 'Đang xử lý...' : paymentMethod === 'COD' ? 'Đặt hàng' : 'Thanh toán với VNPAY'}
                        </button>

                        {/* Ghi chú đơn hàng */}
                        <div className="border-t pt-4 mt-4">
                            <h3 className="font-medium mb-3">Ghi chú đơn hàng</h3>
                            <textarea
                                value={orderNote}
                                onChange={(e) => setOrderNote(e.target.value)}
                                placeholder="Nhập ghi chú cho đơn hàng (không bắt buộc)"
                                className="w-full p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows="3"
                            />
                        </div>

                        {/* Phương thức thanh toán */}
                        <div className="border-t pt-4 mt-4">
                            <h3 className="font-medium mb-3">Phương thức thanh toán</h3>
                            <div className="space-y-3">
                                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                                    <input
                                        type="radio"
                                        name="payment_method"
                                        value="COD"
                                        checked={paymentMethod === 'COD'}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                        className="mr-3"
                                    />
                                    <div>
                                        <p className="font-medium">Thanh toán khi nhận hàng (COD)</p>
                                        <p className="text-sm text-gray-500">
                                            Thanh toán bằng tiền mặt khi nhận được hàng
                                        </p>
                                    </div>
                                </label>

                                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                                    <input
                                        type="radio"
                                        name="payment_method"
                                        value="VNPAY"
                                        checked={paymentMethod === 'VNPAY'}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                        className="mr-3"
                                    />
                                    <div className="flex items-center justify-between flex-1">
                                        <div>
                                            <p className="font-medium">Thanh toán qua VNPAY-QR</p>
                                            <p className="text-sm text-gray-500">
                                                Quét mã QR để thanh toán qua ứng dụng ngân hàng
                                            </p>
                                        </div>
                                        <img 
                                            src="/storage/images/vnpay-logo.png" 
                                            alt="VNPAY" 
                                            className="h-8 w-auto object-contain ml-3"
                                        />
                                    </div>
                                </label>
                            </div>
                        </div>
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
                    <div className="flex-1 overflow-y-auto min-h-0">
                        {/* Phần mã giảm giá sản phẩm */}
                        <div className="mb-6">
                            <h3 className="text-md font-medium mb-3">Mã giảm giá sản phẩm</h3>
                            <div className="space-y-3">
                                {vouchers.filter(v => v.voucher_type === 'price' && !usedVouchersToday.includes(v.voucher_id)).length > 0 ? (
                                    vouchers.filter(v => v.voucher_type === 'price' && !usedVouchersToday.includes(v.voucher_id)).map(voucher => {
                                        const isEligible = isVoucherEligible(voucher);
                                        return (
                                            <label
                                                key={voucher.voucher_id}
                                                className={`flex items-start space-x-3 p-3 border rounded-lg ${
                                                    isEligible ? 'cursor-pointer hover:bg-gray-50' : 'cursor-not-allowed opacity-70'
                                                }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="price_voucher"
                                                    checked={priceVoucher?.voucher_id === voucher.voucher_id}
                                                    onChange={() => {
                                                        if (isEligible) {
                                                            setPriceVoucher(voucher);
                                                            updateOrderSummary(orderItems, voucher, shippingVoucher);
                                                        }
                                                    }}
                                                    disabled={!isEligible}
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
                                                        <p className={!isEligible ? 'text-red-500 font-medium' : ''}>
                                                            Đơn tối thiểu: {voucher.minimum_order_amount.toLocaleString('vi-VN')}đ
                                                            {!isEligible && ' (Chưa đủ điều kiện)'}
                                                        </p>
                                                        <p>Giảm tối đa: {voucher.maximum_discount_amount.toLocaleString('vi-VN')}đ</p>
                                                        <p>HSD: {new Date(voucher.end_date).toLocaleDateString('vi-VN')}</p>
                                                        {voucher.is_new_user_only && (
                                                            <p className="text-blue-600">Chỉ dành cho khách hàng mới</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </label>
                                        );
                                    })
                                ) : (
                                    <p className="text-gray-500 text-sm">Không có mã giảm giá sản phẩm nào khả dụng</p>
                                )}
                            </div>
                        </div>

                        {/* Phần mã giảm phí vận chuyển */}
                        <div>
                            <h3 className="text-md font-medium mb-3">Mã giảm phí vận chuyển</h3>
                            <div className="space-y-3">
                                {vouchers.filter(v => v.voucher_type === 'shipping' && !usedVouchersToday.includes(v.voucher_id)).length > 0 ? (
                                    vouchers.filter(v => v.voucher_type === 'shipping' && !usedVouchersToday.includes(v.voucher_id)).map(voucher => {
                                        const isEligible = isVoucherEligible(voucher);
                                        return (
                                            <label
                                                key={voucher.voucher_id}
                                                className={`flex items-start space-x-3 p-3 border rounded-lg ${
                                                    isEligible ? 'cursor-pointer hover:bg-gray-50' : 'cursor-not-allowed opacity-70'
                                                }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="shipping_voucher"
                                                    checked={shippingVoucher?.voucher_id === voucher.voucher_id}
                                                    onChange={() => {
                                                        if (isEligible) {
                                                            setShippingVoucher(voucher);
                                                            updateOrderSummary(orderItems, priceVoucher, voucher);
                                                        }
                                                    }}
                                                    disabled={!isEligible}
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
                                                        <p className={!isEligible ? 'text-red-500 font-medium' : ''}>
                                                            Đơn tối thiểu: {voucher.minimum_order_amount.toLocaleString('vi-VN')}đ
                                                            {!isEligible && ' (Chưa đủ điều kiện)'}
                                                        </p>
                                                        <p>Giảm tối đa: {voucher.maximum_discount_amount.toLocaleString('vi-VN')}đ</p>
                                                        <p>HSD: {new Date(voucher.end_date).toLocaleDateString('vi-VN')}</p>
                                                        {voucher.is_new_user_only && (
                                                            <p className="text-blue-600">Chỉ dành cho khách hàng mới</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </label>
                                        );
                                    })
                                ) : (
                                    <p className="text-gray-500 text-sm">Không có mã giảm phí vận chuyển nào khả dụng</p>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 pt-3 border-t flex justify-between">
                        <button
                            onClick={() => {
                                setPriceVoucher(null);
                                setShippingVoucher(null);
                                updateOrderSummary(orderItems, null, null);
                                setShowVoucherModal(false);
                            }}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800"
                        >
                            Bỏ chọn tất cả
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