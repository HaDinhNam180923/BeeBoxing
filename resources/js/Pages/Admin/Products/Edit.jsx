import React from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import AdminSidebar from '@/Layouts/AdminSidebar';
import { Head } from '@inertiajs/react';
import UpdateProduct from './Components/UpdateProduct';

const Edit = ({ productId }) => {
  return (
    <>
      <Head title="Cập nhật sản phẩm" />
      
      <AdminLayout
        header={
          <h2 className="font-semibold text-xl text-gray-800 leading-tight">
            Cập nhật sản phẩm
          </h2>
        }
      >
        <AdminSidebar>
          <UpdateProduct 
            productId={productId} 
            onSuccess={() => window.location.href = '/admin/products'}
          />
        </AdminSidebar>
      </AdminLayout>
    </>
  );
};

export default Edit;