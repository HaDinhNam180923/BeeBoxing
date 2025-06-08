import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ProductCard from './ProductCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const AlsoBoughtProducts = ({ productId }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scrollPosition, setScrollPosition] = useState(0);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!productId) {
      setLoading(false);
      return;
    }

    fetchAlsoBoughtProducts();
  }, [productId]);

  const fetchAlsoBoughtProducts = async () => {
    try {
      setLoading(true);
      
      const response = await axios.get(`/api/products/${productId}/also-bought`, {
        params: { limit: 12 }
      });
      console.log('productId:', productId);
      console.log('Sản phẩm người dùng cũng mua:', response.data);
      
      if (response.data.status) {
        setProducts(response.data.data);
      }
    } catch (error) {
      console.error('Lỗi khi lấy sản phẩm người dùng cũng mua:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

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

  // Hiển thị loading state
  if (loading) {
    return (
      <div className="bg-white py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">
              Người dùng cũng mua
            </h2>
          </div>
          
          <div className="flex space-x-4 overflow-hidden">
            {/* Loading skeleton */}
            {[...Array(4)].map((_, index) => (
              <div key={index} className="flex-none w-72">
                <div className="animate-pulse">
                  <div className="bg-gray-200 aspect-square rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  // Nếu không có sản phẩm, không hiển thị gì
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
            Người dùng cũng mua
          </h2>
          
          {products.length > 4 && (
            <div className="flex space-x-2">
              <button
                onClick={() => scroll('left')}
                disabled={!canScrollLeft}
                className={`p-2 rounded-full border transition-colors ${
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
                className={`p-2 rounded-full border transition-colors ${
                  canScrollRight 
                    ? 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                    : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                }`}
                aria-label="Scroll right"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>
        
        <div className="relative overflow-hidden">
          <div
            ref={containerRef}
            className="flex space-x-4 overflow-x-auto scrollbar-hide snap-x"
            style={{ 
              scrollbarWidth: 'none', 
              msOverflowStyle: 'none',
              WebkitScrollbar: { display: 'none' }
            }}
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
        
        {/* Indicator dots cho mobile */}
        {products.length > 4 && (
          <div className="flex justify-center mt-4 space-x-2 md:hidden">
            {Array.from({ length: Math.ceil(products.length / 2) }).map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  Math.floor(scrollPosition / (288 * 2)) === index
                    ? 'bg-gray-800'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AlsoBoughtProducts;