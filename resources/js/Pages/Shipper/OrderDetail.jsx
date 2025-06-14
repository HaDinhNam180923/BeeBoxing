import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Head } from '@inertiajs/react';
import ShipperLayout from './ShipperLayout';
import ShipperSidebar from './ShipperSidebar';

const OrderDetail = ({ orderId }) => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [image, setImage] = useState(null);

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

  useEffect(() => {
    const fetchOrderDetail = async () => {
      try {
        const response = await axios.get(`/api/shipper/orders/${orderId}`, {
          withCredentials: true,
        });
        if (response.data.status) {
          setOrder(response.data.data);
        } else {
          toast.error(response.data.message || 'Không tìm thấy đơn hàng');
        }
      } catch (error) {
        console.error('Lỗi lấy chi tiết đơn hàng:', error.response?.data);
        toast.error(error.response?.data?.message || 'Lỗi khi lấy chi tiết đơn hàng');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetail();
  }, [orderId]);

  const handleMarkAsReceived = async () => {
    try {
      const response = await axios.post(
        `/api/shipper/orders/${orderId}/mark-received`,
        {},
        { withCredentials: true }
      );
      if (response.data.status) {
        setOrder(response.data.data);
        toast.success('Đã cập nhật trạng thái thành Đã lấy hàng');
      } else {
        toast.error(response.data.message || 'Lỗi khi cập nhật trạng thái');
      }
    } catch (error) {
      console.error('Lỗi cập nhật trạng thái:', error.response?.data);
      toast.error(error.response?.data?.message || 'Lỗi khi cập nhật trạng thái');
    }
  };

  const handleMarkAsDelivered = async (e) => {
    e.preventDefault();
    if (!image) {
      toast.error('Vui lòng tải lên ảnh chứng minh');
      return;
    }

    const formData = new FormData();
    formData.append('proof_image', image);

    try {
      const response = await axios.post(
        `/api/shipper/orders/${orderId}/mark-delivered`,
        formData,
        {
          withCredentials: true,
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );
      if (response.data.status) {
        setOrder(response.data.data);
        setImage(null);
        toast.success('Đã cập nhật trạng thái thành Đã giao hàng');
      } else {
        toast.error(response.data.message || 'Lỗi khi cập nhật trạng thái');
      }
    } catch (error) {
      console.error('Lỗi cập nhật trạng thái:', error.response?.data);
      toast.error(error.response?.data?.message || 'Lỗi khi cập nhật trạng thái');
    }
  };

  if (loading) {
    return (
      <ShipperLayout>
        <ShipperSidebar>
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        </ShipperSidebar>
      </ShipperLayout>
    );
  }

  if (!order) {
    return (
      <ShipperLayout>
        <ShipperSidebar>
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-red-600">Không tìm thấy đơn hàng</div>
          </div>
        </ShipperSidebar>
      </ShipperLayout>
    );
  }

  return (
    <ShipperLayout>
      <ShipperSidebar>
        <Head title={`Chi tiết đơn hàng #${order.tracking_number}`} />
        <div className="py-6">
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
              <h1 className="text-2xl font-bold mb-4">Chi tiết đơn hàng #{order.tracking_number}</h1>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h2 className="text-xl font-semibold mb-4">Thông tin đơn hàng</h2>
                  <div className="space-y-2">
                    <p><strong>Mã vận đơn:</strong> {order.tracking_number}</p>
                    <p><strong>Trạng thái:</strong> {order.status === 'delivering' ? 'Đang giao' : order.status === 'delivered' ? 'Đã giao' : 'Chưa xử lý'}</p>
                    <p><strong>Ngày gán:</strong> {order.assigned_at ? formatDate(order.assigned_at) : 'Chưa gán'}</p>
                    <p><strong>Ngày nhận hàng:</strong> {order.received_at ? formatDate(order.received_at) : 'Chưa nhận'}</p>
                    <p><strong>Ngày giao:</strong> {order.delivered_at ? formatDate(order.delivered_at) : 'Chưa giao'}</p>
                    <p><strong>Tổng tiền:</strong> {order.order ? formatPrice(order.order.final_amount) : 'N/A'}</p>
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-4">Thông tin khách hàng</h2>
                  <div className="space-y-2">
                    <p><strong>Tên:</strong> {order.order?.user?.name || 'N/A'}</p>
                    <p><strong>Địa chỉ:</strong> {[
                      order.order?.address?.street_address,
                      order.order?.address?.ward,
                      order.order?.address?.district,
                      order.order?.address?.province
                    ].filter(Boolean).join(', ') || 'N/A'}</p>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4">Hành động</h2>
                {order.status === 'created' && (
                  <button
                    onClick={handleMarkAsReceived}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 mr-4"
                  >
                    Đã lấy hàng
                  </button>
                )}
                {order.status === 'delivering' && (
                  <form onSubmit={handleMarkAsDelivered} className="flex items-center space-x-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setImage(e.target.files[0])}
                      className="border-gray-300 rounded-md"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      Đã giao hàng
                    </button>
                  </form>
                )}
                {order.proof_image && (
                  <div className="mt-4">
                    <h3 className="text-lg font-semibold mb-2">Ảnh chứng minh</h3>
                    <img
                      src={order.proof_image}
                      alt="Ảnh chứng minh giao hàng"
                      className="w-64 h-auto rounded-md"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </ShipperSidebar>
    </ShipperLayout>
  );
};

export default OrderDetail;