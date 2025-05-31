import React, { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import axios from 'axios';
import AdminLayout from '@/Layouts/AdminLayout';
import AdminSidebar from '@/Layouts/AdminSidebar';
const CollectionsIndex = () => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchCollections();
  }, [searchTerm, statusFilter]);

  const fetchCollections = async () => {
    try {
      setLoading(true);
      const params = {};
      
      if (searchTerm) {
        params.search = searchTerm;
      }
      
      if (statusFilter !== 'all') {
        params.status = statusFilter === 'active' ? true : false;
      }
      
      const response = await axios.get('/admin/collections', { params });
      
      if (response.data.status) {
        setCollections(response.data.data);
      }
    } catch (error) {
      console.error('Lỗi khi lấy danh sách bộ sưu tập:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const response = await axios.patch(`/admin/collections/${id}/toggle-status`);
      
      if (response.data.status) {
        // Cập nhật trạng thái trong state
        setCollections(prevCollections =>
          prevCollections.map(collection =>
            collection.collection_id === id
              ? { ...collection, is_active: !currentStatus }
              : collection
          )
        );
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật trạng thái:', error);
      alert('Có lỗi xảy ra khi cập nhật trạng thái');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc chắn muốn xóa bộ sưu tập này?')) return;
    
    try {
      const response = await axios.delete(`/admin/collections/${id}`);
      
      if (response.data.status) {
        // Xóa khỏi state
        setCollections(prevCollections =>
          prevCollections.filter(collection => collection.collection_id !== id)
        );
      }
    } catch (error) {
      console.error('Lỗi khi xóa bộ sưu tập:', error);
      alert('Có lỗi xảy ra khi xóa bộ sưu tập');
    }
  };

  return (
    
    <AdminLayout title="Quản lý bộ sưu tập">
        <AdminSidebar>
      <div className="container mx-auto py-6 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Quản lý bộ sưu tập</h1>
          
          <Link
            href={route('admin.collections.create')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Thêm bộ sưu tập mới
          </Link>
        </div>
        
        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:space-x-4">
            <div className="mb-4 md:mb-0 flex-1">
              <input
                type="text"
                placeholder="Tìm kiếm bộ sưu tập..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Hoạt động</option>
                <option value="inactive">Không hoạt động</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Collections list */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-4">
              <div className="animate-pulse space-y-4">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="h-12 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          ) : collections.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">Không tìm thấy bộ sưu tập nào</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hình ảnh
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tên bộ sưu tập
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Số sản phẩm
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thứ tự hiển thị
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {collections.map(collection => (
                  <tr key={collection.collection_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-12 w-16 rounded overflow-hidden">
                        <img
                          src={collection.image_url || '/storage/images/collection-placeholder.jpg'}
                          alt={collection.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{collection.name}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {collection.description || 'Không có mô tả'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {collection.products_count || 0} sản phẩm
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {collection.display_order}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          collection.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {collection.is_active ? 'Hoạt động' : 'Không hoạt động'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex space-x-2 justify-end">
                        <button
                          onClick={() => handleToggleStatus(collection.collection_id, collection.is_active)}
                          className={`px-3 py-1 rounded-md ${
                            collection.is_active
                              ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                        >
                          {collection.is_active ? 'Vô hiệu hóa' : 'Kích hoạt'}
                        </button>
                        
                        <Link
                          href={route('admin.collections.edit', collection.collection_id)}
                          className="bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1 rounded-md"
                        >
                          Sửa
                        </Link>
                        
                        <button
                          onClick={() => handleDelete(collection.collection_id)}
                          className="bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1 rounded-md"
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      </AdminSidebar>
    </AdminLayout>
  );
};

export default CollectionsIndex;