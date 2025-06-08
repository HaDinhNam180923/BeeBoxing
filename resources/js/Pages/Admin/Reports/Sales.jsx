import React from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import AdminSidebar from '@/Layouts/AdminSidebar';
import { Head } from '@inertiajs/react';
import SalesReport from './SalesReport';

const Sales = () => {
  return (
    <>
      <Head title="Thống kê doanh số" />
      
      <AdminLayout
        header={
          <h2 className="font-semibold text-xl text-gray-800 leading-tight">
            Thống kê doanh số
          </h2>
        }
      >
        <AdminSidebar>
          <SalesReport />
        </AdminSidebar>
      </AdminLayout>
    </>
  );
};

export default Sales;