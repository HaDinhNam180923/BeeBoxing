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
import { X, ChevronDown } from 'lucide-react';

const ProductListing = ({ auth }) => {
  // Lấy category_id và color_name từ URL parameters
  const { url } = usePage();
  const urlParams = new URLSearchParams(window.location.search);
  const categoryId = urlParams.get('category_id');
  const initialPage = parseInt(urlParams.get('page')) || 1;
  const initialColor = urlParams.get('color_name') || '';

  // Select layout based on authentication status
  const Layout = auth.user ? AuthenticatedLayout : GuestLayout;

  // State for filters, pagination, colors, color picker, category, and show more colors
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [colors, setColors] = useState([]);
  const [selectedColor, setSelectedColor] = useState(null);
  const [categoryName, setCategoryName] = useState('Tất cả sản phẩm');
  const [showAllColors, setShowAllColors] = useState(false); // State để hiển thị/ẩn màu
  const [filters, setFilters] = useState({
    category_id: categoryId || '',
    brand: '',
    price_from: '',
    price_to: '',
    search: '',
    color_name: initialColor,
    sort: 'newest',
    per_page: 12,
    page: initialPage,
  });
  const [pagination, setPagination] = useState({
    current_page: initialPage,
    per_page: 12,
    total: 0,
    last_page: 1,
  });

  // Hàm tìm kiếm danh mục theo ID trong danh sách danh mục
  const findCategoryName = (categories, id) => {
    for (const category of categories) {
      if (category.id === parseInt(id)) {
        return category.name;
      }
      if (category.children) {
        const found = findCategoryName(category.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  // Fetch colors and category name on component mount
  useEffect(() => {
    const fetchColors = async () => {
      try {
        const response = await axios.get('/api/product-colors');
        if (response.data.status === 'success') {
          setColors(response.data.data);
          if (initialColor) {
            const color = response.data.data.find(c => c.color_name === initialColor);
            setSelectedColor(color || null);
          }
        }
      } catch (error) {
        console.error('Lỗi khi lấy danh sách màu:', error);
      }
    };

    const fetchCategoryName = async () => {
      if (categoryId) {
        try {
          const response = await axios.get('/api/categories');
          if (response.data.data) {
            const foundName = findCategoryName(response.data.data, categoryId);
            setCategoryName(foundName || 'Danh mục không xác định');
          } else {
            setCategoryName('Danh mục không xác định');
          }
        } catch (error) {
          console.error('Lỗi khi lấy danh sách danh mục:', error);
          setCategoryName('Danh mục không xác định');
        }
      }
    };

    fetchColors();
    fetchCategoryName();
  }, [categoryId]);

  // Fetch products when filters change
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        const { sort, ...otherFilters } = filters;

        // Chuyển đổi sort thành sort_by và sort_direction
        let sortBy = 'created_at';
        let sortDirection = 'desc';
        switch (sort) {
          case 'price_high':
            sortBy = 'base_price';
            sortDirection = 'desc';
            break;
          case 'price_low':
            sortBy = 'base_price';
            sortDirection = 'asc';
            break;
          case 'popular':
            sortBy = 'view_count';
            sortDirection = 'desc';
            break;
          case 'newest':
          default:
            sortBy = 'created_at';
            sortDirection = 'desc';
        }

        Object.entries({
          ...otherFilters,
          sort_by: sortBy,
          sort_direction: sortDirection,
        }).forEach(([key, value]) => {
          if (value !== '' && value !== null && value !== undefined) {
            queryParams.set(key, value);
          }
        });
        
        const response = await axios.get(`/api/products?${queryParams.toString()}`);
        setProducts(response.data.data.products);
        setPagination(response.data.data.pagination);
      } catch (error) {
        console.error('Lỗi khi lấy danh sách sản phẩm:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [filters]);

  // Update URL when filters change
  useEffect(() => {
    const queryParams = new URLSearchParams();
    const { sort, ...otherFilters } = filters;

    let sortBy = 'created_at';
    let sortDirection = 'desc';
    switch (sort) {
      case 'price_high':
        sortBy = 'base_price';
        sortDirection = 'desc';
        break;
      case 'price_low':
        sortBy = 'base_price';
        sortDirection = 'asc';
        break;
      case 'popular':
        sortBy = 'view_count';
        sortDirection = 'desc';
        break;
      case 'newest':
      default:
        sortBy = 'created_at';
        sortDirection = 'desc';
    }

    Object.entries({
      ...otherFilters,
      sort_by: sortBy,
      sort_direction: sortDirection,
    }).forEach(([key, value]) => {
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
      setFilters(prev => ({
        ...prev,
        page: value
      }));
    } else {
      setFilters(prev => ({
        ...prev,
        [key]: value,
        page: 1
      }));
    }
  };

  // Handle color selection
  const handleColorSelect = (color) => {
    setSelectedColor(color);
    handleFilterChange('color_name', color ? color.color_name : '');
  };

  // Handle price range change
  const handlePriceRangeChange = (values) => {
    setFilters(prev => ({
      ...prev,
      price_from: values[0],
      price_to: values[1],
      page: 1,
    }));
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    setFilters(prev => ({
      ...prev,
      page: newPage
    }));
  };

  // Toggle show more colors
  const toggleShowAllColors = () => {
    setShowAllColors(prev => !prev);
  };

  return (
    <Layout title="Danh sách sản phẩm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category Header */}
        <div className="mb-6">
          <h1 className="text-2xl text-gray-900">Kết quả cho "{categoryName}"</h1>
        </div>

        {/* Main Layout: Filters (Left) and Products (Right) */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Section (Sticky with optimized height) */}
          <div className="lg:w-1/4">
            <div className="sticky top-4 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">Bộ lọc</h2>
              </div>
              
              <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
                <div className="p-6 space-y-6">
                  {/* Search Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tìm kiếm sản phẩm
                    </label>
                    <Input
                      type="text"
                      placeholder="Nhập tên sản phẩm..."
                      value={filters.search}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Color Filter - Improved with circular design */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Màu sắc
                    </label>
                    <div className="grid grid-cols-4 gap-3">
                      {/* All colors button */}
                      <div className="flex flex-col items-center space-y-1">
                        <button
                          onClick={() => handleColorSelect(null)}
                          className={`relative w-6 h-6 rounded-full border-3 transition-all duration-200 group ${!selectedColor 
                            ? 'border-blue-500 shadow-lg ring-2 ring-blue-200' 
                            : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          <div className="w-full h-full rounded-full bg-gradient-to-br from-red-300 via-yellow-300 to-blue-300 opacity-80"></div>
                          {!selectedColor && (
                            <div className="absolute inset-0 rounded-full border-2 border-white"></div>
                          )}
                        </button>
                        <span className="text-xs text-gray-600 text-center leading-tight">Tất cả</span>
                      </div>

                      {/* Individual color buttons */}
                      {(showAllColors ? colors : colors.slice(0, 3)).map((color) => (
                        <div key={color.color_name} className="flex flex-col items-center space-y-1">
                          <button
                            onClick={() => handleColorSelect(color)}
                            className={`relative w-6 h-6 rounded-full border-3 transition-all duration-200 group ${
                              selectedColor?.color_name === color.color_name
                                ? 'border-blue-500 shadow-lg ring-2 ring-blue-200'
                                : 'border-gray-300 hover:border-gray-400'
                            }`}
                          >
                            <div
                              className="w-full h-full rounded-full"
                              style={{ backgroundColor: color.color_code }}
                            ></div>
                            {selectedColor?.color_name === color.color_name && (
                              <div className="absolute inset-0 rounded-full border-2 border-white"></div>
                            )}
                          </button>
                          <span className="text-xs text-gray-600 text-center leading-tight max-w-[60px] truncate">
                            {color.color_name}
                          </span>
                        </div>
                      ))}
                    </div>
                    {colors.length > 3 && (
                      <div className="mt-4 text-center">
                        <button
                          onClick={toggleShowAllColors}
                          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                          {showAllColors ? 'Thu gọn' : 'Xem thêm'}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Price Range */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Khoảng giá
                    </label>
                    <PriceRangeFilter 
                      initialMin={Number(filters.price_from) || 0}
                      initialMax={Number(filters.price_to) || 10000000}
                      onPriceChange={handlePriceRangeChange}
                    />
                  </div>

                  {/* Sort - Improved dropdown styling */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Sắp xếp
                    </label>
                    <div className="relative">
                      <Select
                        value={filters.sort}
                        onValueChange={(value) => handleFilterChange('sort', value)}
                        className="w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white pr-10"
                      >
                        <option value="newest">Mới nhất</option>
                        <option value="price_high">Giá cao nhất</option>
                        <option value="price_low">Giá thấp nhất</option>
                        <option value="popular">Phổ biến nhất</option>
                      </Select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Active Filters Display - Fixed at bottom */}
              {(selectedColor || filters.search || filters.price_from || filters.price_to) && (
                <div className="p-4 bg-gray-50 border-t border-gray-100">
                  <div className="space-y-2">
                    <span className="text-sm font-medium text-gray-700">Bộ lọc đang áp dụng:</span>
                    <div className="flex flex-wrap gap-2">
                      {selectedColor && (
                        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                          <span
                            className="w-3 h-3 mr-1.5 rounded-full border border-white shadow-sm"
                            style={{ backgroundColor: selectedColor.color_code }}
                          ></span>
                          {selectedColor.color_name}
                          <button
                            onClick={() => handleColorSelect(null)}
                            className="ml-1.5 hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      )}
                      {filters.search && (
                        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                          "{filters.search}"
                          <button
                            onClick={() => handleFilterChange('search', '')}
                            className="ml-1.5 hover:bg-green-200 rounded-full p-0.5 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      )}
                      {(filters.price_from || filters.price_to) && (
                        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                          {filters.price_from || 0} - {filters.price_to || 10000000} VNĐ
                          <button
                            onClick={() => {
                              setFilters(prev => ({ ...prev, price_from: '', price_to: '', page: 1 }));
                            }}
                            className="ml-1.5 hover:bg-purple-200 rounded-full p-0.5 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Products Section */}
          <div className="lg:w-3/4">
            {/* Products Grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(9)].map((_, i) => (
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
        </div>
      </div>
    </Layout>
  );
};

export default ProductListing;