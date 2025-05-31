import React from 'react';
import OrderStatusBadge from './OrderStatusBadge';

const OrderDetailInfo = ({ order }) => {
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

  return (
    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
      <div className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Thông tin đơn hàng</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="mb-4">
              <span className="block text-sm font-medium text-gray-500">Mã đơn hàng</span>
              <span className="block mt-1 text-sm text-gray-900">{order.order_id}</span>
            </div>
            
            <div className="mb-4">
              <span className="block text-sm font-medium text-gray-500">Mã vận đơn</span>
              <span className="block mt-1 text-sm text-gray-900">{order.tracking_number || 'Chưa có mã vận đơn'}</span>
            </div>
            
            <div className="mb-4">
              <span className="block text-sm font-medium text-gray-500">Ngày đặt hàng</span>
              <span className="block mt-1 text-sm text-gray-900">{formatDate(order.order_date)}</span>
            </div>
            
            <div className="mb-4">
              <span className="block text-sm font-medium text-gray-500">Phương thức thanh toán</span>
              <span className="block mt-1 text-sm text-gray-900">
                {order.payment_method === 'COD' ? 'Thanh toán khi nhận hàng (COD)' : 'Thanh toán trực tuyến (VNPAY)'}
              </span>
            </div>
          </div>
          
          <div>
            <div className="mb-4">
              <span className="block text-sm font-medium text-gray-500">Trạng thái đơn hàng</span>
              <div className="mt-1">
                <OrderStatusBadge status={order.order_status} />
              </div>
            </div>
            
            <div className="mb-4">
              <span className="block text-sm font-medium text-gray-500">Trạng thái thanh toán</span>
              <span className={`mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                order.payment_status === 'PAID' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {order.payment_status === 'PAID' ? 'Đã thanh toán' : 'Chưa thanh toán'}
              </span>
            </div>
            
            <div className="mb-4">
              <span className="block text-sm font-medium text-gray-500">Ghi chú</span>
              <span className="block mt-1 text-sm text-gray-900">{order.note || 'Không có ghi chú'}</span>
            </div>
          </div>
        </div>
        
        <div className="mt-6 border-t border-gray-200 pt-4">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-gray-500">Tổng tiền sản phẩm:</span>
            <span className="text-sm font-medium">{formatCurrency(order.subtotal_amount)}</span>
          </div>
          
          <div className="flex justify-between mb-2">
            <span className="text-sm text-gray-500">Phí vận chuyển:</span>
            <span className="text-sm font-medium">{formatCurrency(order.shipping_fee)}</span>
          </div>
          
          {order.discount_amount > 0 && (
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-500">Giảm giá:</span>
              <span className="text-sm font-medium text-red-600">-{formatCurrency(order.discount_amount)}</span>
            </div>
          )}
          
          <div className="flex justify-between mt-4 pt-4 border-t border-gray-200">
            <span className="text-base font-medium text-gray-900">Tổng thanh toán:</span>
            <span className="text-base font-medium text-gray-900">{formatCurrency(order.final_amount)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailInfo;