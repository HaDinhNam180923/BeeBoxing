import React, { useEffect, useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import AdminSidebar from '@/Layouts/AdminSidebar';
import { Head, useForm } from '@inertiajs/react';
import axios from 'axios';
import OrderDetailInfo from './Components/OrderDetailInfo';
import OrderStatusUpdate from './Components/OrderStatusUpdate';
import OrderItems from './Components/OrderItems';
import OrderCustomerInfo from './Components/OrderCustomerInfo';

const Detail = ({ orderId }) => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [debug, setDebug] = useState(false); // Thêm state để bật/tắt chế độ debug

  useEffect(() => {
    const fetchOrderDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Đảm bảo gửi cookies với request
        const response = await axios.get(`/api/admin/orders/${orderId}`, {
          withCredentials: true
        });
        
        if (response.data.status) {
          setOrder(response.data.data);
          
          // Log dữ liệu để debug
          console.log('Order data:', response.data.data);
          
          // Kiểm tra cấu trúc sản phẩm để debug vấn đề hình ảnh
          if (response.data.data.order_details && response.data.data.order_details.length > 0) {
            console.log('First product item:', response.data.data.order_details[0]);
            
            // Kiểm tra đường dẫn ảnh sản phẩm
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
      });
      
      if (response.data.status) {
        setOrder(response.data.data);
      }
    } catch (error) {
      console.error('Lỗi cập nhật trạng thái:', error);
      alert(error.response?.data?.message || 'Lỗi khi cập nhật trạng thái');
    }
  };

  // Hàm bật/tắt chế độ debug
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
          {/* Button toggle chế độ debug - chỉ hiện trong môi trường phát triển */}
          {process.env.NODE_ENV !== 'production' && (
            <button 
              onClick={toggleDebug}
              className="mb-4 px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm rounded"
            >
              {debug ? 'Tắt Debug' : 'Bật Debug'}
            </button>
          )}
          
          {/* Hiển thị thông tin debug nếu được bật */}
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
              </div>
              
              <div className="space-y-6">
                <OrderStatusUpdate 
                  currentStatus={order.order_status}
                  onStatusChange={handleStatusChange}
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