import React, { useState, useEffect } from 'react';
import { Slider } from '@/components/InputSelectSlider';

const PriceRangeFilter = ({ onPriceChange, initialMin = 0, initialMax = 1000000 }) => {
  const [range, setRange] = useState([initialMin, initialMax]);
  const [debouncedRange, setDebouncedRange] = useState(range);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedRange(range);
      onPriceChange(range);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [range]);

  const handleChange = (values) => {
    setRange(values);
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-900">Khoảng giá</span>
        <span className="text-sm text-gray-600">
          {range[0].toLocaleString('vi-VN')}đ - {range[1].toLocaleString('vi-VN')}đ
        </span>
      </div>
      
      <Slider
        min={0}
        max={10000000}
        step={100000}
        value={range}
        onValueChange={handleChange}
      />
    </div>
  );
};

export default PriceRangeFilter;