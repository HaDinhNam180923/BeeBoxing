import React from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import AdminSidebar from '@/Layouts/AdminSidebar';
import { Head } from '@inertiajs/react';
import OrderList from './Components/OrderList';

const Index = () => {
  return (
    <>
      <Head title="Quản lý đơn hàng" />
      
      <AdminLayout
        header={
          <h2 className="font-semibold text-xl text-gray-800 leading-tight">
            Quản lý đơn hàng
          </h2>
        }
      >
        <AdminSidebar>
          <OrderList />
        </AdminSidebar>
      </AdminLayout>
    </>
  );
};

export default Index;