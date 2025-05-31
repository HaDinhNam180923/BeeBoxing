import React, { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import axios from 'axios';
import { toast } from 'react-toastify';

const CategoryForm = ({ category, isEditing = false }) => {
  // State để lưu toàn bộ danh mục
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  
  // State để lưu các cấp danh mục được chọn
  const [selectedCategories, setSelectedCategories] = useState([]);

  const { data, setData, post, put, processing, errors, reset } = useForm({
    name: category?.name || '',
    description: category?.description || '',
    parent_category_id: category?.parent_category_id || '',
    display_order: category?.display_order || 0,
    is_active: category?.is_active ?? true,
    meta_title: category?.meta_title || '',
    meta_description: category?.meta_description || '',
    image: null,
    image_url: category?.image_url || ''
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/categories');
      
      if (response.data.status === 'success') {
        setCategories(response.data.data);
        
        // Nếu đang chỉnh sửa, khôi phục cấp danh mục
        if (isEditing && category.parent_category_id) {
          restoreParentCategories(category.parent_category_id);
        }
      }
    } catch (error) {
      console.error('Không thể lấy danh sách danh mục:', error);
      toast.error('Không thể tải danh mục');
    }
  };

  // Khôi phục các cấp danh mục cha khi chỉnh sửa
  const restoreParentCategories = (parentId) => {
    const path = [];
    let currentCategories = categories;
    let currentParentId = parentId;

    while (currentParentId) {
      const parentCategory = findCategoryById(currentCategories, currentParentId);
      if (!parentCategory) break;

      path.unshift(parentCategory.id);
      currentCategories = parentCategory.children || [];
      currentParentId = parentCategory.parent_category_id;
    }

    setSelectedCategories(path);
  };

  // Tìm danh mục theo ID
  const findCategoryById = (categoryList, id) => {
    for (let category of categoryList) {
      if (category.id === id) return category;
      if (category.children) {
        const found = findCategoryById(category.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  // Xử lý thay đổi danh mục
  const handleCategoryChange = (level, value) => {
    const newSelectedCategories = [...selectedCategories.slice(0, level)];
    newSelectedCategories[level] = parseInt(value);

    setSelectedCategories(newSelectedCategories);

    // Tìm danh mục cuối cùng được chọn
    let currentCategories = categories;
    let finalCategory = null;

    for (let categoryId of newSelectedCategories) {
      finalCategory = findCategoryById(currentCategories, categoryId);
      if (finalCategory && finalCategory.children) {
        currentCategories = finalCategory.children;
      }
    }

    // Nếu không còn danh mục con, sử dụng ID của danh mục cuối
    setData('parent_category_id', finalCategory ? finalCategory.id : '');
  };

  // Render các dropdown chọn danh mục
  const renderCategorySelects = () => {
    const selects = [];
    let currentCategories = categories;

    // Dropdown danh mục gốc
    selects.push(
      <div key="root" className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Danh mục gốc
        </label>
        <select
          value={selectedCategories[0] || ''}
          onChange={(e) => handleCategoryChange(0, e.target.value)}
          className="w-full border-gray-300 rounded-md"
        >
          <option value="">Chọn danh mục</option>
          {currentCategories.map(cat => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>
    );

    // Render các dropdown con
    for (let i = 0; i < selectedCategories.length; i++) {
      const parentId = selectedCategories[i];
      const parentCategory = findCategoryById(currentCategories, parentId);

      if (parentCategory && parentCategory.children && parentCategory.children.length > 0) {
        currentCategories = parentCategory.children;

        selects.push(
          <div key={`level-${i + 1}`} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Danh mục con cấp {i + 2}
            </label>
            <select
              value={selectedCategories[i + 1] || ''}
              onChange={(e) => handleCategoryChange(i + 1, e.target.value)}
              className="w-full border-gray-300 rounded-md"
            >
              <option value="">Chọn danh mục con</option>
              {currentCategories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        );
      }
    }

    return selects;
  };

  // Helper function to check if a category is a child of another
  const isChildCategory = (category, parentId) => {
    if (!category.children || category.children.length === 0) return false;
    
    return category.children.some(child => 
      child.id === parentId || isChildCategory(child, parentId)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Log toàn bộ dữ liệu trước khi gửi
      console.log('Form Data:', {
        ...data,
        is_active: typeof data.is_active,
        image: data.image ? 'File selected' : 'No file'
      });
  
      const formData = new FormData();
      
      // Thêm log chi tiết cho từng trường
      Object.keys(data).forEach(key => {
        console.log(`Adding ${key}:`, data[key]);
        
        if (key === 'is_active') {
          // Chắc chắn gửi boolean dưới dạng chuỗi
          formData.append(key, data[key] ? '1' : '0');
        } else if (key === 'image' && data[key]) {
          formData.append(key, data[key]);
        } else if (key !== 'image') {
          formData.append(key, data[key]);
        }
      });
  
      // Log FormData
      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }
  
      const response = await axios.post('/api/admin/categories', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data' 
        }
      });
  
      toast.success('Thêm danh mục thành công');
      reset();
    } catch (error) {
      // Log lỗi chi tiết
      console.error('Full Error:', error);
      
      if (error.response) {
        // Lỗi từ phía server
        console.error('Server Error:', error.response.data);
        
        // Hiển thị lỗi chi tiết
        if (error.response.data.errors) {
          Object.keys(error.response.data.errors).forEach(key => {
            toast.error(`${key}: ${error.response.data.errors[key][0]}`);
          });
        } else {
          toast.error('Có lỗi xảy ra khi lưu danh mục');
        }
      } else {
        // Lỗi không phải từ server
        toast.error('Không thể kết nối đến máy chủ');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setData('image', file);
      
      // Preview image
      const reader = new FileReader();
      reader.onload = (e) => {
        document.getElementById('image-preview').src = e.target.result;
        document.getElementById('image-preview').style.display = 'block';
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white shadow px-6 py-8 rounded-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="col-span-1">
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Tên danh mục <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                type="text"
                value={data.name}
                onChange={(e) => setData('name', e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                required
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div className="mb-4">
                <label htmlFor="parent_category_id" className="block text-sm font-medium text-gray-700 mb-1">
                    Chọn danh mục
                </label>
                <div className="space-y-4">
                    {renderCategorySelects()}
                </div>
            </div>

            <div className="mb-4">
              <label htmlFor="display_order" className="block text-sm font-medium text-gray-700 mb-1">
                Thứ tự hiển thị
              </label>
              <input
                id="display_order"
                type="number"
                min="0"
                value={data.display_order}
                onChange={(e) => setData('display_order', e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
            </div>

            <div className="mb-4">
              <div className="flex items-center">
                <input
                  id="is_active"
                  type="checkbox"
                  checked={data.is_active}
                  onChange={(e) => setData('is_active', e.target.checked)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="is_active" className="ml-2 block text-sm font-medium text-gray-700">
                  Kích hoạt
                </label>
              </div>
            </div>
          </div>

          <div className="col-span-1">
            <div className="mb-4">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Mô tả
              </label>
              <textarea
                id="description"
                value={data.description}
                onChange={(e) => setData('description', e.target.value)}
                rows="4"
                className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              ></textarea>
            </div>

            <div className="mb-4">
              <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
                Hình ảnh
              </label>
              <input
                id="image"
                type="file"
                onChange={handleImageChange}
                className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                accept="image/*"
              />
              <div className="mt-2">
                <img 
                  id="image-preview" 
                  src={data.image_url || ''} 
                  alt="Category preview" 
                  className="max-h-32 rounded-md" 
                  style={{ display: data.image_url ? 'block' : 'none' }} 
                />
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-2 mt-6">
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">SEO Thông tin</h3>
            
            <div className="mb-4">
              <label htmlFor="meta_title" className="block text-sm font-medium text-gray-700 mb-1">
                Meta Title
              </label>
              <input
                id="meta_title"
                type="text"
                value={data.meta_title}
                onChange={(e) => setData('meta_title', e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="meta_description" className="block text-sm font-medium text-gray-700 mb-1">
                Meta Description
              </label>
              <textarea
                id="meta_description"
                value={data.meta_description}
                onChange={(e) => setData('meta_description', e.target.value)}
                rows="3"
                className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              ></textarea>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Hủy
        </button>
        <button
          type="submit"
          disabled={processing || loading}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {processing || loading ? 'Đang xử lý...' : isEditing ? 'Cập nhật' : 'Thêm mới'}
        </button>
      </div>
    </form>
  );
};

export default CategoryForm;