import React, { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import axios from 'axios';
import ProductCard from '@/components/products/ProductCard';
import { Slider } from '@/components/InputSelectSlider';
import { Input } from '@/components/InputSelectSlider';
import { Select } from '@/components/InputSelectSlider';
import PriceRangeFilter from '@/components/PriceRangeFilter';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/Pagination";
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import GuestLayout from '@/Layouts/GuestLayout';
import { Popover } from '@headlessui/react';
import { ChevronDown, X } from 'lucide-react';

const ProductListing = ({ auth }) => {
  // Lấy category_id và color_name từ URL parameters
  const { url } = usePage();
  const urlParams = new URLSearchParams(window.location.search);
  const categoryId = urlParams.get('category_id');
  const initialPage = parseInt(urlParams.get('page')) || 1;
  const initialColor = urlParams.get('color_name') || '';

  // Select layout based on authentication status
  const Layout = auth.user ? AuthenticatedLayout : GuestLayout;

  // State for filters, pagination, colors, and color picker
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [colors, setColors] = useState([]);
  const [selectedColor, setSelectedColor] = useState(null); // Lưu màu đã chọn
  const [filters, setFilters] = useState({
    category_id: categoryId || '',
    brand: '',
    price_from: '',
    price_to: '',
    search: '',
    color_name: initialColor,
    sort_by: 'created_at',
    sort_direction: 'desc',
    per_page: 12,
    page: initialPage,
  });
  const [pagination, setPagination] = useState({
    current_page: initialPage,
    per_page: 12,
    total: 0,
    last_page: 1,
  });

  // Fetch colors on component mount
  useEffect(() => {
    const fetchColors = async () => {
      try {
        const response = await axios.get('/api/product-colors');
        if (response.data.status === 'success') {
          setColors(response.data.data);
          // Khởi tạo selectedColor nếu có initialColor
          if (initialColor) {
            const color = response.data.data.find(c => c.color_name === initialColor);
            setSelectedColor(color || null);
          }
        }
      } catch (error) {
        console.error('Error fetching colors:', error);
      }
    };

    fetchColors();
  }, []);

  // Fetch products when filters change
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        // Explicitly create query params
        const queryParams = new URLSearchParams();
        
        // Add each filter parameter
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== '' && value !== null && value !== undefined) {
            queryParams.set(key, value);
          }
        });
        
        // Log the URL for debugging
        console.log('Fetching products with URL:', `/api/products?${queryParams.toString()}`);
        
        const response = await axios.get(`/api/products?${queryParams.toString()}`);
        
        // Log the response for debugging
        console.log('API Response:', response.data);
        
        setProducts(response.data.data.products);
        setPagination(response.data.data.pagination);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [filters]);

  // Update URL when filters change
  useEffect(() => {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        queryParams.set(key, value);
      }
    });
    
    const newUrl = `${window.location.pathname}?${queryParams.toString()}`;
    window.history.pushState({}, '', newUrl);
  }, [filters]);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    if (key === 'page') {
      // For pagination, only update the page number
      setFilters(prev => ({
        ...prev,
        page: value
      }));
      console.log(`Changed page to: ${value}`);
    } else {
      // For other filters, reset to page 1
      setFilters(prev => ({
        ...prev,
        [key]: value,
        page: 1
      }));
    }
  };

  // Handle color selection
  const handleColorSelect = (color, close) => {
    setSelectedColor(color);
    handleFilterChange('color_name', color ? color.color_name : '');
    close(); // Đóng popover sau khi chọn màu
  };

  // Handle price range change
  const handlePriceRangeChange = (values) => {
    setFilters(prev => ({
      ...prev,
      price_from: values[0],
      price_to: values[1],
      page: 1, // Reset to page 1 when price changes
    }));
  };

  // Handle page change specifically
  const handlePageChange = (newPage) => {
    console.log(`Changing to page: ${newPage}`);
    setFilters(prev => ({
      ...prev,
      page: newPage
    }));
  };

  return (
    <Layout title="Product Listing">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters Section - All in one row */}
        <div className="mb-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
            {/* Search Input */}
            <div className="lg:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tìm kiếm sản phẩm
              </label>
              <Input
                type="text"
                placeholder="Nhập tên sản phẩm..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full"
              />
            </div>

            {/* Color Filter with Beautiful Color Palette */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Màu sắc
              </label>
              <Popover className="relative">
                {({ open, close }) => (
                  <>
                    <Popover.Button
                      className={`flex items-center justify-between w-full px-4 py-2.5 border rounded-lg bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                        open ? 'ring-2 ring-blue-500 border-blue-500' : 'border-gray-300'
                      }`}
                    >
                      <div className="flex items-center">
                        {selectedColor ? (
                          <>
                            <span
                              className="inline-block w-5 h-5 mr-2 rounded-full border-2 border-white shadow-sm"
                              style={{ backgroundColor: selectedColor.color_code }}
                            ></span>
                            <span className="text-sm font-medium">{selectedColor.color_name}</span>
                          </>
                        ) : (
                          <>
                            <div className="w-5 h-5 mr-2 rounded-full border-2 border-gray-300 bg-gradient-to-r from-red-200 via-blue-200 to-purple-200"></div>
                            <span className="text-sm text-gray-500">Chọn màu sắc</span>
                          </>
                        )}
                      </div>
                      <ChevronDown 
                        className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                          open ? 'transform rotate-180' : ''
                        }`} 
                      />
                    </Popover.Button>
                    
                    <Popover.Panel className="absolute z-20 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl p-4 w-80 max-h-96 overflow-y-auto">
                      <div className="space-y-4">
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                          <h3 className="text-sm font-semibold text-gray-900">Chọn màu sắc</h3>
                          {selectedColor && (
                            <button
                              onClick={() => handleColorSelect(null, close)}
                              className="text-xs text-gray-500 hover:text-gray-700 flex items-center"
                            >
                              <X className="w-3 h-3 mr-1" />
                              Xóa bộ lọc
                            </button>
                          )}
                        </div>
                        
                        {/* All Colors Option */}
                        <button
                          onClick={() => handleColorSelect(null, close)}
                          className={`w-full flex items-center px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors ${
                            !selectedColor ? 'bg-blue-50 border border-blue-200' : ''
                          }`}
                        >
                          <div className="w-6 h-6 mr-3 rounded-full border-2 border-gray-300 bg-gradient-to-r from-red-200 via-blue-200 to-purple-200"></div>
                          <span className="text-sm font-medium text-gray-700">Tất cả màu sắc</span>
                        </button>
                        
                        {/* Color Grid */}
                        <div className="grid grid-cols-2 gap-2">
                          {colors.map((color) => (
                            <button
                              key={color.color_name}
                              onClick={() => handleColorSelect(color, close)}
                              className={`flex items-center px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-all duration-200 hover:scale-[1.02] ${
                                selectedColor?.color_name === color.color_name 
                                  ? 'bg-blue-50 border border-blue-200 shadow-sm' 
                                  : 'border border-transparent'
                              }`}
                            >
                              <span
                                className="inline-block w-6 h-6 mr-3 rounded-full border-2 border-white shadow-sm"
                                style={{ backgroundColor: color.color_code }}
                              ></span>
                              <span className="text-sm font-medium text-gray-700 truncate">
                                {color.color_name}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </Popover.Panel>
                  </>
                )}
              </Popover>
            </div>

            {/* Sort By */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sắp xếp theo
              </label>
              <Select
                value={filters.sort_by}
                onValueChange={(value) => handleFilterChange('sort_by', value)}
                className="w-full"
              >
                <option value="created_at">Mới nhất</option>
                <option value="base_price">Giá tiền</option>
                <option value="name">Tên sản phẩm</option>
                <option value="view_count">Phổ biến</option>
              </Select>
            </div>

            {/* Sort Direction */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thứ tự
              </label>
              <Select
                value={filters.sort_direction}
                onValueChange={(value) => handleFilterChange('sort_direction', value)}
                className="w-full"
              >
                <option value="asc">Tăng dần</option>
                <option value="desc">Giảm dần</option>
              </Select>
            </div>

            {/* Price Range */}
            <div className="lg:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Khoảng giá
              </label>
              <PriceRangeFilter 
                initialMin={Number(filters.price_from) || 0}
                initialMax={Number(filters.price_to) || 10000000}
                onPriceChange={handlePriceRangeChange}
              />
            </div>
          </div>

          {/* Active Filters Display */}
          {(selectedColor || filters.search || filters.price_from || filters.price_to) && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Bộ lọc đang áp dụng:</span>
                
                {selectedColor && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    <span
                      className="w-3 h-3 mr-1.5 rounded-full border border-white"
                      style={{ backgroundColor: selectedColor.color_code }}
                    ></span>
                    {selectedColor.color_name}
                    <button
                      onClick={() => handleColorSelect(null, () => {})}
                      className="ml-1.5 hover:bg-blue-200 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                
                {filters.search && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    "{filters.search}"
                    <button
                      onClick={() => handleFilterChange('search', '')}
                      className="ml-1.5 hover:bg-green-200 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                
                {(filters.price_from || filters.price_to) && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    {filters.price_from || 0} - {filters.price_to || 10000000} VNĐ
                    <button
                      onClick={() => {
                        setFilters(prev => ({ ...prev, price_from: '', price_to: '', page: 1 }));
                      }}
                      className="ml-1.5 hover:bg-purple-200 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 aspect-w-1 aspect-h-1 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {products.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">Không tìm thấy sản phẩm nào</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.map(product => (
                  <ProductCard key={product.product_id} product={product} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {pagination.last_page > 1 && (
              <div className="mt-8">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <button
                        onClick={() => handlePageChange(pagination.current_page - 1)}
                        disabled={pagination.current_page === 1}
                        className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Trước
                      </button>
                    </PaginationItem>

                    {Array.from({ length: pagination.last_page }, (_, i) => i + 1)
                      .filter(page => {
                        const current = pagination.current_page;
                        return (
                          page === 1 ||
                          page === pagination.last_page ||
                          Math.abs(current - page) <= 2
                        );
                      })
                      .map((page, index, arr) => {
                        const prevPage = arr[index - 1];
                        return (
                          <React.Fragment key={page}>
                            {prevPage && page - prevPage > 1 && (
                              <PaginationItem>
                                <span className="px-3 py-1 text-gray-500">...</span>
                              </PaginationItem>
                            )}
                            <PaginationItem>
                              <button
                                onClick={() => handlePageChange(page)}
                                className={`px-4 py-2 rounded-lg transition-colors ${
                                  pagination.current_page === page
                                    ? 'bg-blue-500 text-white shadow-sm'
                                    : 'border border-gray-300 hover:bg-gray-50'
                                }`}
                              >
                                {page}
                              </button>
                            </PaginationItem>
                          </React.Fragment>
                        );
                      })}

                    <PaginationItem>
                      <button
                        onClick={() => handlePageChange(pagination.current_page + 1)}
                        disabled={pagination.current_page === pagination.last_page}
                        className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Sau
                      </button>
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default ProductListing;