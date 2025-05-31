import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ProductManager = ({ collectionId, onSave }) => {
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (collectionId) {
      fetchCollectionProducts();
    }
  }, [collectionId]);

  useEffect(() => {
    fetchProducts();
  }, [search, page]);

  const fetchCollectionProducts = async () => {
    try {
      const response = await axios.get(`/admin/collections/${collectionId}`);
      
      if (response.data.status) {
        const collectionProducts = response.data.data.products || [];
        setSelectedProducts(collectionProducts.map(product => ({
          product_id: product.product_id,
          name: product.name,
          image: product.colors[0]?.images[0]?.image_url || null,
          display_order: product.pivot?.display_order || 0
        })));
      }
    } catch (error) {
      console.error('Lỗi khi lấy sản phẩm của bộ sưu tập:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/admin/collections/products/selection', {
        params: {
          search,
          page
        }
      });
      
      if (response.data.status) {
        const newProducts = response.data.data.data;
        setProducts(prevProducts => 
          page === 1 ? newProducts : [...prevProducts, ...newProducts]
        );
        
        setHasMore(response.data.data.current_page < response.data.data.last_page);
      }
    } catch (error) {
      console.error('Lỗi khi lấy danh sách sản phẩm:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    setPage(prevPage => prevPage + 1);
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleProductSelect = (product) => {
    const isSelected = selectedProducts.find(p => p.product_id === product.product_id);
    
    if (isSelected) {
      setSelectedProducts(prevSelected => 
        prevSelected.filter(p => p.product_id !== product.product_id)
      );
    } else {
      setSelectedProducts(prevSelected => [
        ...prevSelected,
        {
          product_id: product.product_id,
          name: product.name,
          image: product.colors[0]?.images[0]?.image_url || null,
          display_order: prevSelected.length
        }
      ]);
    }
  };

  const handleOrderChange = (productId, newOrder) => {
    setSelectedProducts(prevSelected => 
      prevSelected.map(p => 
        p.product_id === productId 
          ? { ...p, display_order: parseInt(newOrder) || 0 } 
          : p
      )
    );
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      const productData = selectedProducts.map(p => ({
        product_id: p.product_id,
        display_order: p.display_order
      }));
      
      await axios.post(`/admin/collections/${collectionId}/products`, {
        products: productData
      });
      
      if (onSave) onSave();
    } catch (error) {
      console.error('Lỗi khi lưu sản phẩm:', error);
      alert('Có lỗi xảy ra khi lưu sản phẩm');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-6">
      <h3 className="text-lg font-medium mb-4">Quản lý sản phẩm trong bộ sưu tập</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left column - Product selection */}
        <div>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Tìm sản phẩm..."
              value={search}
              onChange={handleSearchChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="bg-gray-50 rounded-lg border p-4 h-96 overflow-y-auto">
            {loading && products.length === 0 ? (
              <div className="animate-pulse space-y-4">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="flex items-center space-x-4">
                    <div className="h-12 w-12 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Không tìm thấy sản phẩm nào
              </div>
            ) : (
              <>
                <ul className="space-y-2">
                  {products.map(product => {
                    const isSelected = selectedProducts.some(p => p.product_id === product.product_id);
                    
                    return (
                      <li 
                        key={product.product_id}
                        className={`flex items-center p-2 rounded-lg cursor-pointer hover:bg-gray-100 ${
                          isSelected ? 'bg-blue-50' : ''
                        }`}
                        onClick={() => handleProductSelect(product)}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-3"
                        />
                        
                        <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 mr-3">
                          <img
                            src={product.colors[0]?.images[0]?.image_url || '/storage/images/product-placeholder.jpg'}
                            alt={product.name}
                            className="h-full w-full object-cover object-center"
                          />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {product.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {product.base_price.toLocaleString('vi-VN')}đ
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
                
                {hasMore && (
                  <div className="mt-4 text-center">
                    <button
                      onClick={loadMore}
                      disabled={loading}
                      className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      {loading ? 'Đang tải...' : 'Tải thêm'}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        
        {/* Right column - Selected products */}
        <div>
          <h4 className="font-medium mb-3">Sản phẩm đã chọn ({selectedProducts.length})</h4>
          
          <div className="bg-gray-50 rounded-lg border p-4 h-96 overflow-y-auto">
            {selectedProducts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Chưa có sản phẩm nào được chọn
              </div>
            ) : (
              <ul className="space-y-3">
                {[...selectedProducts]
                  .sort((a, b) => a.display_order - b.display_order)
                  .map(product => (
                    <li 
                      key={product.product_id}
                      className="flex items-center p-2 rounded-lg bg-white border"
                    >
                      <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 mr-3">
                        <img
                          src={product.image || '/storage/images/product-placeholder.jpg'}
                          alt={product.name}
                          className="h-full w-full object-cover object-center"
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0 mr-3">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {product.name}
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <label className="text-xs text-gray-500">Thứ tự:</label>
                        <input
                          type="number"
                          min="0"
                          value={product.display_order}
                          onChange={(e) => handleOrderChange(product.product_id, e.target.value)}
                          className="w-16 p-1 text-sm border rounded"
                        />
                        
                        <button
                          onClick={() => handleProductSelect(product)}
                          className="text-red-600 hover:text-red-800"
                        >
                          ×
                        </button>
                      </div>
                    </li>
                  ))}
              </ul>
            )}
          </div>
          
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
            >
              {saving && (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductManager;