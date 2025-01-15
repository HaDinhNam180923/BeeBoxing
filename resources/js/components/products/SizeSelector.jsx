import React from 'react';

const SizeSelector = ({ inventory, selectedSize, onSizeChange }) => {
  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {inventory.map((item) => (
          <div key={item.size} className="text-center flex flex-col justify-end">
            {item.price_adjustment !== 0 && item.price_adjustment !== '0.00' && (
              <div className="relative mb-1">
                <span className="absolute top-1/2 transform -translate-y-1/2 right-[-8px] text-xs px-2 py-1 rounded-full bg-red-100 text-red-800">
                  {Math.round(item.price_adjustment)}%
                </span>
              </div>
            )}
            <button
              onClick={() => onSizeChange(item.size)}
              className={`w-[60px] h-[40px] border rounded font-medium ${
                selectedSize === item.size
                  ? 'border-blue-500 text-blue-500'
                  : 'border-blue-300 text-blue-500 hover:border-blue-400'
              } bg-white ${item.stock_quantity === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={item.stock_quantity === 0}
            >
              {item.size}
            </button>
            {item.stock_quantity === 0 && (
              <p className="text-xs text-red-500 mt-1">Hết hàng</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SizeSelector;
