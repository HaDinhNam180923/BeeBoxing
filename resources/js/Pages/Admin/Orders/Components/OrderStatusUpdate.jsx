import React, { useState } from 'react';
import OrderStatusBadge from './OrderStatusBadge';

const OrderStatusUpdate = ({ currentStatus, onStatusChange }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  
  const getAvailableStatuses = (currentStatus) => {
    if (currentStatus === 'PENDING') {
      return [
        { value: 'CONFIRMED', label: 'Xác nhận đơn hàng' },
        { value: 'CANCELLED', label: 'Hủy đơn hàng' }
      ];
    }
    return [];
  };
  
  const handleUpdateClick = () => {
    setIsUpdating(true);
    setSelectedStatus('');
  };
  
  const handleStatusSelect = (e) => {
    setSelectedStatus(e.target.value);
  };
  
  const handleSubmit = async () => {
    if (!selectedStatus) return;
    
    try {
      await onStatusChange(selectedStatus);
      setIsUpdating(false);
    } catch (error) {
      console.error('Lỗi cập nhật trạng thái:', error);
    }
  };
  
  const handleCancel = () => {
    setIsUpdating(false);
    setSelectedStatus('');
  };
  
  const availableStatuses = getAvailableStatuses(currentStatus);
  const canUpdateStatus = currentStatus === 'PENDING';

  return (
    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
      <div className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Trạng thái đơn hàng</h3>
        
        <div className="mb-4">
          <div className="flex items-center space-x-2">
            <OrderStatusBadge status={currentStatus} />
            <span className="text-sm text-gray-500">
              {
                currentStatus === 'CANCELLED' ? 'Đơn hàng đã bị hủy' : 
                currentStatus === 'CONFIRMED' ? 'Đơn hàng đã xác nhận' :
                'Trạng thái hiện tại'
              }
            </span>
          </div>
        </div>
        
        {canUpdateStatus && !isUpdating && (
          <button
            type="button"
            onClick={handleUpdateClick}
            className="mt-3 w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cập nhật trạng thái
          </button>
        )}
        
        {isUpdating && (
          <div className="mt-4 space-y-4">
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                Chọn trạng thái mới
              </label>
              <select
                id="status"
                name="status"
                className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={selectedStatus}
                onChange={handleStatusSelect}
              >
                <option value="">-- Chọn trạng thái --</option>
                {availableStatuses.map((status) => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
            </div>
            
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!selectedStatus}
                className={`flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white 
                  ${selectedStatus ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-indigo-300 cursor-not-allowed'}
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
              >
                Xác nhận
              </button>
              
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Hủy
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderStatusUpdate;