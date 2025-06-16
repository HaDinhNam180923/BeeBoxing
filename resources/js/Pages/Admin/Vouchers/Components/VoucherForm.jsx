import React, { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import axios from 'axios';
import { toast } from 'react-toastify';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const VoucherForm = ({ voucher, isEditing = false }) => {
  const [loading, setLoading] = useState(false);
  const [searchUser, setSearchUser] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showUserSearch, setShowUserSearch] = useState(false);
  
  const [startDate, setStartDate] = useState(
    isEditing && voucher?.start_date ? new Date(voucher.start_date) : new Date()
  );
  const [endDate, setEndDate] = useState(
    isEditing && voucher?.end_date 
      ? new Date(voucher.end_date) 
      : new Date(new Date().setMonth(new Date().getMonth() + 1))
  );
  
  const { data, setData, post, put, processing, errors, reset } = useForm({
    code: voucher?.code || '',
    name: voucher?.name || '',
    description: voucher?.description || '',
    discount_amount: voucher?.discount_amount || 0,
    minimum_order_amount: voucher?.minimum_order_amount || 0,
    maximum_discount_amount: voucher?.maximum_discount_amount || 0,
    usage_limit: voucher?.usage_limit || 100,
    start_date: startDate,
    end_date: endDate,
    is_active: voucher?.is_active ?? true,
    discount_type: voucher?.discount_type || 'percentage',
    voucher_type: voucher?.voucher_type || 'price',
    is_public: voucher?.is_public ?? true,
    is_new_user_only: voucher?.is_new_user_only ?? false,
    user_id: voucher?.user_id || null,
  });

  // Cập nhật maximum_discount_amount khi discount_type là fixed
  useEffect(() => {
    if (data.discount_type === 'fixed') {
      setData('maximum_discount_amount', data.discount_amount); // Tự động gán bằng discount_amount
    }
  }, [data.discount_type, data.discount_amount]);

  useEffect(() => {
    if (searchUser.length >= 2) {
      searchUsers(searchUser);
    } else {
      setSearchResults([]);
    }
  }, [searchUser]);

  const searchUsers = async (query) => {
    try {
      const response = await axios.get(`/api/admin/users/search?query=${query}`);
      setSearchResults(response.data.data);
    } catch (error) {
      console.error('Lỗi khi tìm kiếm người dùng:', error);
    }
  };

  const selectUser = (user) => {
    setData('user_id', user.id);
    setSearchUser(user.name);
    setShowUserSearch(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const formData = {
        ...data,
        start_date: data.start_date.toISOString(),
        end_date: data.end_date.toISOString(),
      };
      
      console.log('Form Data:', formData); // Debug payload
      
      if (isEditing) {
        await axios.put(`/api/admin/vouchers/${voucher.voucher_id}`, formData);
        toast.success('Cập nhật mã giảm giá thành công');
      } else {
        await axios.post('/api/admin/vouchers', formData);
        toast.success('Thêm mã giảm giá thành công');
        reset();
        setStartDate(new Date());
        setEndDate(new Date(new Date().setMonth(new Date().getMonth() + 1)));
      }
    } catch (error) {
      console.error('Lỗi khi lưu mã giảm giá:', error);
      
      if (error.response && error.response.data && error.response.data.errors) {
        const errorMessages = Object.values(error.response.data.errors).flat();
        errorMessages.forEach(message => toast.error(message));
      } else {
        toast.error('Có lỗi xảy ra khi lưu mã giảm giá');
      }
    } finally {
      setLoading(false);
    }
  };

  const generateRandomCode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const codeLength = 8;
    let result = '';
    
    for (let i = 0; i < codeLength; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    
    setData('code', result);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
      <div className="bg-white shadow px-4 py-6 rounded-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="col-span-1">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Thông tin cơ bản</h3>
            
            <div className="mb-4">
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
                Mã giảm giá <span className="text-red-500">*</span>
              </label>
              <div className="flex">
                <input
                  id="code"
                  type="text"
                  value={data.code}
                  onChange={(e) => setData('code', e.target.value.toUpperCase())}
                  className="w-full border-gray-300 rounded-l-md shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  required
                />
                <button
                  type="button"
                  onClick={generateRandomCode}
                  className="px-3 py-2 bg-gray-200 text-gray-700 rounded-r-md hover:bg-gray-300"
                >
                  Tạo mã
                </button>
              </div>
              {errors.code && (
                <p className="mt-1 text-sm text-red-600">{errors.code}</p>
              )}
            </div>

            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Tên mã giảm giá <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                type="text"
                value={data.name}
                onChange={(e) => setData('name', e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                required
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div className="mb-4">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Mô tả
              </label>
              <textarea
                id="description"
                value={data.description}
                onChange={(e) => setData('description', e.target.value)}
                rows="3"
                className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              ></textarea>
            </div>

            <div className="mb-4">
              <label htmlFor="voucher_type" className="block text-sm font-medium text-gray-700 mb-1">
                Loại mã giảm giá <span className="text-red-500">*</span>
              </label>
              <select
                id="voucher_type"
                value={data.voucher_type}
                onChange={(e) => setData('voucher_type', e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                required
              >
                <option value="price">Giảm giá đơn hàng</option>
                <option value="shipping">Giảm phí vận chuyển</option>
              </select>
              {errors.voucher_type && (
                <p className="mt-1 text-sm text-red-600">{errors.voucher_type}</p>
              )}
            </div>

            <div className="mb-4">
              <label htmlFor="discount_type" className="block text-sm font-medium text-gray-700 mb-1">
                Loại giá trị giảm <span className="text-red-500">*</span>
              </label>
              <select
                id="discount_type"
                value={data.discount_type}
                onChange={(e) => setData('discount_type', e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                required
              >
                <option value="percentage">Phần trăm (%)</option>
                <option value="fixed">Số tiền cố định (VNĐ)</option>
              </select>
            </div>

            <div className="mb-4">
              <label htmlFor="discount_amount" className="block text-sm font-medium text-gray-700 mb-1">
                Giá trị giảm giá <span className="text-red-500">*</span>
              </label>
              <input
                id="discount_amount"
                type="number"
                step={data.discount_type === 'percentage' ? '0.1' : '1000'}
                min="0"
                max={data.discount_type === 'percentage' ? '100' : '10000000'}
                value={data.discount_amount}
                onChange={(e) => setData('discount_amount', e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                required
              />
              {errors.discount_amount && (
                <p className="mt-1 text-sm text-red-600">{errors.discount_amount}</p>
              )}
              {data.discount_type === 'percentage' && (
                <p className="mt-1 text-sm text-gray-500">Giá trị từ 0-100%</p>
              )}
            </div>

            <div className="mb-4">
              <label htmlFor="minimum_order_amount" className="block text-sm font-medium text-gray-700 mb-1">
                Giá trị đơn hàng tối thiểu <span className="text-red-500">*</span>
              </label>
              <input
                id="minimum_order_amount"
                type="number"
                step="1000"
                min="0"
                value={data.minimum_order_amount}
                onChange={(e) => setData('minimum_order_amount', e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                required
              />
              {errors.minimum_order_amount && (
                <p className="mt-1 text-sm text-red-600">{errors.minimum_order_amount}</p>
              )}
            </div>

            {data.discount_type === 'percentage' && ( // Chỉ hiển thị khi discount_type là percentage
              <div className="mb-4">
                <label htmlFor="maximum_discount_amount" className="block text-sm font-medium text-gray-700 mb-1">
                  Giảm giá tối đa (VNĐ) <span className="text-red-500">*</span>
                </label>
                <input
                  id="maximum_discount_amount"
                  type="number"
                  step="1000"
                  min="0"
                  value={data.maximum_discount_amount}
                  onChange={(e) => setData('maximum_discount_amount', e.target.value)}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  required
                />
                {errors.maximum_discount_amount && (
                  <p className="mt-1 text-sm text-red-600">{errors.maximum_discount_amount}</p>
                )}
              </div>
            )}
          </div>

          <div className="col-span-1">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Thời gian & Giới hạn</h3>
            
            <div className="mb-4">
              <label htmlFor="usage_limit" className="block text-sm font-medium text-gray-700 mb-1">
                Số lượng mã giảm giá <span className="text-red-500">*</span>
              </label>
              <input
                id="usage_limit"
                type="number"
                min="1"
                value={data.usage_limit}
                onChange={(e) => setData('usage_limit', e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                required
              />
              {errors.usage_limit && (
                <p className="mt-1 text-sm text-red-600">{errors.usage_limit}</p>
              )}
            </div>

            <div className="mb-4">
              <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-1">
                Ngày bắt đầu <span className="text-red-500">*</span>
              </label>
              <DatePicker
                id="start_date"
                selected={startDate}
                onChange={date => {
                  setStartDate(date);
                  setData('start_date', date);
                }}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                dateFormat="dd/MM/yyyy"
                className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 mb-1">
                Ngày hết hạn <span className="text-red-500">*</span>
              </label>
              <DatePicker
                id="end_date"
                selected={endDate}
                onChange={date => {
                  setEndDate(date);
                  setData('end_date', date);
                }}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                minDate={startDate}
                dateFormat="dd/MM/yyyy"
                className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
            </div>

            <div className="mb-4">
              <div className="flex items-center mb-2">
                <input
                  id="is_active"
                  type="checkbox"
                  checked={data.is_active}
                  onChange={(e) => setData('is_active', e.target.checked)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="is_active" className="ml-2 block text-sm font-medium text-gray-700">
                  Kích hoạt
                </label>
              </div>
              <div className="flex items-center mb-2">
                <input
                  id="is_public"
                  type="checkbox"
                  checked={data.is_public}
                  onChange={(e) => {
                    setData('is_public', e.target.checked);
                    if (e.target.checked) {
                      setData('user_id', null);
                      setSearchUser('');
                    }
                  }}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="is_public" className="ml-2 block text-sm font-medium text-gray-700">
                  Áp dụng cho tất cả khách hàng
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="is_new_user_only"
                  type="checkbox"
                  checked={data.is_new_user_only}
                  onChange={(e) => setData('is_new_user_only', e.target.checked)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="is_new_user_only" className="ml-2 block text-sm font-medium text-gray-700">
                  Chỉ dành cho khách hàng mới
                </label>
              </div>
            </div>

            {!data.is_public && (
              <div className="mb-4">
                <label htmlFor="search_user" className="block text-sm font-medium text-gray-700 mb-1">
                  Chọn khách hàng
                </label>
                <div className="relative">
                  <input
                    id="search_user"
                    type="text"
                    value={searchUser}
                    onChange={(e) => {
                      setSearchUser(e.target.value);
                      setShowUserSearch(true);
                    }}
                    onClick={() => setShowUserSearch(true)}
                    placeholder="Tìm kiếm khách hàng..."
                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  />
                  {showUserSearch && searchResults.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white shadow-lg rounded-md max-h-60 overflow-auto">
                      {searchResults.map(user => (
                        <div
                          key={user.id}
                          className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => selectUser(user)}
                        >
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {data.user_id && (
                  <p className="mt-1 text-sm text-gray-600">
                    Mã giảm giá sẽ chỉ áp dụng cho khách hàng đã chọn
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Ghi chú</h3>
          <p className="text-sm text-gray-600 mb-2">
            - Nếu chọn loại giảm giá phần trăm, giá trị giảm tối đa sẽ được áp dụng khi tính toán.
          </p>
          <p className="text-sm text-gray-600 mb-2">
            - Mã giảm giá chỉ áp dụng cho đơn hàng có giá trị lớn hơn hoặc bằng giá trị đơn hàng tối thiểu.
          </p>
          <p className="text-sm text-gray-600 mb-2">
            - Mã giảm giá phí vận chuyển chỉ áp dụng cho phần phí ship, tối đa bằng giá trị phí ship của đơn hàng.
          </p>
          <p className="text-sm text-gray-600">
            - Mã giảm giá có thể áp dụng cho tất cả khách hàng, khách hàng mới, hoặc một khách hàng cụ thể.
          </p>
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Hủy
        </button>
        <button
          type="submit"
          disabled={processing || loading}
          className="px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {processing || loading ? 'Đang xử lý...' : isEditing ? 'Cập nhật' : 'Thêm mới'}
        </button>
      </div>
    </form>
  );
};

export default VoucherForm;