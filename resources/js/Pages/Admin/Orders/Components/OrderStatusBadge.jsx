import React from 'react';

const OrderStatusBadge = ({ status }) => {
  const getStatusConfig = (status) => {
    switch (status) {
      case 'PENDING':
        return {
          label: 'Chờ xác nhận',
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-800'
        };
      case 'CONFIRMED':
        return {
          label: 'Đã xác nhận',
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-800'
        };
      case 'DELIVERING':
        return {
          label: 'Đang giao hàng',
          bgColor: 'bg-purple-100',
          textColor: 'text-purple-800'
        };
      case 'COMPLETED':
        return {
          label: 'Hoàn thành',
          bgColor: 'bg-green-100',
          textColor: 'text-green-800'
        };
      case 'CANCELLED':
        return {
          label: 'Đã hủy',
          bgColor: 'bg-red-100',
          textColor: 'text-red-800'
        };
      default:
        return {
          label: 'Không xác định',
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800'
        };
    }
  };

  const { label, bgColor, textColor } = getStatusConfig(status);

  return (
    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${bgColor} ${textColor}`}>
      {label}
    </span>
  );
};

export default OrderStatusBadge;