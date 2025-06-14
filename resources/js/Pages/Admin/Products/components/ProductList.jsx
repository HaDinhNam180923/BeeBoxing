import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from '@inertiajs/react';
import { Table } from '@/Components/common/Table';
import Button from '@/Components/common/Button'; 
import Modal from '@/Components/common/Modal';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState(''); // Thêm state cho tìm kiếm

  const fetchProducts = async (page = 1, search = '') => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/products`, {
        params: {
          page,
          search // Truyền tham số search
        }
      });
      if (response.data.status === 'success') {
        setProducts(response.data.data.products);
        setPagination(response.data.data.pagination);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(1, searchQuery);
  }, []);

  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await axios.delete(`/api/product/delete/${productToDelete.product_id}`);
      if (response.data.status === 'success') {
        await fetchProducts(pagination.current_page, searchQuery); // Giữ searchQuery khi làm mới
        setDeleteDialogOpen(false);
        setProductToDelete(null);
      }
    } catch (error) {
      console.error('Failed to delete product:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts(1, searchQuery); // Gọi API với từ khóa tìm kiếm
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch(e);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Danh sách sản phẩm</h1>
        <Link href={route('admin.products.create')}>
          <Button>Thêm sản phẩm mới</Button>
        </Link>
      </div>

      {/* Thanh tìm kiếm */}
      <div className="mb-6">
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-2 top-2.5 h-5 w-5 text-gray-500" />
            <Input
              type="text"
              placeholder="Tìm kiếm sản phẩm theo tên..."
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyPress={handleKeyPress}
              className="pl-10 w-full"
            />
          </div>
          <Button type="submit">Tìm kiếm</Button>
        </form>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p>Đang tải...</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow">
          <Table>
            <Table.Head>
              <Table.Row>
                <Table.HeaderCell>Hình ảnh</Table.HeaderCell>
                <Table.HeaderCell>Tên sản phẩm</Table.HeaderCell>
                <Table.HeaderCell>Giá</Table.HeaderCell>
                <Table.HeaderCell>Danh mục</Table.HeaderCell>
                <Table.HeaderCell>Tồn kho</Table.HeaderCell>
                <Table.HeaderCell className="text-center">Thao tác</Table.HeaderCell>
              </Table.Row>
            </Table.Head>
            <Table.Body>
              {products.length === 0 ? (
                <Table.Row>
                  <Table.Cell colSpan={6} className="text-center">
                    Không tìm thấy sản phẩm
                  </Table.Cell>
                </Table.Row>
              ) : (
                products.map((product) => (
                  <Table.Row key={product.product_id}>
                    <Table.Cell>
                      {product.colors[0]?.primary_image ? (
                        <img
                          src={product.colors[0].primary_image.image_url}
                          alt={product.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                          No image
                        </div>
                      )}
                    </Table.Cell>
                    <Table.Cell>{product.name}</Table.Cell>
                    <Table.Cell>
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND'
                      }).format(product.base_price)}
                    </Table.Cell>
                    <Table.Cell>{product.category?.name}</Table.Cell>
                    <Table.Cell>{product.total_stock}</Table.Cell>
                    <Table.Cell>
                      <div className="flex justify-center space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            window.location.href = `/admin/products/${product.product_id}/edit`;
                          }}
                        >
                          Sửa
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleDeleteClick(product)}
                        >
                          Xóa
                        </Button>
                      </div>
                    </Table.Cell>
                  </Table.Row>
                ))
              )}
            </Table.Body>
          </Table>

          {/* Phân trang */}
          {pagination.last_page > 1 && (
            <div className="flex justify-center p-4 flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.current_page === 1}
                onClick={() => fetchProducts(pagination.current_page - 1, searchQuery)}
              >
                ←
              </Button>

              {Array.from({ length: pagination.last_page }, (_, i) => i + 1)
                .filter((page) => {
                  const current = pagination.current_page;
                  return (
                    page === 1 || 
                    page === pagination.last_page || 
                    (page >= current - 2 && page <= current + 2)
                  );
                })
                .map((page, idx, arr) => (
                  <React.Fragment key={page}>
                    {idx > 0 && page - arr[idx - 1] > 1 && (
                      <span className="px-2 text-gray-400">...</span>
                    )}
                    <Button
                      variant={page === pagination.current_page ? "default" : "outline"}
                      size="sm"
                      onClick={() => fetchProducts(page, searchQuery)}
                    >
                      {page}
                    </Button>
                  </React.Fragment>
                ))}

              <Button
                variant="outline"
                size="sm"
                disabled={pagination.current_page === pagination.last_page}
                onClick={() => fetchProducts(pagination.current_page + 1, searchQuery)}
              >
                →
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Dialog xóa sản phẩm */}
      <Modal open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <Modal.Header>
          <Modal.Title>Xác nhận xóa sản phẩm</Modal.Title>
          <Modal.Description>
            Bạn có chắc chắn muốn xóa sản phẩm "{productToDelete?.name}"? 
            Hành động này không thể hoàn tác.
          </Modal.Description>
        </Modal.Header>
        <Modal.Footer>
          <Button 
            variant="outline" 
            onClick={() => setDeleteDialogOpen(false)}
          >
            Hủy
          </Button>
          <Button 
            variant="destructive"
            onClick={handleDeleteConfirm}
          >
            Xác nhận xóa
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}