import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getProductDetail } from '@/services/api';
import MainLayout from '@/components/layouts/MainLayout';
import ProductGallery from '@/components/products/ProductGallery';
import ColorSelector from '@/components/products/ColorSelector';
import SizeSelector from '@/components/products/SizeSelector';
import axios from 'axios';
import { usePage } from '@inertiajs/react'; 

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-lg shadow ${className}`}>
    {children}
  </div>
);

const CardContent = ({ children, className = "" }) => (
  <div className={`p-6 ${className}`}>
    {children}
  </div>
);

const Button = ({ children, className = "", ...props }) => (
  <button 
    className={`px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 ${className}`}
    {...props}
  >
    {children}
  </button>
);

const Badge = ({ children, variant = "default", className = "" }) => {
  const variants = {
    default: "bg-gray-100 text-gray-800",
    secondary: "bg-blue-100 text-blue-800",
    destructive: "bg-red-100 text-red-800",
    success: "bg-green-100 text-green-800",
  };

  return (
    <span className={`px-2 py-1 text-xs rounded-full ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

const TabButton = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 font-medium text-sm ${
      active 
        ? 'text-blue-600 border-b-2 border-blue-600' 
        : 'text-gray-500 hover:text-gray-700'
    }`}
  >
    {children}
  </button>
);

const LoadingState = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-pulse">
    <div className="aspect-square bg-gray-200 rounded-lg" />
    <div className="space-y-4">
      <div className="h-8 bg-gray-200 rounded w-3/4" />
      <div className="h-6 bg-gray-200 rounded w-1/2" />
      <div className="h-40 bg-gray-200 rounded" />
    </div>
  </div>
);

const ErrorState = ({ error }) => (
  <div className="text-center py-12">
    <h2 className="text-2xl font-bold text-red-600 mb-4">
      Không thể tải thông tin sản phẩm
    </h2>
    <p className="text-gray-600">{error.message}</p>
  </div>
);

const NoDataState = () => (
  <div className="text-center py-12">
    <h2 className="text-2xl font-bold text-gray-600 mb-4">
      Không tìm thấy thông tin sản phẩm
    </h2>
  </div>
);

const Detail = ({ id }) => {
  const { auth, csrf_token } = usePage().props;
  const { data: response, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: () => getProductDetail(id)
  });

  const ProductContent = () => {
    const product = response.data;
    const [selectedColor, setSelectedColor] = useState(product.colors[0]);
    const [selectedSize, setSelectedSize] = useState(product.colors[0].inventory[0]?.size);
    const [activeTab, setActiveTab] = useState('description');
    const [quantity, setQuantity] = useState(1);
    const [isAddingToCart, setIsAddingToCart] = useState(false);

    const currentInventory = selectedColor.inventory.find(
      inv => inv.size === selectedSize
    );

    const basePrice = product.base_price * (1 - (product.discount / 100));
    const priceAdjustment = currentInventory?.price_adjustment || 0;
    const finalPrice = basePrice * (1 + (priceAdjustment / 100));

    const handleQuantityChange = (newQuantity) => {
      if (newQuantity >= 1 && newQuantity <= currentInventory?.stock_quantity) {
        setQuantity(newQuantity);
      }
    };

    const handleAddToCart = async () => {
      if (!currentInventory || currentInventory.stock_quantity === 0) return;
  
      if (!auth.user) {
        alert('Vui lòng đăng nhập để thêm vào giỏ hàng');
        window.location.href = '/login';
        return;
      }
  
      try {
        setIsAddingToCart(true);
        const response = await axios.post('/api/cart/add', {
          inventory_id: currentInventory.inventory_id,
          quantity: quantity
        }, {
          headers: {
            'X-CSRF-TOKEN': csrf_token, // Sử dụng token đã lấy từ props
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
      }
    };

    const QuantitySelector = () => (
      <div className="flex items-center space-x-4">
        <span className="text-gray-600 font-medium">Số lượng:</span>
        <div className="flex items-center border border-gray-300 rounded-lg">
          <button
            onClick={() => handleQuantityChange(quantity - 1)}
            disabled={quantity <= 1}
            className="px-3 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-l-lg transition-colors"
          >
            -
          </button>
          <input
            type="number"
            value={quantity}
            onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
            className="w-16 text-center border-x border-gray-300 py-1 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            min="1"
            max={currentInventory?.stock_quantity || 1}
          />
          <button
            onClick={() => handleQuantityChange(quantity + 1)}
            disabled={quantity >= (currentInventory?.stock_quantity || 1)}
            className="px-3 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-r-lg transition-colors"
          >
            +
          </button>
        </div>
      </div>
    );

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <ProductGallery color={selectedColor} />

        <div className="space-y-6">
          <div>
            <Badge variant="secondary" className="mb-2">
              {product.category.name}
            </Badge>
            <h1 className="text-3xl font-bold">{product.name}</h1>
            
            <div className="mt-4 flex items-center gap-2">
              <span className="text-2xl font-bold">
                {Math.round(finalPrice).toLocaleString('vi-VN')}đ
              </span>
              {product.discount > 0 && (
                <>
                  <span className="text-gray-500 line-through">
                    {Number(product.base_price).toLocaleString('vi-VN')}đ
                  </span>
                  <Badge variant="destructive">
                    -{product.discount}%
                  </Badge>
                </>
              )}
            </div>
          </div>

          <ColorSelector
            colors={product.colors}
            selectedColor={selectedColor}
            onColorChange={color => {
              setSelectedColor(color);
              setSelectedSize(color.inventory[0]?.size);
              setQuantity(1); // Reset quantity when color changes
            }}
          />

          <SizeSelector
            inventory={selectedColor.inventory}
            selectedSize={selectedSize}
            onSizeChange={(size) => {
              setSelectedSize(size);
              setQuantity(1); // Reset quantity when size changes
            }}
          />

          <div>
            {currentInventory && (
              <>
                {currentInventory.stock_quantity > 0 ? (
                  <Badge variant="success">
                    Còn hàng: {currentInventory.stock_quantity} sản phẩm
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    Hết hàng
                  </Badge>
                )}
              </>
            )}
          </div>

          <QuantitySelector />

          <Card>
            <div className="border-b border-gray-200">
              <div className="flex">
                <TabButton 
                  active={activeTab === 'description'} 
                  onClick={() => setActiveTab('description')}
                >
                  Mô tả sản phẩm
                </TabButton>
                <TabButton 
                  active={activeTab === 'specifications'} 
                  onClick={() => setActiveTab('specifications')}
                >
                  Thông số kỹ thuật
                </TabButton>
              </div>
            </div>
            <CardContent>
              {activeTab === 'description' ? (
                <p className="text-gray-600">{product.description}</p>
              ) : (
                <dl className="divide-y divide-gray-200">
                  {product.specifications && (() => {
                    try {
                      const specs = typeof product.specifications === 'string' 
                        ? JSON.parse(product.specifications) 
                        : product.specifications;
                      
                      return Object.entries(specs || {}).map(([key, value]) => (
                        <div key={key} className="py-2 flex justify-between">
                          <dt className="font-medium text-gray-500 capitalize">{key}</dt>
                          <dd className="text-gray-900">{value}</dd>
                        </div>
                      ));
                    } catch (error) {
                      console.error('Lỗi parse thông số:', error);
                      return null;
                    }
                  })()}
                </dl>
              )}
            </CardContent>
          </Card>

          <Button 
            className="w-full relative"
            disabled={!currentInventory || currentInventory.stock_quantity === 0 || isAddingToCart}
            onClick={handleAddToCart}
          >
            {isAddingToCart ? (
              <>
                <span className="opacity-0">Thêm vào giỏ hàng</span>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              </>
            ) : (
              'Thêm vào giỏ hàng'
            )}
          </Button>

          {currentInventory?.stock_quantity === 0 && (
            <p className="text-red-500 text-sm text-center">
              Sản phẩm đã hết hàng
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <MainLayout title={response?.data?.name || 'Chi tiết sản phẩm'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState error={error} />
        ) : !response?.data ? (
          <NoDataState />
        ) : (
          <ProductContent />
        )}
      </div>
    </MainLayout>
  );
};

export default Detail;