import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useForm } from '@inertiajs/react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';

const UpdateProduct = ({ productId, onSuccess }) => {
    const [categories, setCategories] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [colors, setColors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [specifications, setSpecifications] = useState([]);

    const { data, setData, processing, errors } = useForm({
        name: '',
        description: '',
        base_price: '',
        category_id: '',
        brand: '',
        discount: '0',
        is_featured: false,
        specifications: '{}',
        colors: []
    });

    // Xóa hàm fetchProductData riêng lẻ và tích hợp logic xử lý specifications vào loadInitialData
useEffect(() => {
    const loadInitialData = async () => {
        try {
            // Tải danh mục trước
            const categoriesResponse = await axios.get('/api/categories');
            if (categoriesResponse.data.status === 'success') {
                const categoriesData = categoriesResponse.data.data;
                setCategories(categoriesData);

                // Sau khi có danh mục, tải thông tin sản phẩm
                const productResponse = await axios.get(`/api/product/${productId}`);
                if (productResponse.data.status === 'success') {
                    const product = productResponse.data.data;
                    
                    // Xử lý thông số kỹ thuật từ chuỗi JSON thành mảng các đối tượng
                    let specsArray = [];
                    if (product.specifications && typeof product.specifications === 'object') {
                        specsArray = Object.entries(product.specifications).map(([key, value]) => ({
                            key,
                            value: value.toString()
                        }));
                    }
    
                    
                    // Cập nhật state specifications
                    setSpecifications(specsArray);
                    
                    // Cập nhật form data và các state khác
                    setData({
                        name: product.name,
                        description: product.description,
                        base_price: product.base_price,
                        category_id: product.category_id,
                        brand: product.brand,
                        discount: product.discount,
                        is_featured: product.is_featured,
                        specifications: product.specifications, // Giữ nguyên định dạng JSON string
                        colors: product.colors
                    });

                    setColors(product.colors.map(color => ({
                        ...color,
                        sizes: color.inventory || [],
                        images: color.images || [],
                        imageFiles: []
                    })));

                    // Thiết lập danh mục đã chọn
                    setupSelectedCategories(product.category_id, categoriesData);

                    // Log để debug
                    console.log('Loaded specifications:', specsArray);
                }
            }
        } catch (error) {
            console.error('Không thể tải dữ liệu:', error);
        }
    };

    loadInitialData();
}, [productId]);

    

    // Hàm thiết lập danh mục đã chọn
    const setupSelectedCategories = (categoryId, categoriesList) => {
        // Hàm đệ quy để tìm đường dẫn đến category
        const findCategoryPath = (categories, targetId, currentPath = []) => {
            for (const category of categories) {
                // Kiểm tra category hiện tại
                if (category.id === targetId) {
                    return [...currentPath, category.id];
                }
                
                // Nếu có children, tìm trong children
                if (category.children && category.children.length > 0) {
                    const path = findCategoryPath(category.children, targetId, [...currentPath, category.id]);
                    if (path) return path;
                }
            }
            return null;
        };
    
        // Tìm đường dẫn đến category
        const path = findCategoryPath(categoriesList, categoryId);
        if (path) {
            setSelectedCategories(path);
            setData('category_id', categoryId.toString());
        }
    };

    // Hàm tìm danh mục theo ID
    const findCategoryById = (category, id) => {
        if (category.id === id) return category;
        if (category.children) {
            for (const child of category.children) {
                const found = findCategoryById(child, id);
                if (found) return found;
            }
        }
        return null;
    };

    // Hàm tìm danh mục cha
    const findCategoryWithChild = (category, childId) => {
        if (category.children) {
            for (const child of category.children) {
                if (child.id === childId) return category;
                const found = findCategoryWithChild(child, childId);
                if (found) return found;
            }
        }
        return null;
    };

    // Xử lý khi chọn danh mục
    const handleCategoryChange = (level, value) => {
        const newSelectedCategories = [...selectedCategories.slice(0, level)];
        if (value) {
            newSelectedCategories[level] = parseInt(value, 10);
        }
        setSelectedCategories(newSelectedCategories);

        // Tìm danh mục được chọn
        const selectedCategory = findCategoryById(categories[0], parseInt(value, 10));
        
        // Nếu không có danh mục con thì đây là danh mục cuối
        if (selectedCategory && !selectedCategory.children?.length) {
            setData('category_id', value);
        } else {
            setData('category_id', '');
        }
    };

    // Các hàm xử lý màu sắc và kích thước
    const addColor = () => {
        const newColor = {
            color_name: '',
            color_code: '#000000',
            sizes: [{ size: '', stock_quantity: 0, price_adjustment: 0 }],
            images: [],
            imageFiles: []
        };
        setColors([...colors, newColor]);
    };

    const removeColor = (index) => {
        if (index === 0) return; // Không cho phép xóa màu đầu tiên
        const newColors = colors.filter((_, i) => i !== index);
        setColors(newColors);
        setData('colors', newColors);
    };

    const updateColor = (index, field, value) => {
        const newColors = [...colors];
        newColors[index][field] = value;
        setColors(newColors);
        setData('colors', newColors);
    };

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

    const removeSize = (colorIndex, sizeIndex) => {
        const newColors = [...colors];
        if (newColors[colorIndex].sizes.length > 1) {
            newColors[colorIndex].sizes.splice(sizeIndex, 1);
            setColors(newColors);
            setData('colors', newColors);
        }
    };

    const updateSize = (colorIndex, sizeIndex, field, value) => {
        const newColors = [...colors];
        newColors[colorIndex].sizes[sizeIndex][field] = value;
        setColors(newColors);
        setData('colors', newColors);
    };

    // Xử lý thông số kỹ thuật
    const addSpecification = () => {
        setSpecifications([...specifications, { key: '', value: '' }]);
    };

    const removeSpecification = (index) => {
        const newSpecs = specifications.filter((_, i) => i !== index);
        setSpecifications(newSpecs);
        updateSpecificationsData(newSpecs);
    };

    const updateSpecification = (index, field, value) => {
        const newSpecs = [...specifications];
        newSpecs[index][field] = value;
        setSpecifications(newSpecs);
    
        // Chuyển đổi mảng specifications thành object và sau đó thành JSON string
        const specsObject = newSpecs.reduce((acc, spec) => {
            if (spec.key && spec.value) {
                acc[spec.key] = spec.value;
            }
            return acc;
        }, {});
    
        // Cập nhật form data với chuỗi JSON mới
        setData('specifications', JSON.stringify(specsObject));
    
        // Log để debug
        console.log('Updated specifications:', newSpecs);
        console.log('Specifications JSON:', JSON.stringify(specsObject));
    };

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
        
        // Tạo preview cho ảnh mới
        const imageObjects = imageFiles.map((file, index) => ({
            file,
            preview: URL.createObjectURL(file),
            is_primary: index === 0,
            display_order: index,
            alt_text: file.name || ''
        }));

        // Cập nhật state
        newColors[colorIndex].imageFiles = [
            ...(newColors[colorIndex].imageFiles || []),
            ...imageFiles
        ];
        newColors[colorIndex].images = [
            ...(newColors[colorIndex].images || []),
            ...imageObjects
        ];
        
        setColors(newColors);
        setData('colors', newColors);
    };

    const validateFormData = () => {
        const errors = [];
        
        if (!data.category_id) {
            errors.push('Vui lòng chọn danh mục sản phẩm');
        }
    
        colors.forEach((color, index) => {
            if (!color.color_name) {
                errors.push(`Màu ${index + 1}: Thiếu tên màu`);
            }
            if (!color.color_code) {
                errors.push(`Màu ${index + 1}: Thiếu mã màu`);
            }
            color.sizes.forEach((size, sizeIndex) => {
                if (!size.size) {
                    errors.push(`Màu ${index + 1}, Kích thước ${sizeIndex + 1}: Thiếu tên kích thước`);
                }
            });
        });
    
        return errors;
    };
    // Xử lý submit form
    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validateFormData();
        if (validationErrors.length > 0) {
            alert(validationErrors.join('\n'));
            return;
        }
        setLoading(true);
    
        try {
            // Chuẩn bị dữ liệu trước khi gửi
            const formData = {
                ...data,
                colors: colors.map(color => ({
                    color_id: color.color_id, // Thêm color_id nếu đang cập nhật
                    color_name: color.color_name,
                    color_code: color.color_code,
                    sizes: color.sizes.map(size => ({
                        inventory_id: size.inventory_id, // Thêm inventory_id nếu đang cập nhật
                        size: size.size,
                        stock_quantity: parseInt(size.stock_quantity),
                        price_adjustment: parseFloat(size.price_adjustment) || 0
                    }))
                })),
                specifications: typeof data.specifications === 'string' 
                    ? data.specifications 
                    : JSON.stringify(data.specifications)
            };
    
            console.log('Sending data:', formData);
    
            const productResponse = await axios.post(`/api/product/${productId}/update`, formData);
            
            if (productResponse.data.status === 'success') {
                // Xử lý upload ảnh...
                if (onSuccess) {
                    onSuccess(productResponse.data.data);
                }
            }
        } catch (error) {
            console.error('Validation errors:', error.response?.data?.errors);
            console.error('Không thể cập nhật sản phẩm:', error);
            
            // Hiển thị lỗi cụ thể cho người dùng
            const errorMessages = error.response?.data?.errors;
            if (errorMessages) {
                Object.entries(errorMessages).forEach(([field, messages]) => {
                    console.log(`${field}: ${messages.join(', ')}`);
                });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Form content - Copy phần return từ component cũ nhưng đơn giản hóa className */}
            {/* Thông tin cơ bản */}
            <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="name">Tên sản phẩm</Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={e => setData('name', e.target.value)}
                            error={errors.name}
                        />
                    </div>

                    {/* Danh mục */}
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
                                        <option 
                                            key={category.id} 
                                            value={category.id}
                                        >
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

                    {/* Thương hiệu và giá */}
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

                    {/* Sản phẩm nổi bật */}
                    <div className="flex items-center space-x-2">
                        <Switch
                            id="is_featured"
                            checked={data.is_featured}
                            onCheckedChange={checked => setData('is_featured', checked)}
                        />
                        <Label htmlFor="is_featured">Sản phẩm nổi bật</Label>
                    </div>

                    {/* Thông số kỹ thuật */}
                    {/* Phần thông số kỹ thuật */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <Label>Thông số kỹ thuật</Label>
                            <Button type="button" onClick={addSpecification}>
                                Thêm thông số
                            </Button>
                        </div>
                        {specifications.length === 0 && (
                            <div className="text-gray-500 italic">
                                Chưa có thông số kỹ thuật
                            </div>
                        )}
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

                {/* Mô tả sản phẩm */}
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
                        {/* Thông tin màu */}
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

                        {/* Quản lý kích thước */}
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

                        {/* Quản lý ảnh */}
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
                                            src={image.preview || image.image_url}
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
                                                if (color.imageFiles) {
                                                    newColors[colorIndex].imageFiles = color.imageFiles.filter((_, idx) => idx !== imageIndex);
                                                }
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
                                onClick={() => removeColor(colorIndex)}
                            >
                                Xóa màu này
                            </Button>
                        )}
                    </div>
                ))}
            </div>

            {/* Thông báo lỗi */}
            {Object.keys(errors).length > 0 && (
                <Alert variant="destructive">
                    <AlertDescription>
                        Vui lòng kiểm tra lại thông tin sản phẩm
                    </AlertDescription>
                </Alert>
            )}

            {/* Các nút điều khiển */}
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
                    {loading ? 'Đang xử lý...' : 'Cập nhật sản phẩm'}
                </Button>
            </div>
        </form>
    );
};

export default UpdateProduct;