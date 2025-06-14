import { useState, useEffect, useRef } from 'react';
import { Link } from '@inertiajs/react';
import axios from 'axios';

const CategoryMenu = () => {
  const [categories, setCategories] = useState([]);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [isSubMenuVisible, setIsSubMenuVisible] = useState(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('/api/categories');
        setCategories(response.data.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();

    // Cleanup timeout khi component unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleMouseEnter = (categoryId) => {
    // Hủy timeout hiện tại (nếu có)
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    // Cập nhật trạng thái ngay lập tức
    setHoveredCategory(categoryId);
    setIsSubMenuVisible(categoryId);
  };

  const handleMouseLeave = () => {
    // Đặt timeout để ẩn danh mục con sau 300ms
    timeoutRef.current = setTimeout(() => {
      setHoveredCategory(null);
      setIsSubMenuVisible(null);
    }, 300);
  };

  return (
    <div className="flex items-center h-full">
      {categories.map((category) => (
        <div
          key={category.id}
          className="relative h-full"
          onMouseEnter={() => handleMouseEnter(category.id)}
          onMouseLeave={handleMouseLeave}
        >
          <Link
            href={`/products?category_id=${category.id}`}
            className="inline-flex items-center h-full px-4 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-b-2 hover:border-gray-300"
          >
            {category.name}
          </Link>

          {isSubMenuVisible === category.id && category.children && (
            <div
              className="absolute left-0 top-full mt-1 z-50 w-64 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 transition-opacity duration-200"
              style={{ opacity: isSubMenuVisible === category.id ? 1 : 0 }}
            >
              <div className="py-2">
                {category.children.map((child) => (
                  <div key={child.id} className="px-4 py-2">
                    <Link
                      href={`/products?category_id=${child.id}`}
                      className="font-semibold text-sm text-gray-900 hover:text-indigo-600 block"
                    >
                      {child.name}
                    </Link>
                    {child.children && (
                      <div className="mt-2 ml-4 space-y-1">
                        {child.children.map((subChild) => (
                          <Link
                            key={subChild.id}
                            href={`/products?category_id=${subChild.id}`}
                            className="text-sm text-gray-600 hover:text-indigo-600 block py-1"
                          >
                            {subChild.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default CategoryMenu;