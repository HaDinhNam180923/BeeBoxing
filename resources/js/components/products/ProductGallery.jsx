// src/components/products/ProductGallery.jsx
import React, { useState, useEffect } from 'react';

const ProductGallery = ({ color }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(false);
  
  const images = color?.images || [];
  const currentImage = images[currentImageIndex] || color?.primary_image;

  // Reset index khi color thay đổi
  useEffect(() => {
    setCurrentImageIndex(0);
    setIsZoomed(false);
  }, [color]);

  // Xử lý phím mũi tên
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (images.length <= 1) return;
      
      if (e.key === 'ArrowLeft') {
        setCurrentImageIndex(prev => prev === 0 ? images.length - 1 : prev - 1);
      } else if (e.key === 'ArrowRight') {
        setCurrentImageIndex(prev => prev === images.length - 1 ? 0 : prev + 1);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [images.length]);

  const handleImageChange = (index) => {
    if (index === currentImageIndex) return;
    setIsLoading(true);
    setCurrentImageIndex(index);
    setTimeout(() => setIsLoading(false), 200);
  };

  const handleMouseMove = (e) => {
    if (!isZoomed) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePosition({ x, y });
  };

  const toggleZoom = () => {
    setIsZoomed(!isZoomed);
  };

  const goToPrevious = () => {
    if (images.length <= 1) return;
    setCurrentImageIndex(prev => prev === 0 ? images.length - 1 : prev - 1);
  };

  const goToNext = () => {
    if (images.length <= 1) return;
    setCurrentImageIndex(prev => prev === images.length - 1 ? 0 : prev + 1);
  };

  if (!currentImage) {
    return (
      <div className="space-y-4">
        <div className="aspect-square bg-gray-100 rounded-2xl flex items-center justify-center">
          <div className="text-gray-400 text-center">
            <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm">Không có hình ảnh</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Ảnh chính */}
      <div className="relative group">
        <div 
          className={`aspect-square relative overflow-hidden rounded-2xl bg-gray-50 cursor-pointer transition-all duration-300 ${
            isZoomed ? 'rounded-lg' : 'hover:shadow-xl'
          }`}
          onClick={toggleZoom}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setIsZoomed(false)}
        >
          {/* Loading overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          )}

          {/* Ảnh chính */}
          <img
            src={currentImage.image_url}
            alt={currentImage.alt_text}
            className={`object-cover object-center w-full h-full transition-all duration-500 ${
              isZoomed 
                ? 'scale-150 cursor-zoom-out' 
                : 'hover:scale-105 cursor-zoom-in'
            }`}
            style={isZoomed ? {
              transformOrigin: `${mousePosition.x}% ${mousePosition.y}%`
            } : {}}
          />

          {/* Overlay khi hover */}
          <div className={`absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 ${isZoomed ? 'hidden' : ''}`} />

          {/* Nút điều hướng */}
          {images.length > 1 && !isZoomed && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToPrevious();
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
                aria-label="Ảnh trước"
              >
                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToNext();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
                aria-label="Ảnh tiếp theo"
              >
                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          {/* Indicator số ảnh */}
          {images.length > 1 && !isZoomed && (
            <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm font-medium">
              {currentImageIndex + 1}/{images.length}
            </div>
          )}

          {/* Icon zoom */}
          {!isZoomed && (
            <div className="absolute top-4 left-4 bg-white bg-opacity-80 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* Thanh thumbnail */}
      {images.length > 1 && (
        <div className="space-y-3">
          {/* Dots indicator cho mobile */}
          <div className="flex justify-center gap-2 md:hidden">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => handleImageChange(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  currentImageIndex === index 
                    ? 'bg-blue-500 w-6' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>

          {/* Thumbnail grid cho desktop */}
          <div className="hidden md:block">
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
              {images.map((image, index) => (
                <button
                  key={image.image_id}
                  onClick={() => handleImageChange(index)}
                  className={`relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 transition-all duration-300 ${
                    currentImageIndex === index 
                      ? 'ring-2 ring-blue-500 ring-offset-2 shadow-lg scale-105' 
                      : 'hover:ring-2 hover:ring-blue-300 hover:ring-offset-1 hover:shadow-md hover:scale-102'
                  }`}
                >
                  <img
                    src={image.image_url}
                    alt={image.alt_text}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                  />
                  
                  {/* Overlay khi active */}
                  {currentImageIndex === index && (
                    <div className="absolute inset-0 bg-blue-500 bg-opacity-10" />
                  )}
                  
                  {/* Số thứ tự */}
                  <div className="absolute bottom-1 right-1 bg-black bg-opacity-60 text-white text-xs px-1.5 py-0.5 rounded">
                    {index + 1}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Hướng dẫn sử dụng */}
      {!isZoomed && images.length > 1 && (
        <div className="text-center text-sm text-gray-500 space-y-1">
          <p className="hidden md:block">Nhấp vào ảnh để phóng to • Sử dụng mũi tên ← → để chuyển ảnh</p>
          <p className="md:hidden">Chạm vào ảnh để phóng to • Vuốt để xem thêm ảnh</p>
        </div>
      )}
    </div>
  );
};

export default ProductGallery;