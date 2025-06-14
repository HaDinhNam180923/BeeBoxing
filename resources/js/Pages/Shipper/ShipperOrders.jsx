import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Link } from '@inertiajs/react';

const ShipperOrders = () => {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [order, setOrder] = useState(null);
  const [deliveringOrders, setDeliveringOrders] = useState([]);
  const [deliveredOrders, setDeliveredOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    delivering: { current_page: 1, last_page: 1 },
    delivered: { current_page: 1, last_page: 1 },
  });

  const formatPrice = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleSearchOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
    setOrder(null);

    try {
      const response = await axios.post(
        '/api/shipper/orders/by-tracking-number',
        { tracking_number: trackingNumber },
        { withCredentials: true }
      );
      if (response.data.status) {
        setOrder(response.data.data);
      } else {
        toast.error(response.data.message || 'Không tìm thấy đơn hàng');
      }
    } catch (error) {
      console.error('Lỗi tìm đơn hàng:', error.response?.data);
      toast.error(error.response?.data?.message || 'Lỗi khi tìm đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const fetchDeliveringOrders = async (page = 1) => {
    try {
      const response = await axios.get(`/api/shipper/orders/delivering?page=${page}`, {
        withCredentials: true,
      });
      if (response.data.status) {
        setDeliveringOrders(response.data.data.data || []);
        setPagination(prev => ({
          ...prev,
          delivering: {
            current_page: response.data.data.current_page || 1,
            last_page: response.data.data.last_page || 1,
          },
        }));
      } else {
        toast.error(response.data.message || 'Không có đơn hàng đang giao');
      }
    } catch (error) {
      console.error('Lỗi fetchDeliveringOrders:', error.response?.data);
      toast.error(error.response?.data?.message || 'Lỗi khi tải đơn hàng đang giao');
    }
  };

  const fetchDeliveredOrders = async (page = 1) => {
    try {
      const response = await axios.get(`/api/shipper/orders/delivered?page=${page}`, {
        withCredentials: true,
      });
      if (response.data.status) {
        setDeliveredOrders(response.data.data.data || []);
        setPagination(prev => ({
          ...prev,
          delivered: {
            current_page: response.data.data.current_page || 1,
            last_page: response.data.data.last_page || 1,
          },
        }));
      } else {
        toast.error(response.data.message || 'Không có đơn hàng đã giao');
      }
    } catch (error) {
      console.error('Lỗi fetchDeliveredOrders:', error.response?.data);
      toast.error(error.response?.data?.message || 'Lỗi khi tải đơn hàng đã giao');
    }
  };

  useEffect(() => {
    fetchDeliveringOrders();
    fetchDeliveredOrders();
  }, []);

  const handlePageChange = (type, page) => {
    if (type === 'delivering') {
      fetchDeliveringOrders(page);
    } else {
      fetchDeliveredOrders(page);
    }
  };

  return (
    <div className="py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Quản lý đơn hàng</h1>
      </div>

      {/* Search by Tracking Number */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Tìm đơn hàng</h3>
        <form onSubmit={handleSearchOrder} className="flex gap-4">
          <input
            type="text"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            placeholder="Nhập mã vận đơn"
            className="flex-1 border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
          <button
            type="submit"
            disabled={loading}
            className={`px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Đang tìm...' : 'Tìm kiếm'}
          </button>
        </form>

        {order && (
          <div className="mt-4">
            <h4 className="text-md font-semibold text-gray-900 mb-2">Chi tiết đơn hàng</h4>
            <div className="border rounded-md p-3 bg-gray-50">
              <p><strong>Mã vận đơn:</strong> {order.tracking_number}</p>
              <p><strong>Khách hàng:</strong> {order.order?.user?.name || 'N/A'}</p>
              <p><strong>Địa chỉ:</strong> {[
                order.order?.address?.street_address,
                order.order?.address?.ward,
                order.order?.address?.district,
                order.order?.address?.province
              ].filter(Boolean).join(', ') || 'N/A'}</p>
              <p><strong>Tổng tiền:</strong> {order.order ? formatPrice(order.order.final_amount) : 'N/A'}</p>
              <p><strong>Trạng thái:</strong> {order.status === 'delivering' ? 'Đang giao' : 'Đã giao'}</p>
              <p><strong>Ngày giao:</strong> {order.assigned_at ? formatDate(order.assigned_at) : 'Chưa gán'}</p>
            </div>
          </div>
        )}
      </div>

      {/* Delivering Orders */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Đơn hàng đang giao</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã vận đơn</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Khách hàng</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tổng tiền</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày gán</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {deliveringOrders.length > 0 ? (
                deliveringOrders.map((order) => (
                  <tr key={order.delivery_order_id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.tracking_number}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.order?.user?.name || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.order ? formatPrice(order.order.final_amount) : 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.assigned_at ? formatDate(order.assigned_at) : 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <Link
                        href={`/shipper/orders/${order.order?.order_id}`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Chi tiết
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                    Không có đơn hàng đang giao
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {pagination.delivering.last_page > 1 && (
          <div className="mt-4 flex justify-center">
            {Array.from({ length: pagination.delivering.last_page }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => handlePageChange('delivering', i + 1)}
                className={`mx-1 px-3 py-1 rounded-md ${pagination.delivering.current_page === i + 1 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Delivered Orders */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Đơn hàng đã giao</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã vận đơn</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Khách hàng</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tổng tiền</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày giao</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {deliveredOrders.length > 0 ? (
                deliveredOrders.map((order) => (
                  <tr key={order.delivery_order_id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.tracking_number}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.order?.user?.name || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.order ? formatPrice(order.order.final_amount) : 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.delivered_at ? formatDate(order.delivered_at) : 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <Link
                        href={`/shipper/orders/${order.order?.order_id}`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Chi tiết
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                    Không có đơn hàng đã giao
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {pagination.delivered.last_page > 1 && (
          <div className="mt-4 flex justify-center">
            {Array.from({ length: pagination.delivered.last_page }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => handlePageChange('delivered', i + 1)}
                className={`mx-1 px-3 py-1 rounded-md ${pagination.delivered.current_page === i + 1 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShipperOrders;