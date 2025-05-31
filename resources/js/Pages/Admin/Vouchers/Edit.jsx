import React, { useState, useEffect } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import AdminSidebar from '@/Layouts/AdminSidebar';
import { Head } from '@inertiajs/react';
import VoucherForm from './Components/VoucherForm';
import axios from 'axios';
import { toast } from 'react-toastify';

const Edit = ({ voucherId }) => {
  const [voucher, setVoucher] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVoucher = async () => {
      try {
        const response = await axios.get(`/api/admin/vouchers/${voucherId}`);
        setVoucher(response.data.data);
      } catch (error) {
        console.error('Lỗi khi tải thông tin mã giảm giá:', error);
        toast.error('Không thể tải thông tin mã giảm giá');
      } finally {
        setLoading(false);
      }
    };

    fetchVoucher();
  }, [voucherId]);

  return (
    <>
      <Head title="Chỉnh sửa mã giảm giá" />
      
      <AdminLayout
        header={
          <h2 className="font-semibold text-xl text-gray-800 leading-tight">
            Chỉnh sửa mã giảm giá
          </h2>
        }
      >
        <AdminSidebar>
          {loading ? (
            <div className="flex justify-center p-6">
              <div className="loader">Đang tải...</div>
            </div>
          ) : voucher ? (
            <VoucherForm voucher={voucher} isEditing={true} />
          ) : (
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-red-500">Không tìm thấy mã giảm giá</p>
            </div>
          )}
        </AdminSidebar>
      </AdminLayout>
    </>
  );
};

export default Edit;