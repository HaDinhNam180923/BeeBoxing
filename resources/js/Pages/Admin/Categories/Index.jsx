import React from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import AdminSidebar from '@/Layouts/AdminSidebar';
import { Head } from '@inertiajs/react';
import CategoryList from './Components/CategoryList';

const Index = () => {
  return (
    <>
      <Head title="Danh sách danh mục" />
      
      <AdminLayout
        header={
          <h2 className="font-semibold text-xl text-gray-800 leading-tight">
            Danh sách danh mục
          </h2>
        }
      >
        <AdminSidebar>
          <CategoryList />
        </AdminSidebar>
      </AdminLayout>
    </>
  );
};

export default Index;