import React, { useState, useEffect } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import AdminSidebar from '@/Layouts/AdminSidebar';
import { Head } from '@inertiajs/react';
import CategoryForm from './Components/CategoryForm';
import axios from 'axios';
import { toast } from 'react-toastify';

const Edit = ({ categoryId }) => {
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const response = await axios.get(`/api/admin/categories/${categoryId}`);
        setCategory(response.data.data);
      } catch (error) {
        console.error('Lỗi khi tải thông tin danh mục:', error);
        toast.error('Không thể tải thông tin danh mục');
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
  }, [categoryId]);

  return (
    <>
      <Head title="Chỉnh sửa danh mục" />
      
      <AdminLayout
        header={
          <h2 className="font-semibold text-xl text-gray-800 leading-tight">
            Chỉnh sửa danh mục
          </h2>
        }
      >
        <AdminSidebar>
          {loading ? (
            <div className="flex justify-center p-6">
              <div className="loader">Đang tải...</div>
            </div>
          ) : category ? (
            <CategoryForm category={category} isEditing={true} />
          ) : (
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-red-500">Không tìm thấy danh mục</p>
            </div>
          )}
        </AdminSidebar>
      </AdminLayout>
    </>
  );
};

export default Edit;