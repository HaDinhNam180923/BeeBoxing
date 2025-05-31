import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useForm } from '@inertiajs/react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function CreateProduct() {
  // Khởi tạo state cho danh mục và danh mục đã chọn
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  
  // Khởi tạo state cho màu sắc với giá trị mặc định
  const [colors, setColors] = useState([{ 
    color_name: '', 
    color_code: '#000000',
    sizes: [{ size: '', stock_quantity: 0, price_adjustment: 0 }],
    images: [], // Giờ sẽ lưu trực tiếp file ảnh thay vì url
    imageFiles: [] // Thêm mảng này để lưu các file ảnh
}]);
  
  // State cho trạng thái loading
  const [loading, setLoading] = useState(false);
  
  // State cho thông số kỹ thuật
  const [specifications, setSpecifications] = useState([
    { key: '', value: '' }
  ]);

  // Khởi tạo form với useForm hook
  const { data, setData, post, processing, errors } = useForm({
    name: '',
    description: '',
    base_price: '',
    category_id: '',
    brand: '',
    discount: '0',
    is_featured: false,
    specifications: '{}',
    colors: colors
  });

  // Lấy dữ liệu danh mục khi component được mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Hàm lấy danh sách danh mục từ API
  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/categories');
      if (response.data.status === 'success') {
        setCategories(response.data.data);
      }
    } catch (error) {
      console.error('Không thể lấy danh sách danh mục:', error);
    }
  };

  // Xử lý khi chọn danh mục
  const handleCategoryChange = (level, value) => {
    // Tìm danh mục được chọn và con của nó
    let currentCategories = categories;
    const newSelectedCategories = [...selectedCategories.slice(0, level)];
    newSelectedCategories[level] = parseInt(value);
    
    // Tìm danh mục con của danh mục đã chọn
    let selectedCategory = null;
    for (let i = 0; i <= level; i++) {
      selectedCategory = currentCategories.find(c => c.id === newSelectedCategories[i]);
      if (selectedCategory) {
        currentCategories = selectedCategory.children || [];
      }
    }

    setSelectedCategories(newSelectedCategories);
    
    // Nếu danh mục không có con, sử dụng làm danh mục cuối cùng
    if (!selectedCategory?.children?.length) {
      setData('category_id', value);
    } else {
      setData('category_id', ''); // Xóa category_id nếu chưa phải danh mục cuối
    }
  };

  // Thêm một màu mới
  const addColor = () => {
    const newColor = { 
      color_name: '', 
      color_code: '#000000', 
      sizes: [{ size: '', stock_quantity: 0, price_adjustment: 0 }],
      images: []
    };
    setColors([...colors, newColor]);
    setData('colors', [...colors, newColor]);
  };

  // Thêm kích thước cho một màu
  const addSize = (colorIndex) => {
    const newColors = [...colors];
    newColors[colorIndex].sizes.push({ 
      size: '', 
      stock_quantity: 0, 
      price_adjustment: 0 
    });
    setColors(newColors);
    setData('colors', newColors);
  };

  // Xóa một kích thước
  const removeSize = (colorIndex, sizeIndex) => {
    const newColors = [...colors];
    newColors[colorIndex].sizes.splice(sizeIndex, 1);
    setColors(newColors);
    setData('colors', newColors);
  };

  // Cập nhật thông tin màu
  const updateColor = (index, field, value) => {
    const newColors = [...colors];
    newColors[index][field] = value;
    setColors(newColors);
    setData('colors', newColors);
  };

  // Cập nhật thông tin kích thước
  const updateSize = (colorIndex, sizeIndex, field, value) => {
    const newColors = [...colors];
    newColors[colorIndex].sizes[sizeIndex][field] = value;
    setColors(newColors);
    setData('colors', newColors);
  };

  // Thêm thông số kỹ thuật mới
  const addSpecification = () => {
    setSpecifications([...specifications, { key: '', value: '' }]);
  };

  // Xóa một thông số kỹ thuật
  const removeSpecification = (index) => {
    const newSpecs = specifications.filter((_, i) => i !== index);
    setSpecifications(newSpecs);
    updateSpecificationsData(newSpecs);
  };

  // Cập nhật một thông số kỹ thuật
  const updateSpecification = (index, field, value) => {
    const newSpecs = [...specifications];
    newSpecs[index][field] = value;
    setSpecifications(newSpecs);
    updateSpecificationsData(newSpecs);
  };

  // Cập nhật dữ liệu thông số kỹ thuật trong form
  const updateSpecificationsData = (specs) => {
    const specsObject = specs.reduce((acc, spec) => {
      if (spec.key && spec.value) {
        acc[spec.key] = spec.value;
      }
      return acc;
    }, {});
    setData('specifications', JSON.stringify(specsObject));
  };

  // Xử lý upload ảnh
  const handleImageUpload = (colorIndex, files) => {
    const newColors = [...colors];
    const imageFiles = Array.from(files);
    
    // Tạo các đối tượng preview cho ảnh
    const imageObjects = imageFiles.map((file, index) => ({
        file: file,
        preview: URL.createObjectURL(file),
        is_primary: index === 0,
        display_order: index,
        alt_text: file.name || ''
    }));

    // Cập nhật state với cả file và preview
    newColors[colorIndex].imageFiles = [...(newColors[colorIndex].imageFiles || []), ...imageFiles];
    newColors[colorIndex].images = [...(newColors[colorIndex].images || []), ...imageObjects];
    
    setColors(newColors);
    setData('colors', newColors);
};
  // Xử lý submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
        // Trước tiên, tạo sản phẩm
        const productResponse = await axios.post('/api/product/create', data);
        
        if (productResponse.data.status === 'success') {
            // Sau khi có product, upload ảnh cho từng màu
            const productData = productResponse.data.data;
            
            // Upload ảnh cho từng màu
            for (let i = 0; i < colors.length; i++) {
                const color = colors[i];
                if (color.imageFiles?.length > 0) {
                    const formData = new FormData();
                    formData.append('color_id', productData.colors[i].color_id);
                    
                    color.imageFiles.forEach((file, index) => {
                        formData.append(`images[${index}]`, file);
                        formData.append(`is_primary[${index}]`, index === 0 ? '1' : '0');
                        formData.append(`display_order[${index}]`, index);
                        formData.append(`alt_text[${index}]`, color.images[index].alt_text || '');
                    });

                    await axios.post('/api/product/images/create', formData, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    });
                }
            }

            // Chuyển hướng sau khi hoàn tất
            window.location.href = '/admin/products';
        }
    } catch (error) {
        console.error('Không thể tạo sản phẩm:', error);
    } finally {
        setLoading(false);
    }
};

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Thêm sản phẩm mới</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            {/* Thông tin cơ bản sản phẩm */}
            <div>
              <Label htmlFor="name">Tên sản phẩm</Label>
              <Input
                id="name"
                value={data.name}
                onChange={e => setData('name', e.target.value)}
                error={errors.name}
              />
            </div>

            {/* Phần chọn danh mục */}
            <div className="space-y-4">
              {categories.length > 0 && (
                <div>
                  <Label>Danh mục chính</Label>
                  <select
                    value={selectedCategories[0] || ''}
                    onChange={(e) => handleCategoryChange(0, e.target.value)}
                    className="w-full rounded-md border border-gray-300 p-2"
                  >
                    <option value="">Chọn danh mục</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {selectedCategories.map((selectedId, index) => {
                let currentCategories = categories;
                for (let i = 0; i <= index; i++) {
                  const category = currentCategories.find(c => c.id === selectedCategories[i]);
                  currentCategories = category?.children || [];
                }

                if (currentCategories.length > 0) {
                  return (
                    <div key={index + 1}>
                      <Label>Danh mục con</Label>
                      <select
                        value={selectedCategories[index + 1] || ''}
                        onChange={(e) => handleCategoryChange(index + 1, e.target.value)}
                        className="w-full rounded-md border border-gray-300 p-2"
                      >
                        <option value="">Chọn danh mục con</option>
                        {currentCategories.map(category => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                }
                return null;
              })}
            </div>

            {/* Thông tin thương hiệu và giá */}
            <div>
              <Label htmlFor="brand">Thương hiệu</Label>
              <Input
                id="brand"
                value={data.brand}
                onChange={e => setData('brand', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="base_price">Giá cơ bản</Label>
                <Input
                  id="base_price"
                  type="number"
                  value={data.base_price}
                  onChange={e => setData('base_price', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="discount">Giảm giá (%)</Label>
                <Input
                  id="discount"
                  type="number"
                  value={data.discount}
                  onChange={e => setData('discount', e.target.value)}
                />
              </div>
            </div>

            {/* Switch sản phẩm nổi bật */}
            <div className="flex items-center space-x-2">
              <Switch
                id="is_featured"
                checked={data.is_featured}
                onCheckedChange={checked => setData('is_featured', checked)}
              />
              <Label htmlFor="is_featured">Sản phẩm nổi bật</Label>
            </div>

            {/* Phần thông số kỹ thuật */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>Thông số kỹ thuật</Label>
                <Button type="button" onClick={addSpecification}>
                  Thêm thông số
                </Button>
              </div>
              {specifications.map((spec, index) => (
                <div key={index} className="grid grid-cols-5 gap-4">
                  <div className="col-span-2">
                    <Input
                      placeholder="Tên thông số"
                      value={spec.key}
                      onChange={(e) => updateSpecification(index, 'key', e.target.value)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      placeholder="Giá trị"
                      value={spec.value}
                      onChange={(e) => updateSpecification(index, 'value', e.target.value)}
                    />
                  </div>
                  <div>
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => removeSpecification(index)}
                    >
                      Xóa
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Phần mô tả sản phẩm */}
          <div>
            <Label htmlFor="description">Mô tả sản phẩm</Label>
            <Textarea
              id="description"
              value={data.description}
              onChange={e => setData('description', e.target.value)}
              className="h-32"
            />
          </div>
        </div>

        {/* Phần màu sắc và kích thước */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Màu sắc và kích thước</h2>
            <Button type="button" onClick={addColor}>Thêm màu mới</Button>
          </div>

          {colors.map((color, colorIndex) => (
            <div key={colorIndex} className="border p-4 rounded-lg space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Tên màu</Label>
                  <Input
                    value={color.color_name}
                    onChange={e => updateColor(colorIndex, 'color_name', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Mã màu</Label>
                  <Input
                    type="color"
                    value={color.color_code}
                    onChange={e => updateColor(colorIndex, 'color_code', e.target.value)}
                  />
                </div>
              </div>

              {/* Phần quản lý kích thước */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">Kích thước</h3>
                  <Button type="button" onClick={() => addSize(colorIndex)}>
                    Thêm kích thước
                  </Button>
                </div>

                {color.sizes.map((size, sizeIndex) => (
                  <div key={sizeIndex} className="grid grid-cols-4 gap-4">
                    <div>
                      <Label>Kích thước</Label>
                      <Input
                        value={size.size}
                        onChange={e => updateSize(colorIndex, sizeIndex, 'size', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Số lượng</Label>
                      <Input
                        type="number"
                        value={size.stock_quantity}
                        onChange={e => updateSize(colorIndex, sizeIndex, 'stock_quantity', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Điều chỉnh giá</Label>
                      <Input
                        type="number"
                        value={size.price_adjustment}
                        onChange={e => updateSize(colorIndex, sizeIndex, 'price_adjustment', parseFloat(e.target.value))}
                        placeholder="VD: 50000"
                      />
                    </div>
                    <div className="flex items-end">
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() => removeSize(colorIndex, sizeIndex)}
                        disabled={color.sizes.length === 1}
                      >
                        Xóa
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Phần upload ảnh cho màu */}
              <div className="space-y-2">
                  <Label>Hình ảnh sản phẩm</Label>
                  <Input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => handleImageUpload(colorIndex, e.target.files)}
                  />
                  <div className="grid grid-cols-4 gap-4 mt-2">
                      {color.images.map((image, imageIndex) => (
                          <div key={imageIndex} className="relative group">
                              <img
                                  src={image.preview} // Sử dụng URL.createObjectURL
                                  alt={image.alt_text}
                                  className="w-full h-24 object-cover rounded"
                              />
                              {image.is_primary && (
                                  <span className="absolute top-0 right-0 bg-blue-500 text-white px-2 py-1 text-xs rounded">
                                      Ảnh chính
                                  </span>
                              )}
                              <span className="absolute bottom-0 right-0 bg-black bg-opacity-50 text-white px-2 py-1 text-xs">
                                  {`#${image.display_order + 1}`}
                              </span>
                              <button
                                  type="button"
                                  onClick={() => {
                                      const newColors = [...colors];
                                      newColors[colorIndex].images = color.images.filter((_, idx) => idx !== imageIndex);
                                      newColors[colorIndex].imageFiles = color.imageFiles.filter((_, idx) => idx !== imageIndex);
                                      setColors(newColors);
                                      setData('colors', newColors);
                                  }}
                                  className="absolute top-0 right-0 hidden group-hover:block bg-red-500 text-white p-1 rounded-full"
                              >
                                  X
                              </button>
                          </div>
                      ))}
                  </div>
              </div>

              {/* Nút xóa màu */}
              {colorIndex > 0 && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    const newColors = colors.filter((_, index) => index !== colorIndex);
                    setColors(newColors);
                    setData('colors', newColors);
                  }}
                >
                  Xóa màu này
                </Button>
              )}
            </div>
          ))}
        </div>

        {/* Hiển thị thông báo lỗi */}
        {Object.keys(errors).length > 0 && (
          <Alert variant="destructive">
            <AlertDescription>
              Vui lòng kiểm tra lại thông tin sản phẩm
            </AlertDescription>
          </Alert>
        )}

        {/* Các nút điều khiển form */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => window.history.back()}
          >
            Hủy
          </Button>
          <Button 
            type="submit"
            disabled={processing || loading}
          >
            {loading ? 'Đang xử lý...' : 'Thêm sản phẩm'}
          </Button>
        </div>
      </form>
    </div>
  );
}