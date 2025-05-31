import { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Heart } from 'lucide-react';
import axios from 'axios';

const ProductCard = ({ product }) => {
  const { auth, csrf_token } = usePage().props;
  const [selectedColor, setSelectedColor] = useState(
    product.colors[0]?.color_id || null
  );
  const [isHovered, setIsHovered] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [showSizes, setShowSizes] = useState(false);

  const currentColor = product.colors.find(c => c.color_id === selectedColor);
  const imageUrl = currentColor?.primary_image?.image_url || '/placeholder.jpg';
  const secondaryImage = currentColor?.images?.find(img => !img.is_primary)?.image_url;
  
  const discountedPrice = product.final_price;
  const hasDiscount = product.discount > 0;

  // Lấy danh sách sizes có sẵn cho màu đã chọn
  const availableSizes = currentColor?.inventory?.filter(inv => inv.stock_quantity > 0) || [];

  const formatPrice = (price) => {
    return `${price.toLocaleString('vi-VN')}đ`;
  };

  const handleAddToCart = async (inventoryId) => {
    if (!auth.user) {
      alert('Vui lòng đăng nhập để thêm vào giỏ hàng');
      window.location.href = '/login';
      return;
    }

    try {
      setIsAddingToCart(true);
      await axios.post('/api/cart/add', {
        inventory_id: inventoryId,
        quantity: 1
      }, {
        headers: {
          'X-CSRF-TOKEN': csrf_token,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        withCredentials: true
      });

      alert('Sản phẩm đã được thêm vào giỏ hàng');
    } catch (error) {
      console.error('Lỗi thêm vào giỏ:', error.response?.data || error);
      alert(error.response?.data?.message || 'Có lỗi xảy ra khi thêm vào giỏ hàng');
    } finally {
      setIsAddingToCart(false);
      setShowSizes(false);
    }
  };

  // Khi hover, hiển thị nút "Thêm nhanh vào giỏ hàng"
  useEffect(() => {
    if (!isHovered) {
      setShowSizes(false);
    }
  }, [isHovered]);

  return (
    <div 
      className="group relative w-72"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    > 
      <div className="h-96 w-full overflow-hidden rounded-lg bg-gray-200 relative">
        <img
          src={isHovered && secondaryImage ? secondaryImage : imageUrl}
          alt={product.name}
          className="h-full w-full object-cover object-center transition-all duration-300"
        />
        
        {hasDiscount && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-md">
            -{product.discount}%
          </div>
        )}
        
        <button className="absolute top-2 left-2 p-1.5 bg-white rounded-full hover:bg-gray-100">
          <Heart className="w-5 h-5 text-gray-600" />
        </button>

        {/* Quick add to cart panel */}
        {(isHovered || showSizes) && (
          <div className="absolute bottom-4 left-0 right-0 mx-auto px-4">
            {!showSizes ? (
              <button 
                onClick={() => setShowSizes(true)}
                className="w-full bg-gray-200/95 hover:bg-gray-300/95 text-gray-900 py-3 text-sm font-medium rounded-lg"
              >
                Thêm nhanh vào giỏ hàng +
              </button>
            ) : (
              <div className="bg-gray-200/95 p-4 rounded-lg">
                <div className="text-center text-sm font-medium mb-3">
                  Thêm nhanh vào giỏ hàng +
                </div>
                <div className="flex flex-wrap gap-2 justify-center">
                  {availableSizes.map(inv => (
                    <button
                      key={inv.inventory_id}
                      onClick={() => handleAddToCart(inv.inventory_id)}
                      disabled={isAddingToCart}
                      className="bg-white hover:bg-gray-100 text-gray-900 rounded-full py-2 px-3 text-sm font-medium"
                    >
                      {inv.size}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="mt-4 space-y-2">
        <div className="flex gap-2 mb-2">
          {product.colors.map(color => (
            <button
              key={color.color_id}
              onClick={() => setSelectedColor(color.color_id)}
              className={`w-8 h-5 rounded-md border-2 ${
                selectedColor === color.color_id ? 'border-indigo-500' : 'border-gray-300'
              }`}
              style={{ backgroundColor: color.color_code }}
              title={color.color_name}
            />
          ))}
        </div>
        
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
      </div>
      
      {isAddingToCart && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-lg">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
};

export default ProductCard;