import React from 'react';

const OrderCustomerInfo = ({ user = {}, address = {} }) => {
  // Kiểm tra nếu user hoặc address không tồn tại
  if (!user || Object.keys(user).length === 0 || !address || Object.keys(address).length === 0) {
    return (
      <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Thông tin khách hàng</h3>
          <p className="text-gray-500">Không có thông tin khách hàng hoặc đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
      <div className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Thông tin khách hàng</h3>
        
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-500 mb-2">Người đặt hàng</h4>
          <div className="border rounded-md p-3 bg-gray-50">
            <div className="text-sm mb-1">
              <span className="font-medium">{user.name || 'Không có tên'}</span>
            </div>
            <div className="text-sm mb-1">
              <span className="text-gray-600">Email: </span>
              <span>{user.email || 'Không có email'}</span>
            </div>
            <div className="text-sm">
              <span className="text-gray-600">Điện thoại: </span>
              <span>{user.phone || 'Không có'}</span>
            </div>
          </div>
        </div>
        
        <div>
          <h4 className="text-sm font-medium text-gray-500 mb-2">Địa chỉ giao hàng</h4>
          <div className="border rounded-md p-3 bg-gray-50">
            <div className="text-sm mb-1">
              <span className="font-medium">{address.receiver_name || 'Không có tên người nhận'}</span>
            </div>
            <div className="text-sm mb-1">
              <span className="text-gray-600">Điện thoại: </span>
              <span>{address.phone || 'Không có số điện thoại'}</span>
            </div>
            <div className="text-sm mb-1">
              <span className="text-gray-600">Địa chỉ: </span>
              <span>
                {[
                  address.street_address,
                  address.ward,
                  address.district,
                  address.province
                ].filter(Boolean).join(', ') || 'Không có địa chỉ'}
              </span>
            </div>
            {address.note && (
              <div className="text-sm">
                <span className="text-gray-600">Ghi chú: </span>
                <span>{address.note}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderCustomerInfo;