// src/components/products/ProductGallery.jsx
import React, { useState } from 'react';

const ProductGallery = ({ color }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const images = color?.images || [];
  const currentImage = images[currentImageIndex] || color?.primary_image;

  if (!currentImage) return null;

  return (
    <div className="space-y-4">
      {/* Ảnh chính */}
      <div className="aspect-square relative overflow-hidden rounded-lg bg-gray-100">
        <img
          src={currentImage.image_url}
          alt={currentImage.alt_text}
          className="object-cover object-center w-full h-full"
        />
      </div>

      {/* Thanh thumbnail */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={image.image_id}
              onClick={() => setCurrentImageIndex(index)}
              className={`w-20 h-20 rounded-md overflow-hidden flex-shrink-0 
                ${currentImageIndex === index ? 'ring-2 ring-blue-500' : 'hover:ring-2 hover:ring-blue-300'}`}
            >
              <img
                src={image.image_url}
                alt={image.alt_text}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductGallery;