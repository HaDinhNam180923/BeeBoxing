import React from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import AdminSidebar from '@/Layouts/AdminSidebar';
import { Head } from '@inertiajs/react';
import CreateProductForm from './Components/CreateProductForm';

const Create = () => {
  return (
    <>
      <Head title="Thêm sản phẩm mới" />
      
      <AdminLayout
        header={
          <h2 className="font-semibold text-xl text-gray-800 leading-tight">
            Thêm sản phẩm mới
          </h2>
        }
      >
        <AdminSidebar>
          <CreateProductForm /> 
        </AdminSidebar>
        
      </AdminLayout>
    </>
  );
};

export default Create;