// resources/js/Components/CartDrawer.jsx
import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Link } from '@inertiajs/react';
import axios from 'axios';

export default function CartDrawer({ isOpen, onClose }) {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);

  // Fetch cart data
  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/cart');
      setCart(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching cart:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchCart();
    }
  }, [isOpen]);

  // Handle quantity update
  const handleQuantityChange = async (itemId, newQuantity) => {
    try {
      await axios.put('/api/cart/quantity', {
        cart_item_id: itemId,
        quantity: newQuantity
      });
      fetchCart(); // Refresh cart data
    } catch (error) {
      alert(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật số lượng');
    }
  };

  // Handle item removal
  const handleRemoveItem = async (itemId) => {
    if (!confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;

    try {
      await axios.delete('/api/cart/item', {
        data: { cart_item_id: itemId }
      });
      fetchCart(); // Refresh cart data
    } catch (error) {
      alert(error.response?.data?.message || 'Có lỗi xảy ra khi xóa sản phẩm');
    }
  };

  // Handle item selection
  const handleSelectItem = (itemId) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
    setSelectAll(newSelected.size === cart?.items?.length);
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(cart?.items?.map(item => item.cart_item_id)));
    }
    setSelectAll(!selectAll);
  };

  // Calculate total of selected items
  const calculateTotal = () => {
    if (!cart?.items) return 0;
    return cart.items
      .filter(item => selectedItems.has(item.cart_item_id))
      .reduce((sum, item) => sum + item.subtotal, 0);
  };

  return (
    <div className={`fixed inset-0 overflow-hidden z-50 ${isOpen ? '' : 'pointer-events-none'}`}>
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${
          isOpen ? 'opacity-50' : 'opacity-0'
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div className={`absolute inset-y-0 right-0 max-w-md w-full bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        {/* Header */}
        <div className="px-4 py-6 bg-gray-50 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">Giỏ hàng</h2>
            <button 
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col h-full">
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : !cart?.items?.length ? (
            <div className="flex-1 flex flex-col items-center justify-center p-4">
              <p className="text-gray-500 mb-4">Giỏ hàng trống</p>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Tiếp tục mua sắm
              </button>
            </div>
          ) : (
            <>
              {/* Items */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-32">  {/* Thêm pb-32 để tạo padding dưới */}
                {/* Select all */}
                <div className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-600">
                    Chọn tất cả ({cart.items.length} sản phẩm)
                  </span>
                </div>

                {/* Cart items */}
                {cart.items.map(item => (
                  <div 
                    key={item.cart_item_id}
                    className="flex space-x-4 border rounded-lg p-4"
                  >
                    <input
                      type="checkbox"
                      checked={selectedItems.has(item.cart_item_id)}
                      onChange={() => handleSelectItem(item.cart_item_id)}
                      className="w-4 h-4 mt-2 text-blue-600 rounded border-gray-300"
                    />
                    
                    <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={item.image_url}
                        alt={item.product_name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1">
                      <h3 className="font-medium text-sm">{item.product_name}</h3>
                      <p className="text-sm text-gray-500">
                        {item.color_name} - {item.size}
                      </p>
                      <p className="text-sm font-medium text-blue-600">
                        {item.unit_price.toLocaleString('vi-VN')}đ
                      </p>

                      <div className="flex items-center mt-2 space-x-4">
                        {/* Quantity selector */}
                        <div className="flex items-center border border-gray-300 rounded">
                          <button
                            onClick={() => handleQuantityChange(item.cart_item_id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="px-2 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                          >
                            -
                          </button>
                          <span className="px-4 py-1 text-sm">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(item.cart_item_id, item.quantity + 1)}
                            disabled={item.quantity >= item.stock_quantity}
                            className="px-2 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                          >
                            +
                          </button>
                        </div>

                        <button
                          onClick={() => handleRemoveItem(item.cart_item_id)}
                          className="text-sm text-red-600 hover:text-red-700"
                        >
                          Xóa
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t p-4 space-y-4 sticky bottom-0 bg-white">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-base">Tổng tiền:</span>
                  <span className="text-xl font-bold text-blue-600">
                    {calculateTotal().toLocaleString('vi-VN')}đ
                  </span>
                </div>

                {selectedItems.size > 0 ? (
                 
                  <button
                      onClick={() => {
                          window.location.href = `/checkout?items=${Array.from(selectedItems).join(',')}`;
                      }}
                      className="w-full py-3 text-center rounded-lg bg-blue-500 text-white hover:bg-blue-600"
                  >
                      Thanh toán ({selectedItems.size} sản phẩm)
                  </button>
                ) : (
                  <button
                    disabled
                    className="w-full py-3 text-center rounded-lg bg-gray-300 text-gray-500 cursor-not-allowed"
                  >
                    Thanh toán (0 sản phẩm)
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}