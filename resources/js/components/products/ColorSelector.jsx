// src/components/products/ColorSelector.jsx
import React from 'react';


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

const ColorSelector = ({ colors, selectedColor, onColorChange }) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="font-medium">Màu sắc:</span>
        <Badge variant="outline">{selectedColor.color_name}</Badge>
      </div>
      
      <div className="flex gap-2">
        {colors.map((color) => (
          <button
            key={color.color_id}
            onClick={() => onColorChange(color)}
            className={`w-10 h-10 rounded-full border-2 transition-all
              ${selectedColor.color_id === color.color_id 
                ? 'border-blue-500 scale-110' 
                : 'border-gray-200 hover:scale-105'}`}
            style={{ backgroundColor: color.color_code }}
            title={color.color_name}
          />
        ))}
      </div>
    </div>
  );
};

export default ColorSelector;