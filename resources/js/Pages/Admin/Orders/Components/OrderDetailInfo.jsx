import React, { useState } from 'react';
import axios from 'axios';
import OrderStatusBadge from './OrderStatusBadge';

const OrderDetailInfo = ({ order }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [updatedOrder, setUpdatedOrder] = useState(order);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const handleCreateDelivery = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(`/api/admin/orders/${order.order_id}/delivery`, {}, {
        withCredentials: true // Gửi cookies để xác thực
      });
      if (response.data.status) {
        setUpdatedOrder(response.data.data);
      }
    } catch (err) {
      console.error('Lỗi tạo đơn giao:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message
      });
      setError(
        err.response?.status === 403
          ? 'Bạn không có quyền tạo đơn giao. Vui lòng kiểm tra vai trò admin.'
          : err.response?.status === 404
          ? 'Không tìm thấy API tạo đơn giao. Vui lòng liên hệ quản trị viên.'
          : err.response?.data?.message || 'Lỗi khi tạo đơn giao'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
      <div className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Thông tin đơn hàng</h3>
        
        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="mb-4">
              <span className="block text-sm font-medium text-gray-500">Mã đơn hàng</span>
              <span className="block mt-1 text-sm text-gray-900">
                {updatedOrder.tracking_number || 'Chưa có mã đơn hàng'}
              </span>
              <span className="block mt-1 text-xs text-gray-500">ID: #{updatedOrder.order_id}</span>
            </div>
            
            <div className="mb-4">
              <span className="block text-sm font-medium text-gray-500">Mã vận đơn</span>
              <span className="block mt-1 text-sm text-gray-900">
                {updatedOrder.delivery_order?.tracking_number || 'Chưa có mã vận đơn'}
              </span>
            </div>
            
            <div className="mb-4">
              <span className="block text-sm font-medium text-gray-500">Ngày đặt hàng</span>
              <span className="block mt-1 text-sm text-gray-900">{formatDate(updatedOrder.order_date)}</span>
            </div>
            
            <div className="mb-4">
              <span className="block text-sm font-medium text-gray-500">Phương thức thanh toán</span>
              <span className="block mt-1 text-sm text-gray-900">
                {updatedOrder.payment_method === 'COD' ? 'Thanh toán khi nhận hàng (COD)' : 'Thanh toán trực tuyến (VNPAY)'}
              </span>
            </div>
          </div>
          
          <div>
            <div className="mb-4">
              <span className="block text-sm font-medium text-gray-500">Trạng thái đơn hàng</span>
              <div className="mt-1">
                <OrderStatusBadge status={updatedOrder.order_status} />
              </div>
            </div>
            
            <div className="mb-4">
              <span className="block text-sm font-medium text-gray-500">Trạng thái thanh toán</span>
              <span className={`mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                updatedOrder.payment_status === 'PAID' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {updatedOrder.payment_status === 'PAID' ? 'Đã thanh toán' : 'Chưa thanh toán'}
              </span>
            </div>
            
            <div className="mb-4">
              <span className="block text-sm font-medium text-gray-500">Ghi chú</span>
              <span className="block mt-1 text-sm text-gray-900">{updatedOrder.note || 'Không có ghi chú'}</span>
            </div>
          </div>
        </div>
        
        <div className="mt-6 border-t border-gray-200 pt-4">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-gray-500">Tổng tiền sản phẩm:</span>
            <span className="text-sm font-medium">{formatCurrency(updatedOrder.subtotal_amount)}</span>
          </div>
          
          <div className="flex justify-between mb-2">
            <span className="text-sm text-gray-500">Phí vận chuyển:</span>
            <span className="text-sm font-medium">{formatCurrency(updatedOrder.shipping_fee)}</span>
          </div>
          
          {updatedOrder.discount_amount > 0 && (
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-500">Giảm giá:</span>
              <span className="text-sm font-medium text-red-600">-{formatCurrency(updatedOrder.discount_amount)}</span>
            </div>
          )}
          
          <div className="flex justify-between mt-4 pt-4 border-t border-gray-200">
            <span className="text-base font-medium text-gray-900">Tổng thanh toán:</span>
            <span className="text-base font-medium text-gray-900">{formatCurrency(updatedOrder.final_amount)}</span>
          </div>
        </div>

        {/* Nút Tạo đơn giao */}
        {updatedOrder.order_status === 'CONFIRMED' && (
          <div className="mt-6">
            {updatedOrder.delivery_order ? (
              <div className="text-sm text-gray-500">
                Đã tạo đơn giao (Mã: {updatedOrder.delivery_order.tracking_number})
              </div>
            ) : (
              <button
                onClick={handleCreateDelivery}
                disabled={loading}
                className={`inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                  loading ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500`}
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang tạo...
                  </span>
                ) : (
                  'Tạo đơn giao'
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetailInfo;