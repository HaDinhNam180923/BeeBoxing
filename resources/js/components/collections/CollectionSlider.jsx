import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from '@/components/products/ProductCard';

const CollectionSlider = ({ collectionId }) => {
  const [collection, setCollection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scrollPosition, setScrollPosition] = useState(0);
  const containerRef = useRef(null);

  useEffect(() => {
    fetchCollectionDetail();
  }, [collectionId]);

  const fetchCollectionDetail = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/collections/${collectionId}`);
      
      if (response.data.status) {
        setCollection(response.data.data);
      }
    } catch (error) {
      console.error('Lỗi khi lấy chi tiết bộ sưu tập:', error);
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

  if (loading) {
    return (
      <div className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!collection || !collection.products || collection.products.length === 0) {
    return null;
  }

  const canScrollLeft = scrollPosition > 0;
  const canScrollRight = containerRef.current
    ? scrollPosition < containerRef.current.scrollWidth - containerRef.current.clientWidth - 10
    : false;

  return (
    <div className="py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            {collection.name}
          </h2>
          
          <div className="flex items-center">
            <div className="flex space-x-2 mr-4">
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
            
            <Link
              href={route('collections.detail', collection.slug)}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Xem tất cả
            </Link>
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
            {collection.products.map((product) => (
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

export default CollectionSlider;