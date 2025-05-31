import React from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import AdminSidebar from '@/Layouts/AdminSidebar';
import { Head } from '@inertiajs/react';
import VoucherForm from './Components/VoucherForm';

const Create = () => {
  return (
    <>
      <Head title="Thêm mã giảm giá mới" />
      
      <AdminLayout
        header={
          <h2 className="font-semibold text-xl text-gray-800 leading-tight">
            Thêm mã giảm giá mới
          </h2>
        }
      >
        <AdminSidebar>
          <VoucherForm />
        </AdminSidebar>
      </AdminLayout>
    </>
  );
};

export default Create;