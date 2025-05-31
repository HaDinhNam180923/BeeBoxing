import React from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import AdminSidebar from '@/Layouts/AdminSidebar';
import { Head } from '@inertiajs/react';
import VoucherList from './Components/VoucherList';

const Index = () => {
  return (
    <>
      <Head title="Quản lý mã giảm giá" />
      
      <AdminLayout
        header={
          <h2 className="font-semibold text-xl text-gray-800 leading-tight">
            Quản lý mã giảm giá
          </h2>
        }
      >
        <AdminSidebar>
          <VoucherList />
        </AdminSidebar>
      </AdminLayout>
    </>
  );
};

export default Index;