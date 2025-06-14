import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from '@inertiajs/react';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const VoucherList = () => {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
  });

  useEffect(() => {
    fetchVouchers();
  }, [filters]);

  const fetchVouchers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/vouchers', {
        params: filters
      });
      setVouchers(response.data.data);
    } catch (error) {
      console.error('Error fetching vouchers:', error.response?.data || error.message);
      toast.error(
        error.response?.data?.message || 
        'Không thể tải danh sách mã giảm giá'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const toggleVoucherStatus = async (voucher) => {
    try {
      await axios.patch(`/api/admin/vouchers/${voucher.voucher_id}/toggle-status`, {
        is_active: !voucher.is_active
      });
      toast.success(`Mã giảm giá đã ${!voucher.is_active ? 'kích hoạt' : 'vô hiệu hóa'}`);
      fetchVouchers();
    } catch (error) {
      console.error('Error toggling voucher status:', error);
      toast.error('Không thể cập nhật trạng thái mã giảm giá');
    }
  };

  const handleDeleteVoucher = async (voucherId) => {
    if (!confirm('Bạn có chắc chắn muốn xóa mã giảm giá này?')) return;
    
    try {
      await axios.delete(`/api/admin/vouchers/${voucherId}`);
      toast.success('Xóa mã giảm giá thành công');
      fetchVouchers();
    } catch (error) {
      console.error('Error deleting voucher:', error);
      toast.error('Không thể xóa mã giảm giá');
    }
  };

  const formatDiscountValue = (voucher) => {
    if (voucher.discount_type === 'percentage') {
      return `${voucher.discount_amount}%`;
    } else {
      return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(voucher.discount_amount);
    }
  };

  const renderVoucherType = (voucher) => {
    return voucher.voucher_type === 'price' ? 'Giảm giá đơn hàng' : 'Giảm phí vận chuyển';
  };

  const renderVoucherStatus = (voucher) => {
    const now = new Date();
    const startDate = new Date(voucher.start_date);
    const endDate = new Date(voucher.end_date);

    if (!voucher.is_active) {
      return <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">Vô hiệu</span>;
    } else if (now < startDate) {
      return <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">Sắp diễn ra</span>;
    } else if (now > endDate) {
      return <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Hết hạn</span>;
    } else if (voucher.used_count >= voucher.usage_limit) {
      return <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Đã dùng hết</span>;
    } else {
      return <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Đang hoạt động</span>;
    }
  };

  const renderVoucherScope = (voucher) => {
    const isPublic = Boolean(voucher.is_public);
    const isNewUserOnly = Boolean(voucher.is_new_user_only);
    let scopeText = isPublic ? 'Công khai' : 'Riêng tư';
    if (isNewUserOnly) {
      scopeText += ', Chỉ người mới';
    }
    return scopeText;
  };

  return (
    <div className="py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Quản lý mã giảm giá</h1>
        <Link
          href={route('admin.vouchers.create')}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Thêm mã giảm giá mới
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4">
        <div className="flex-1 min-w-[250px]">
          <label htmlFor="search" className="sr-only">Tìm kiếm</label>
          <input
            id="search"
            type="text"
            placeholder="Tìm kiếm mã giảm giá..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>

        <div className="w-auto">
          <label htmlFor="status" className="sr-only">Trạng thái</label>
          <select
            id="status"
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Đang hoạt động</option>
            <option value="inactive">Vô hiệu</option>
            <option value="upcoming">Sắp diễn ra</option>
            <option value="expired">Hết hạn</option>
          </select>
        </div>
      </div>

      {/* Vouchers Table */}
      {loading ? (
        <div className="flex justify-center">
          <div className="loader">Loading...</div>
        </div>
      ) : (
        <div className="shadow overflow-x-auto border-b border-gray-200 sm:rounded-lg max-w-full">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12"
                >
                  Mã
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/12"
                >
                  Tên
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12"
                >
                  Loại
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/12"
                >
                  Giảm giá
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/12"
                >
                  Thời gian
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12"
                >
                  Sử dụng
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12"
                >
                  Trạng thái
                </th>
                <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-2/12">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {vouchers.length > 0 ? (
                vouchers.map((voucher) => (
                  <tr key={voucher.voucher_id}>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {voucher.code}
                      </div>
                      <div className="text-sm text-gray-500 truncate max-w-[100px]">
                        {renderVoucherScope(voucher)}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-gray-900 truncate max-w-[150px]">
                        {voucher.name}
                      </div>
                      <div className="text-sm text-gray-500 truncate max-w-[150px]">
                        {voucher.description || 'Không có mô tả'}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {renderVoucherType(voucher)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDiscountValue(voucher)}
                      </div>
                      <div className="text-xs text-gray-500">
                        Đơn tối thiểu: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(voucher.minimum_order_amount)}
                      </div>
                      <div className="text-xs text-gray-500">
                        Giảm tối đa: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(voucher.maximum_discount_amount)}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        Từ: {format(new Date(voucher.start_date), 'dd/MM/yyyy', { locale: vi })}
                      </div>
                      <div className="text-sm text-gray-900">
                        Đến: {format(new Date(voucher.end_date), 'dd/MM/yyyy', { locale: vi })}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {voucher.used_count} / {voucher.usage_limit}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {renderVoucherStatus(voucher)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={route('admin.vouchers.edit', voucher.voucher_id)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        Sửa
                      </Link>
                      <button
                        onClick={() => toggleVoucherStatus(voucher)}
                        className={`mr-3 ${
                          voucher.is_active
                            ? 'text-yellow-600 hover:text-yellow-900'
                            : 'text-green-600 hover:text-green-900'
                        }`}
                      >
                        {voucher.is_active ? 'Vô hiệu' : 'Kích hoạt'}
                      </button>
                      <button
                        onClick={() => handleDeleteVoucher(voucher.voucher_id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-4 py-4 text-center text-gray-500">
                    Không có mã giảm giá nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
export default VoucherList;