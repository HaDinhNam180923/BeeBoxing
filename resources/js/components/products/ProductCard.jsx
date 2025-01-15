import { useState } from 'react';
import { Link } from '@inertiajs/react';
import { Heart } from 'lucide-react';

const ProductCard = ({ product }) => {
  const [selectedColor, setSelectedColor] = useState(
    product.colors[0]?.color_id || null
  );

  const currentColor = product.colors.find(c => c.color_id === selectedColor);
  const imageUrl = currentColor?.primary_image?.image_url || '/placeholder.jpg';
  const discountedPrice = product.final_price;
  const hasDiscount = product.discount > 0;

  const formatPrice = (price) => {
    return `${price.toLocaleString('vi-VN')}đ`;
  };

  return (
    <div className="group relative w-72"> 
      <div 
        className="h-96 w-full overflow-hidden rounded-lg bg-gray-200 relative"
      >
        <img
          src={imageUrl}
          alt={product.name}
          className="h-full w-full object-cover object-center transition-opacity duration-300"
        />
        {hasDiscount && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-md">
            -{product.discount}%
          </div>
        )}
        <button className="absolute top-2 left-2 p-1.5 bg-white rounded-full hover:bg-gray-100">
          <Heart className="w-5 h-5 text-gray-600" />
        </button>
      </div>
      
      <div className="mt-4 space-y-2">
        <div className="flex justify-between">
          <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
            <Link href={route('products.detail', product.product_id)}>
              {product.name}
            </Link>
          </h3>
          <p className="text-sm font-medium text-gray-900 whitespace-nowrap">
            {hasDiscount && (
              <span className="text-xs text-gray-500 line-through mr-2">
                {formatPrice(product.base_price)}
              </span>
            )}
            {formatPrice(discountedPrice)}
          </p>
        </div>
        
        <div className="flex gap-2">
          {product.colors.map(color => (
            <button
              key={color.color_id}
              onClick={() => setSelectedColor(color.color_id)}
              className={`w-6 h-6 rounded-full border-2 ${
                selectedColor === color.color_id ? 'border-indigo-500' : 'border-gray-300'
              }`}
              style={{ backgroundColor: color.color_code }}
              title={color.color_name}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;