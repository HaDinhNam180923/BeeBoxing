import React from 'react';
import { formatVND } from '@/Utils/format';

const OrderReturnInfo = ({ order }) => {
    const getReturnStatusText = (status) => {
        const statusText = {
            PENDING: 'Chờ duyệt',
            APPROVED: 'Đã duyệt',
            REJECTED: 'Bị từ chối',
            COMPLETED: 'Hoàn tất'
        };
        return statusText[status] || 'Không xác định';
    };

    const getReturnStatusColor = (status) => {
        switch (status) {
            case 'PENDING': return 'bg-orange-100 text-orange-800';
            case 'APPROVED': return 'bg-blue-100 text-blue-800';
            case 'REJECTED': return 'bg-red-100 text-red-800';
            case 'COMPLETED': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (!order.return_status) {
        return (
            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                <div className="p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Thông tin trả hàng</h3>
                    <p className="text-gray-500">Đơn hàng chưa có yêu cầu trả hàng.</p>
                </div>
            </div>
        );
    }

    const returnItems = order.order_details.filter(item => item.return_quantity > 0);

    return (
        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Thông tin trả hàng</h3>
                <div className="space-y-4">
                    <div>
                        <span className="block text-sm font-medium text-gray-500">Trạng thái trả hàng</span>
                        <span className={`mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getReturnStatusColor(order.return_status)}`}>
                            {getReturnStatusText(order.return_status)}
                        </span>
                    </div>
                    <div>
                        <span className="block text-sm font-medium text-gray-500">Lý do trả hàng</span>
                        <span className="block mt-1 text-sm text-gray-900">{order.return_note || 'Không có lý do'}</span>
                    </div>
                    {order.return_images?.length > 0 && (
                        <div>
                            <span className="block text-sm font-medium text-gray-500">Hình ảnh minh chứng</span>
                            <div className="mt-2 flex space-x-2 overflow-x-auto">
                                {order.return_images.map((url, index) => (
                                    <img
                                        key={index}
                                        src={url}
                                        alt={`Return proof ${index + 1}`}
                                        className="w-20 h-20 object-cover rounded"
                                        onError={(e) => {
                                            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjZTVlN2ViIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iOCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgYWxpZ25tZW50LWJhc2VsaW5lPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmaWxsPSIjOWNhM2FmIj5ObyBpbWFnZTwvdGV4dD48L3N2Zz4=';
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                    {returnItems.length > 0 && (
                        <div>
                            <span className="block text-sm font-medium text-gray-500">Sản phẩm trả hàng</span>
                            <ul className="mt-2 list-disc pl-5 text-sm text-gray-900">
                                {returnItems.map((item) => (
                                    <li key={item.order_detail_id}>
                                        {item.inventory?.color?.product?.name || 'Sản phẩm không xác định'} 
                                        ({item.inventory?.color?.color_name}, {item.inventory?.size}) 
                                        x {item.return_quantity} ({formatVND(item.unit_price * item.return_quantity)})
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OrderReturnInfo;