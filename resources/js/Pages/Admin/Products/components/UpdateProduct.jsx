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
    const [formErrors, setFormErrors] = useState({});

    const { data, setData, processing } = useForm({
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

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const categoriesResponse = await axios.get('/api/categories');
                if (categoriesResponse.data.status === 'success') {
                    const categoriesData = categoriesResponse.data.data;
                    setCategories(categoriesData);

                    const productResponse = await axios.get(`/api/product/${productId}`);
                    if (productResponse.data.status === 'success') {
                        const product = productResponse.data.data;

                        let specsArray = [];
                        if (product.specifications && typeof product.specifications === 'object') {
                            specsArray = Object.entries(product.specifications).map(([key, value]) => ({
                                key,
                                value: value.toString()
                            }));
                        }

                        setSpecifications(specsArray);

                        setData({
                            name: product.name,
                            description: product.description,
                            base_price: product.base_price.toString(),
                            category_id: product.category_id.toString(),
                            brand: product.brand,
                            discount: product.discount.toString(),
                            is_featured: product.is_featured,
                            specifications: JSON.stringify(product.specifications || {}),
                            colors: product.colors
                        });

                        setColors(product.colors.map(color => ({
                            color_id: color.color_id,
                            color_name: color.color_name,
                            color_code: color.color_code,
                            sizes: color.inventory.map(inv => ({
                                inventory_id: inv.inventory_id,
                                size: inv.size,
                                stock_quantity: inv.stock_quantity,
                                price_adjustment: inv.price_adjustment
                            })),
                            images: color.images || [],
                            imageFiles: []
                        })));

                        setupSelectedCategories(product.category_id, categoriesData);
                    }
                }
            } catch (error) {
                console.error('Không thể tải dữ liệu:', error);
                setFormErrors({ general: 'Không thể tải dữ liệu sản phẩm' });
            }
        };

        loadInitialData();
    }, [productId]);

    const setupSelectedCategories = (categoryId, categoriesList) => {
        const findCategoryPath = (categories, targetId, currentPath = []) => {
            for (const category of categories) {
                if (category.id === targetId) {
                    return [...currentPath, category.id];
                }
                if (category.children && category.children.length > 0) {
                    const path = findCategoryPath(category.children, targetId, [...currentPath, category.id]);
                    if (path) return path;
                }
            }
            return null;
        };

        const path = findCategoryPath(categoriesList, categoryId);
        if (path) {
            setSelectedCategories(path);
            setData('category_id', categoryId.toString());
        }
    };

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

    const handleCategoryChange = (level, value) => {
        const newSelectedCategories = [...selectedCategories.slice(0, level)];
        if (value) {
            newSelectedCategories[level] = parseInt(value, 10);
        }
        setSelectedCategories(newSelectedCategories);

        const selectedCategory = findCategoryById(categories[0], parseInt(value, 10));
        if (selectedCategory && !selectedCategory.children?.length) {
            setData('category_id', value);
        } else {
            setData('category_id', '');
        }
    };

    const addColor = () => {
        const newColor = {
            color_name: '',
            color_code: '#000000',
            sizes: [{ size: '', stock_quantity: 0, price_adjustment: 0 }],
            images: [],
            imageFiles: []
        };
        setColors([...colors, newColor]);
        setData('colors', [...colors, newColor]);
    };

    const removeColor = (index) => {
        if (index === 0) return;
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
        if (field === 'stock_quantity') {
            newColors[colorIndex].sizes[sizeIndex][field] = parseInt(value) || 0;
        } else if (field === 'price_adjustment') {
            newColors[colorIndex].sizes[sizeIndex][field] = parseFloat(value) || 0;
        } else {
            newColors[colorIndex].sizes[sizeIndex][field] = value;
        }
        setColors(newColors);
        setData('colors', newColors);
    };

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
        updateSpecificationsData(newSpecs);
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

    const handleImageUpload = (colorIndex, files) => {
        const newColors = [...colors];
        const imageFiles = Array.from(files);

        const imageObjects = imageFiles.map((file, index) => ({
            file,
            preview: URL.createObjectURL(file),
            is_primary: index === 0 && newColors[colorIndex].images.length === 0,
            display_order: newColors[colorIndex].images.length + index,
            alt_text: file.name || ''
        }));

        newColors[colorIndex].imageFiles = [
            ...(newColors[colorIndex].imageFiles || []),
            ...imageFiles
        ];
        newColors[colorIndex].images = [
            ...(newColors[colorIndex].images || []),
            ...imageObjects
        ];

        console.log(`Images added to color ${colorIndex}:`, newColors[colorIndex].imageFiles);
        setColors(newColors);
        setData('colors', newColors);
    };

    const handleRemoveImage = async (colorIndex, imageIndex) => {
        const newColors = [...colors];
        const image = newColors[colorIndex].images[imageIndex];

        if (image.image_id) {
            // Ảnh cũ từ database, gọi API xóa
            try {
                console.log(`Deleting image with image_id: ${image.image_id}`);
                const response = await axios.delete(`/api/product/image/${image.image_id}`);
                console.log(`Delete image response:`, response.data);
            } catch (error) {
                console.error(`Error deleting image ${image.image_id}:`, error);
                setFormErrors({
                    ...formErrors,
                    general: `Không thể xóa ảnh: ${error.response?.data?.message || error.message}`
                });
                return;
            }
        }

        // Xóa ảnh khỏi state
        newColors[colorIndex].images = newColors[colorIndex].images.filter((_, idx) => idx !== imageIndex);
        if (newColors[colorIndex].imageFiles) {
            newColors[colorIndex].imageFiles = newColors[colorIndex].imageFiles.filter((_, idx) => idx !== imageIndex);
        }
        setColors(newColors);
        setData('colors', newColors);
    };

    const validateFormData = () => {
        const validationErrors = [];

        if (!data.name) validationErrors.push('Vui lòng nhập tên sản phẩm');
        if (!data.description) validationErrors.push('Vui lòng nhập mô tả sản phẩm');
        if (!data.base_price || data.base_price <= 0) validationErrors.push('Vui lòng nhập giá cơ bản hợp lệ');
        if (!data.category_id) validationErrors.push('Vui lòng chọn danh mục sản phẩm');
        if (!data.brand) validationErrors.push('Vui lòng nhập thương hiệu');

        if (!colors.length) validationErrors.push('Vui lòng thêm ít nhất một màu sắc');
        colors.forEach((color, index) => {
            if (!color.color_name) validationErrors.push(`Màu ${index + 1}: Thiếu tên màu`);
            if (!color.color_code) validationErrors.push(`Màu ${index + 1}: Thiếu mã màu`);
            if (!color.sizes.length) validationErrors.push(`Màu ${index + 1}: Thiếu kích thước`);
            color.sizes.forEach((size, sizeIndex) => {
                if (!size.size) validationErrors.push(`Màu ${index + 1}, Kích thước ${sizeIndex + 1}: Thiếu tên kích thước`);
                if (isNaN(size.stock_quantity) || size.stock_quantity < 0) {
                    validationErrors.push(`Màu ${index + 1}, Kích thước ${sizeIndex + 1}: Số lượng không hợp lệ`);
                }
            });
        });

        return validationErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validateFormData();
        if (validationErrors.length > 0) {
            setFormErrors({ general: validationErrors.join('; ') });
            return;
        }

        setLoading(true);
        setFormErrors({});

        try {
            const formData = {
                name: data.name,
                description: data.description,
                base_price: parseFloat(data.base_price),
                category_id: parseInt(data.category_id),
                brand: data.brand,
                discount: parseFloat(data.discount) || 0,
                is_featured: data.is_featured,
                specifications: data.specifications,
                colors: colors.map(color => ({
                    color_id: color.color_id,
                    color_name: color.color_name,
                    color_code: color.color_code,
                    sizes: color.sizes.map(size => ({
                        inventory_id: size.inventory_id,
                        size: size.size,
                        stock_quantity: parseInt(size.stock_quantity) || 0,
                        price_adjustment: parseFloat(size.price_adjustment) || 0
                    }))
                }))
            };

            console.log('Sending product update payload:', JSON.stringify(formData, null, 2));

            const productResponse = await axios.post(`/api/product/${productId}/update`, formData);

            if (productResponse.data.status === 'success') {
                const productData = productResponse.data.data;

                console.log('Updated product colors:', productData.colors);

                for (let i = 0; i < colors.length; i++) {
                    const color = colors[i];
                    if (color.imageFiles?.length > 0) {
                        const imageFormData = new FormData();
                        const colorId = color.color_id || productData.colors.find(c => c.color_name === color.color_name)?.color_id;
                        if (!colorId) {
                            throw new Error(`Không tìm thấy color_id cho màu ${color.color_name}`);
                        }

                        imageFormData.append('color_id', colorId);

                        color.imageFiles.forEach((file, index) => {
                            imageFormData.append(`images[${index}]`, file);
                            imageFormData.append(`is_primary[${index}]`, index === 0 && color.images.length === 0 ? '1' : '0');
                            imageFormData.append(`display_order[${index}]`, color.images.length + index);
                            imageFormData.append(`alt_text[${index}]`, color.images[color.images.length + index]?.alt_text || file.name);
                        });

                        console.log(`Uploading images for color ${color.color_name} (color_id: ${colorId})`);

                        try {
                            const imageResponse = await axios.post('/api/product/images/create', imageFormData, {
                                headers: { 'Content-Type': 'multipart/form-data' }
                            });
                            console.log(`Image upload response for color ${color.color_name}:`, imageResponse.data);
                        } catch (imageError) {
                            console.error(`Error uploading images for color ${color.color_name}:`, imageError);
                            throw new Error(`Không thể upload ảnh cho màu ${color.color_name}: ${imageError.response?.data?.message || imageError.message}`);
                        }
                    }
                }

                if (onSuccess) {
                    onSuccess(productData);
                }
            }
        } catch (error) {
            console.error('Error updating product:', error);
            const errorMessages = error.response?.data?.errors || { general: error.message || 'Không thể cập nhật sản phẩm' };
            setFormErrors(errorMessages);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Cập nhật sản phẩm</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                {formErrors.general && (
                    <Alert variant="destructive">
                        <AlertDescription>{formErrors.general}</AlertDescription>
                    </Alert>
                )}

                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="name">Tên sản phẩm</Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={e => setData('name', e.target.value)}
                                error={formErrors.name}
                            />
                            {formErrors.name && <p className="text-red-500 text-sm">{formErrors.name}</p>}
                        </div>

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
                                    {formErrors.category_id && (
                                        <p className="text-red-500 text-sm">{formErrors.category_id}</p>
                                    )}
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

                        <div>
                            <Label htmlFor="brand">Thương hiệu</Label>
                            <Input
                                id="brand"
                                value={data.brand}
                                onChange={e => setData('brand', e.target.value)}
                                error={formErrors.brand}
                            />
                            {formErrors.brand && <p className="text-red-500 text-sm">{formErrors.brand}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="base_price">Giá cơ bản</Label>
                                <Input
                                    id="base_price"
                                    type="number"
                                    value={data.base_price}
                                    onChange={e => setData('base_price', e.target.value)}
                                    error={formErrors.base_price}
                                />
                                {formErrors.base_price && <p className="text-red-500 text-sm">{formErrors.base_price}</p>}
                            </div>
                            <div>
                                <Label htmlFor="discount">Giảm giá (%)</Label>
                                <Input
                                    id="discount"
                                    type="number"
                                    value={data.discount}
                                    onChange={e => setData('discount', e.target.value)}
                                    error={formErrors.discount}
                                />
                                {formErrors.discount && <p className="text-red-500 text-sm">{formErrors.discount}</p>}
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Switch
                                id="is_featured"
                                checked={data.is_featured}
                                onCheckedChange={checked => setData('is_featured', checked)}
                            />
                            <Label htmlFor="is_featured">Sản phẩm nổi bật</Label>
                        </div>

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

                    <div>
                        <Label htmlFor="description">Mô tả sản phẩm</Label>
                        <Textarea
                            id="description"
                            value={data.description}
                            onChange={e => setData('description', e.target.value)}
                            className="h-32"
                            error={formErrors.description}
                        />
                        {formErrors.description && <p className="text-red-500 text-sm">{formErrors.description}</p>}
                    </div>
                </div>

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
                                        error={formErrors[`colors.${colorIndex}.color_name`]}
                                    />
                                    {formErrors[`colors.${colorIndex}.color_name`] && (
                                        <p className="text-red-500 text-sm">{formErrors[`colors.${colorIndex}.color_name`]}</p>
                                    )}
                                </div>
                                <div>
                                    <Label>Mã màu</Label>
                                    <Input
                                        type="color"
                                        value={color.color_code}
                                        onChange={e => updateColor(colorIndex, 'color_code', e.target.value)}
                                        error={formErrors[`colors.${colorIndex}.color_code`]}
                                    />
                                    {formErrors[`colors.${colorIndex}.color_code`] && (
                                        <p className="text-red-500 text-sm">{formErrors[`colors.${colorIndex}.color_code`]}</p>
                                    )}
                                </div>
                            </div>

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
                                                error={formErrors[`colors.${colorIndex}.sizes.${sizeIndex}.size`]}
                                            />
                                            {formErrors[`colors.${colorIndex}.sizes.${sizeIndex}.size`] && (
                                                <p className="text-red-500 text-sm">{formErrors[`colors.${colorIndex}.sizes.${sizeIndex}.size`]}</p>
                                            )}
                                        </div>
                                        <div>
                                            <Label>Số lượng</Label>
                                            <Input
                                                type="number"
                                                value={size.stock_quantity}
                                                onChange={e => updateSize(colorIndex, sizeIndex, 'stock_quantity', e.target.value)}
                                                error={formErrors[`colors.${colorIndex}.sizes.${sizeIndex}.stock_quantity`]}
                                            />
                                            {formErrors[`colors.${colorIndex}.sizes.${sizeIndex}.stock_quantity`] && (
                                                <p className="text-red-500 text-sm">{formErrors[`colors.${colorIndex}.sizes.${sizeIndex}.stock_quantity`]}</p>
                                            )}
                                        </div>
                                        <div>
                                            <Label>Điều chỉnh giá</Label>
                                            <Input
                                                type="number"
                                                value={size.price_adjustment}
                                                onChange={e => updateSize(colorIndex, sizeIndex, 'price_adjustment', parseFloat(e.target.value))}
                                                placeholder="VD: 50000"
                                                error={formErrors[`colors.${colorIndex}.sizes.${sizeIndex}.price_adjustment`]}
                                            />
                                            {formErrors[`colors.${colorIndex}.sizes.${sizeIndex}.price_adjustment`] && (
                                                <p className="text-red-500 text-sm">{formErrors[`colors.${colorIndex}.sizes.${sizeIndex}.price_adjustment`]}</p>
                                            )}
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
                                                onClick={() => handleRemoveImage(colorIndex, imageIndex)}
                                                className="absolute top-0 right-0 hidden group-hover:block bg-red-500 text-white p-1 rounded-full"
                                            >
                                                X
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

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
        </div>
    );
};

export default UpdateProduct;