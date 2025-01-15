import React from 'react';

export const Input = ({ 
  type = 'text', 
  placeholder, 
  value, 
  onChange, 
  className = '' 
}) => {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
        focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
        disabled:bg-gray-100 disabled:cursor-not-allowed ${className}`}
    />
  );
};

export const Select = ({
  value,
  onValueChange,
  children,
  className = ''
}) => {
  return (
    <select
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
      className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm
        focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
        disabled:bg-gray-100 disabled:cursor-not-allowed ${className}`}
    >
      {children}
    </select>
  );
};

export const Slider = ({
  min,
  max,
  step,
  value,
  onValueChange,
  className = ''
}) => {
  const [activeHandle, setActiveHandle] = React.useState(null);
  const sliderRef = React.useRef(null);

  const getPercentage = (val) => ((val - min) / (max - min)) * 100;

  const clamp = (val, minVal, maxVal) => Math.min(Math.max(val, minVal), maxVal);

  const getValueFromPosition = (position) => {
    const percentage = position;
    const rawValue = ((max - min) * percentage) + min;
    const steppedValue = Math.round(rawValue / step) * step;
    return clamp(steppedValue, min, max);
  };

  const handleMouseDown = (index, e) => {
    e.stopPropagation();
    setActiveHandle(index);
  };

  const handleTrackMouseDown = (e) => {
    const rect = sliderRef.current.getBoundingClientRect();
    const percentage = (e.clientX - rect.left) / rect.width;
    const newValue = getValueFromPosition(percentage);
    
    const distanceToFirst = Math.abs(newValue - value[0]);
    const distanceToSecond = Math.abs(newValue - value[1]);
    const handleIndex = distanceToFirst < distanceToSecond ? 0 : 1;
    
    const newValues = [...value];
    newValues[handleIndex] = newValue;
    
    if (handleIndex === 0) {
      newValues[0] = Math.min(newValues[0], newValues[1] - step);
    } else {
      newValues[1] = Math.max(newValues[1], newValues[0] + step);
    }
    
    onValueChange(newValues);
  };

  const handleMouseMove = (e) => {
    if (activeHandle === null) return;

    const rect = sliderRef.current.getBoundingClientRect();
    const percentage = clamp((e.clientX - rect.left) / rect.width, 0, 1);
    const newValue = getValueFromPosition(percentage);

    const newValues = [...value];
    newValues[activeHandle] = newValue;

    if (activeHandle === 0) {
      newValues[0] = Math.min(newValues[0], newValues[1] - step);
    } else {
      newValues[1] = Math.max(newValues[1], newValues[0] + step);
    }

    onValueChange(newValues);
  };

  const handleMouseUp = () => {
    setActiveHandle(null);
  };

  React.useEffect(() => {
    if (activeHandle !== null) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [activeHandle, value]);

  return (
    <div className={`relative w-full h-4 ${className}`} ref={sliderRef}>
      <div className="absolute inset-0 flex items-center">
        {/* Track background */}
        <div 
          className="w-full h-1.5 bg-gray-200 rounded-full cursor-pointer"
          onMouseDown={handleTrackMouseDown}
        />
        
        {/* Selected range */}
        <div 
          className="absolute h-1.5 bg-indigo-500 rounded-full"
          style={{
            left: `${getPercentage(value[0])}%`,
            right: `${100 - getPercentage(value[1])}%`
          }}
        />
        
        {/* Handles */}
        {value.map((val, index) => (
          <div
            key={index}
            onMouseDown={(e) => handleMouseDown(index, e)}
            className="absolute w-3 h-3 bg-white border-2 border-indigo-500 
                     rounded-full cursor-pointer shadow hover:scale-110 transition-transform"
            style={{
              left: `${getPercentage(val)}%`,
              top: '50%',
              transform: 'translate(-50%, -50%)'
            }}
          />
        ))}
      </div>
    </div>
  );
};