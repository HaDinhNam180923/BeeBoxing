import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import AdminSidebar from '@/Layouts/AdminSidebar';

// Cấu hình Axios để gửi cookie phiên
axios.defaults.withCredentials = true;

const Collections = () => {
    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        search: '',
        status: '',
    });

    useEffect(() => {
        fetchCollections();
    }, [filters]);

    const fetchCollections = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/admin/collections', {
                params: filters,
                withCredentials: true,
            });
            setCollections(response.data.data || []);
        } catch (error) {
            console.error('Error fetching collections:', error.response?.data || error.message);
            toast.error(error.response?.data?.message || 'Không thể tải danh sách bộ sưu tập');
            setCollections([]);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const toggleStatus = async (id) => {
        try {
            const response = await axios.patch(`/api/admin/collections/${id}/toggle-status`);
            toast.success(response.data.message);
            fetchCollections();
        } catch (error) {
            console.error('Error toggling status:', error.response?.data || error.message);
            toast.error(error.response?.data?.message || 'Không thể cập nhật trạng thái');
        }
    };

    const deleteCollection = async (id) => {
        if (!confirm('Bạn có chắc muốn xóa bộ sưu tập này?')) return;
        try {
            const response = await axios.delete(`/api/admin/collections/${id}`);
            toast.success(response.data.message);
            fetchCollections();
        } catch (error) {
            console.error('Error deleting collection:', error.response?.data || error.message);
            toast.error(error.response?.data?.message || 'Không thể xóa bộ sưu tập');
        }
    };

    return (
        <div className="py-6">
            <Head title="Quản lý bộ sưu tập" />
            <AdminLayout
                header={
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Quản lý bộ sưu tập
                    </h2>
                }
            >
                <AdminSidebar>
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-semibold text-gray-900">Danh sách bộ sưu tập</h1>
                        <Link
                            href="/admin/collections/create"
                            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                        >
                            Thêm bộ sưu tập
                        </Link>
                    </div>

                    {/* Filters */}
                    <div className="mb-6 flex flex-wrap gap-4">
                        <div className="flex-1 min-w-[200px]">
                            <label htmlFor="search" className="block text-sm font-medium text-gray-700">
                                Tìm kiếm
                            </label>
                            <input
                                id="search"
                                type="text"
                                value={filters.search}
                                onChange={(e) => handleFilterChange('search', e.target.value)}
                                placeholder="Nhập tên bộ sưu tập..."
                                className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                            />
                        </div>
                        <div className="flex-1 min-w-[200px]">
                            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                                Trạng thái
                            </label>
                            <select
                                id="status"
                                value={filters.status}
                                onChange={(e) => handleFilterChange('status', e.target.value)}
                                className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                            >
                                <option value="">Tất cả</option>
                                <option value="true">Hoạt động</option>
                                <option value="false">Không hoạt động</option>
                            </select>
                        </div>
                    </div>

                    {/* Collections Table */}
                    {loading ? (
                        <div className="flex justify-center">
                            <div className="loader">Đang tải...</div>
                        </div>
                    ) : (
                        <div className="bg-white p-4 rounded-lg shadow">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Danh sách bộ sưu tập</h3>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Tên
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Slug
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Trạng thái
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Số sản phẩm
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Hành động
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {collections.length > 0 ? (
                                            collections.map((collection) => (
                                                <tr key={collection.collection_id}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {collection.name}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {collection.slug}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
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
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {collection.products_count || 0}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                        <Link
                                                            href={`/admin/collections/${collection.collection_id}/edit`}
                                                            className="text-indigo-600 hover:text-indigo-900 mr-4"
                                                        >
                                                            Sửa
                                                        </Link>
                                                        <button
                                                            onClick={() => toggleStatus(collection.collection_id)}
                                                            className="text-yellow-600 hover:text-yellow-900 mr-4"
                                                        >
                                                            {collection.is_active ? 'Tắt' : 'Bật'}
                                                        </button>
                                                        <button
                                                            onClick={() => deleteCollection(collection.collection_id)}
                                                            className="text-red-600 hover:text-red-900"
                                                        >
                                                            Xóa
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan="5"
                                                    className="px-6 py-4 text-center text-sm text-gray-500"
                                                >
                                                    Không có dữ liệu
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </AdminSidebar>
            </AdminLayout>
        </div>
    );
};

export default Collections;