import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const CategoryForm = ({ category, isEditing = false }) => {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);

  const [formData, setFormData] = useState({
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

  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/categories');
      if (response.data.status === 'success') {
        setCategories(response.data.data);
        if (isEditing && category?.parent_category_id) {
          restoreParentCategories(category.parent_category_id);
        }
      }
    } catch (error) {
      console.error('Không thể lấy danh sách danh mục:', error);
      toast.error('Không thể tải danh sách danh mục');
    }
  };

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

  const handleCategoryChange = (level, value) => {
    const newSelectedCategories = [...selectedCategories.slice(0, level)];
    newSelectedCategories[level] = parseInt(value);
    setSelectedCategories(newSelectedCategories);

    let currentCategories = categories;
    let finalCategory = null;

    for (let categoryId of newSelectedCategories) {
      finalCategory = findCategoryById(currentCategories, categoryId);
      if (finalCategory && finalCategory.children) {
        currentCategories = finalCategory.children;
      }
    }

    setFormData({ ...formData, parent_category_id: finalCategory ? finalCategory.id : '' });
  };

  const renderCategorySelects = () => {
    const selects = [];
    let currentCategories = categories;

    selects.push(
      <div key="root" className="mb-4">
        <label htmlFor="root_category" className="block text-sm font-medium text-gray-700 mb-2">
          Danh mục gốc
        </label>
        <select
          id="root_category"
          value={selectedCategories[0] || ''}
          onChange={(e) => handleCategoryChange(0, e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          <option value="">Chọn danh mục gốc</option>
          {currentCategories.map(cat => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>
    );

    for (let i = 0; i < selectedCategories.length; i++) {
      const parentId = selectedCategories[i];
      const parentCategory = findCategoryById(currentCategories, parentId);

      if (parentCategory && parentCategory.children && parentCategory.children.length > 0) {
        currentCategories = parentCategory.children;

        selects.push(
          <div key={`level-${i + 1}`} className="mb-4">
            <label htmlFor={`sub_category_${i + 1}`} className="block text-sm font-medium text-gray-700 mb-2">
              Danh mục con cấp {i + 2}
            </label>
            <select
              id={`sub_category_${i + 1}`}
              value={selectedCategories[i + 1] || ''}
              onChange={(e) => handleCategoryChange(i + 1, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked });
    } else if (type === 'file') {
      setFormData({ ...formData, image: files[0] });
      if (files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
          document.getElementById('image-preview').src = e.target.result;
          document.getElementById('image-preview').style.display = 'block';
        };
        reader.readAsDataURL(files[0]);
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'is_active') {
          submitData.append(key, formData[key] ? '1' : '0');
        } else if (key === 'image' && formData[key]) {
          submitData.append(key, formData[key]);
        } else if (key !== 'image_url') {
          submitData.append(key, formData[key] || '');
        }
      });

      let response;
      if (isEditing) {
        response = await axios.post(`/api/admin/categories/${category.category_id}`, submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        response = await axios.post('/api/admin/categories', submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      toast.success(isEditing ? 'Cập nhật danh mục thành công' : 'Thêm danh mục thành công');
      if (!isEditing) {
        setFormData({
          name: '',
          description: '',
          parent_category_id: '',
          display_order: 0,
          is_active: true,
          meta_title: '',
          meta_description: '',
          image: null,
          image_url: ''
        });
        setSelectedCategories([]);
      }
    } catch (error) {
      console.error('Error:', error);
      if (error.response && error.response.data.errors) {
        setErrors(error.response.data.errors);
        Object.values(error.response.data.errors).forEach(err => toast.error(err[0]));
      } else {
        toast.error('Đã xảy ra lỗi, vui lòng thử lại');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-8">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">
        {isEditing ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="border-b border-gray-200 pb-6">
          <h3 className="text-lg font-medium text-gray-700 mb-4">Thông tin cơ bản</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Tên danh mục <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Nhập tên danh mục"
                required
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>
            <div>
              <label htmlFor="display_order" className="block text-sm font-medium text-gray-700 mb-2">
                Thứ tự hiển thị
              </label>
              <input
                id="display_order"
                name="display_order"
                type="number"
                min="0"
                value={formData.display_order}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Nhập số thứ tự"
              />
              {errors.display_order && <p className="mt-1 text-sm text-red-600">{errors.display_order}</p>}
            </div>
          </div>
          <div className="mt-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Mô tả danh mục
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Nhập mô tả cho danh mục"
            />
            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
          </div>
          <div className="mt-4 flex items-center">
            <input
              id="is_active"
              name="is_active"
              type="checkbox"
              checked={formData.is_active}
              onChange={handleInputChange}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="is_active" className="ml-2 text-sm font-medium text-gray-700">
              Kích hoạt danh mục
            </label>
          </div>
          {errors.is_active && <p className="mt-1 text-sm text-red-600">{errors.is_active}</p>}
        </div>

        <div className="border-b border-gray-200 pb-6">
          <h3 className="text-lg font-medium text-gray-700 mb-4">Danh mục cha</h3>
          {renderCategorySelects()}
          {errors.parent_category_id && <p className="mt-1 text-sm text-red-600">{errors.parent_category_id}</p>}
        </div>

        <div className="border-b border-gray-200 pb-6">
          <h3 className="text-lg font-medium text-gray-700 mb-4">Hình ảnh danh mục</h3>
          <div>
            <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
              Chọn hình ảnh
            </label>
            <input
              id="image"
              name="image"
              type="file"
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              accept="image/*"
            />
            {errors.image && <p className="mt-1 text-sm text-red-600">{errors.image}</p>}
            <div className="mt-4">
              <img
                id="image-preview"
                src={formData.image_url}
                alt="Xem trước hình ảnh"
                className="max-h-40 rounded-md"
                style={{ display: formData.image_url ? 'block' : 'none' }}
              />
            </div>
          </div>
        </div>

        <div className="pb-6">
          <h3 className="text-lg font-medium text-gray-700 mb-4">Tối ưu hóa SEO</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="meta_title" className="block text-sm font-medium text-gray-700 mb-2">
                Tiêu đề SEO
              </label>
              <input
                id="meta_title"
                name="meta_title"
                type="text"
                value={formData.meta_title}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Nhập tiêu đề SEO"
              />
              {errors.meta_title && <p className="mt-1 text-sm text-red-600">{errors.meta_title}</p>}
            </div>
            <div>
              <label htmlFor="meta_description" className="block text-sm font-medium text-gray-700 mb-2">
                Mô tả SEO
              </label>
              <textarea
                id="meta_description"
                name="meta_description"
                value={formData.meta_description}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Nhập mô tả SEO"
              />
              {errors.meta_description && <p className="mt-1 text-sm text-red-600">{errors.meta_description}</p>}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            disabled={loading}
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Đang xử lý...' : isEditing ? 'Cập nhật danh mục' : 'Thêm danh mục'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CategoryForm;