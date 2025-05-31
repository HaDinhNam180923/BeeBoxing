import React from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import AdminSidebar from '@/Layouts/AdminSidebar';
import { Head } from '@inertiajs/react';
import CategoryForm from './Components/CategoryForm';

const Create = () => {
  return (
    <>
      <Head title="Thêm danh mục mới" />
      
      <AdminLayout
        header={
          <h2 className="font-semibold text-xl text-gray-800 leading-tight">
            Thêm danh mục mới
          </h2>
        }
      >
        <AdminSidebar>
          <CategoryForm />
        </AdminSidebar>
      </AdminLayout>
    </>
  );
};

export default Create;