import React from 'react';
import { Link } from '@inertiajs/react';

const OrderItems = ({ items = [] }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency', 
      currency: 'VND'
    }).format(amount);
  };

  // Hàm helper để lấy URL ảnh sản phẩm an toàn
  const getProductImage = (item) => {
    // Kiểm tra và lấy ảnh từ sản phẩm liên kết
    const productImage = item?.inventory?.color?.product?.colors?.[0]?.images?.[0]?.image_url;
    
    // Kiểm tra và lấy ảnh từ màu sắc hiện tại
    const colorImage = item?.inventory?.color?.images?.[0]?.image_url;
    
    return productImage || colorImage || null;
  };

  // Đảm bảo URL ảnh đầy đủ
  const getFullImagePath = (path) => {
    if (!path) return null;
    
    // Nếu đã là đường dẫn đầy đủ
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    
    // Nếu là đường dẫn tương đối, thêm base URL
    return `${window.location.origin}${path}`;
  };

  // Hiển thị thông báo khi không có sản phẩm
  if (!items || items.length === 0) {
    return (
      <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Danh sách sản phẩm</h3>
          <p className="text-gray-500">Không có sản phẩm nào trong đơn hàng này.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
      <div className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Danh sách sản phẩm</h3>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sản phẩm
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phân loại
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Đơn giá
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Số lượng
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thành tiền
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {items.map((item) => (
                <tr key={item.order_detail_id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {getProductImage(item) ? (
                          <img 
                            className="h-10 w-10 rounded object-cover" 
                            src={getFullImagePath(getProductImage(item))} 
                            alt={item.inventory?.color?.product?.name || 'Sản phẩm'} 
                            onError={(e) => {
                              console.log('Ảnh lỗi:', e.target.src);
                              e.target.onerror = null;
                              e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjZTVlN2ViIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iOCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgYWxpZ25tZW50LWJhc2VsaW5lPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmaWxsPSIjOWNhM2FmIj5ObyBpbWFnZTwvdGV4dD48L3N2Zz4=';
                            }}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded bg-gray-200 flex items-center justify-center">
                            <span className="text-xs text-gray-500">No img</span>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        {item.inventory?.color?.product?.product_id ? (
                          <Link 
                            href={`/products/${item.inventory.color.product.product_id}`}
                            className="text-sm font-medium text-gray-900 hover:text-indigo-600"
                          >
                            {item.inventory?.color?.product?.name || 'Không có tên sản phẩm'}
                          </Link>
                        ) : (
                          <span className="text-sm font-medium text-gray-900">
                            {item.inventory?.color?.product?.name || 'Không có tên sản phẩm'}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span>Màu: {item.inventory?.color?.color_name || 'N/A'}</span>
                    <br />
                    <span>Size: {item.inventory?.size || 'N/A'}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatCurrency(item.unit_price || 0)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.quantity || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatCurrency(item.subtotal || 0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OrderItems;