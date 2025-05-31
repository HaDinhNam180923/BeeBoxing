import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ProductCard from './ProductCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const RecentlyViewedProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scrollPosition, setScrollPosition] = useState(0);
  const containerRef = useRef(null);

  useEffect(() => {
    // Lấy danh sách sản phẩm đã xem từ localStorage
    const getRecentlyViewedProducts = () => {
      const viewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
      
      if (viewed.length === 0) {
        setLoading(false);
        return;
      }
      
      // Lấy chi tiết sản phẩm từ API
      fetchProductDetails(viewed);
    };
    
    const fetchProductDetails = async (productIds) => {
      try {
        setLoading(true);
        // Giới hạn chỉ lấy 10 sản phẩm gần nhất
        const recentIds = productIds.slice(0, 10);
        
        // Gọi API để lấy thông tin chi tiết sản phẩm
        const response = await axios.get('/api/products/recently-viewed', {
          params: { ids: recentIds.join(',') }
        });
        
        if (response.data.status) {
          setProducts(response.data.data);
        }
      } catch (error) {
        console.error('Lỗi khi lấy sản phẩm đã xem gần đây:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    
    getRecentlyViewedProducts();
  }, []);

  const scroll = (direction) => {
    const container = containerRef.current;
    if (!container) return;
    
    const cardWidth = 288; // Chiều rộng ProductCard + margin (72px * 4)
    const scrollAmount = cardWidth * 2; // Scroll 2 sản phẩm mỗi lần
    
    const newPosition = direction === 'left' 
      ? Math.max(0, scrollPosition - scrollAmount)
      : Math.min(
          container.scrollWidth - container.clientWidth,
          scrollPosition + scrollAmount
        );
    
    container.scrollTo({
      left: newPosition,
      behavior: 'smooth'
    });
    
    setScrollPosition(newPosition);
  };

  const updateScrollPosition = () => {
    if (containerRef.current) {
      setScrollPosition(containerRef.current.scrollLeft);
    }
  };

  // Nếu không có sản phẩm đã xem gần đây hoặc đang loading, không hiển thị gì
  if (loading) {
    return null;
  }
  
  if (products.length === 0) {
    return null;
  }

  const canScrollLeft = scrollPosition > 0;
  const canScrollRight = containerRef.current
    ? scrollPosition < containerRef.current.scrollWidth - containerRef.current.clientWidth - 10
    : false;

  return (
    <div className="bg-white py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            Sản phẩm đã xem gần đây
          </h2>
          
          <div className="flex space-x-2">
            <button
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className={`p-2 rounded-full border ${
                canScrollLeft 
                  ? 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                  : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
              }`}
              aria-label="Scroll left"
            >
              <ChevronLeft size={20} />
            </button>
            
            <button
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              className={`p-2 rounded-full border ${
                canScrollRight 
                  ? 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                  : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
              }`}
              aria-label="Scroll right"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
        
        <div 
          className="relative overflow-hidden"
        >
          <div
            ref={containerRef}
            className="flex space-x-4 overflow-x-auto scrollbar-hide snap-x"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            onScroll={updateScrollPosition}
          >
            {products.map((product) => (
              <div 
                key={product.product_id} 
                className="flex-none snap-start"
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecentlyViewedProducts;

