import React from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import AdminSidebar from '@/Layouts/AdminSidebar';
import { Head } from '@inertiajs/react';
import ProductList from './Components/ProductList';

const Index = () => {
  return (
    <>
      <Head title="Danh sách sản phẩm" />
      
      <AdminLayout
        header={
          <h2 className="font-semibold text-xl text-gray-800 leading-tight">
            Danh sách sản phẩm
          </h2>
        }
      >
        <AdminSidebar>
          <ProductList />
        </AdminSidebar>
      </AdminLayout>
    </>
  );
};

export default Index;