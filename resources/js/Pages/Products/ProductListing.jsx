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
  const initialPage = parseInt(urlParams.get('page')) || 1;

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
    page: initialPage,
  });
  const [pagination, setPagination] = useState({
    current_page: initialPage,
    per_page: 12,
    total: 0,
    last_page: 1,
  });

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
              initialMax={Number(filters.price_to) || 10000000}
              onPriceChange={handlePriceRangeChange}
            />
          </div>
        </div>

        {/* Debug information - remove in production */}
        {/* <div className="mb-4 p-2 bg-gray-100 rounded">
          <p>Current page: {pagination.current_page}</p>
          <p>Total pages: {pagination.last_page}</p>
          <p>Filter page: {filters.page}</p>
        </div> */}

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
                <p className="text-gray-500 text-lg">No products found</p>
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
                        className="px-3 py-1 rounded disabled:opacity-50"
                      >
                        Previous
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
                                className={`px-3 py-1 rounded ${
                                  pagination.current_page === page
                                    ? 'bg-yellow-500 text-white'
                                    : 'bg-gray-200'
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
                        className="px-3 py-1 rounded disabled:opacity-50"
                      >
                        Next
                      </button>
                    </PaginationItem>
                  </PaginationContent>

                </Pagination>
              </div>
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default ProductListing;