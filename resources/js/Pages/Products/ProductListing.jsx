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
import MainLayout from '@/components/layouts/MainLayout';

const ProductListing = () => {
  // Lấy category_id từ URL parameters
  const { url } = usePage();
  const urlParams = new URLSearchParams(window.location.search);
  const categoryId = urlParams.get('category_id');

  // State for filters and pagination
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category_id: categoryId || '',
    brand: '',
    price_from: '',
    price_to: '',
    search: '',
    sort_by: 'created_at',
    sort_direction: 'desc',
    per_page: 12,
    page: 1,
  });
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 12,
    total: 0,
    last_page: 1,
  });

  // Fetch products when filters change
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        // Chỉ thêm các filter có giá trị vào query params
        const queryParams = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== '' && value !== null) {
            queryParams.append(key, value);
          }
        });

        const response = await axios.get(`/api/products?${queryParams.toString()}`);
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

  // Cập nhật URL khi filters thay đổi
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== '' && value !== null) {
        queryParams.set(key, value);
      } else {
        queryParams.delete(key);
      }
    });
    
    const newUrl = `${window.location.pathname}?${queryParams.toString()}`;
    window.history.pushState({}, '', newUrl);
  }, [filters]);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page when filters change
    }));
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

  return (
    <MainLayout title="Product Listing">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters Section */}
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4 lg:grid-cols-6">
          <Input
            type="text"
            placeholder="Search products..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="md:col-span-2"
          />

          <Select
            value={filters.sort_by}
            onValueChange={(value) => handleFilterChange('sort_by', value)}
          >
            <option value="created_at">Newest</option>
            <option value="base_price">Price</option>
            <option value="name">Name</option>
            <option value="view_count">Popular</option>
          </Select>

          <Select
            value={filters.sort_direction}
            onValueChange={(value) => handleFilterChange('sort_direction', value)}
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </Select>

          <div className="md:col-span-2">
            <PriceRangeFilter 
              initialMin={Number(filters.price_from) || 0}
              initialMax={Number(filters.price_to) || 1000000}
              onPriceChange={handlePriceRangeChange}
            />
          </div>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map(product => (
                <ProductCard key={product.product_id} product={product} />
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-8">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => handleFilterChange('page', pagination.current_page - 1)}
                      disabled={pagination.current_page === 1}
                    />
                  </PaginationItem>

                  {[...Array(pagination.last_page)].map((_, i) => (
                    <PaginationItem key={i + 1}>
                      <PaginationLink
                        onClick={() => handleFilterChange('page', i + 1)}
                        isActive={pagination.current_page === i + 1}
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => handleFilterChange('page', pagination.current_page + 1)}
                      disabled={pagination.current_page === pagination.last_page}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default ProductListing;