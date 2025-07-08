import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import GuestLayout from '@/Layouts/GuestLayout';
import ProductCard from '@/components/products/ProductCard';

const CollectionDetail = ({ auth, slug }) => {
  const [collection, setCollection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Select layout based on authentication status
  const Layout = auth.user ? AuthenticatedLayout : GuestLayout;

  useEffect(() => {
    const fetchCollectionDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await axios.get(`/api/collections/${slug}`);
        
        if (response.data.status) {
          setCollection(response.data.data);
        }
      } catch (error) {
        console.error('Lỗi khi lấy chi tiết bộ sưu tập:', error);
        setError('Không thể tải thông tin bộ sưu tập. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };
    
    if (slug) {
      fetchCollectionDetail();
    }
  }, [slug]);

  if (loading) {
    return (
      <Layout title="Đang tải...">
        <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-12 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="h-6 bg-gray-200 rounded w-2/3 mb-10"></div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <div key={i} className="aspect-square bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Lỗi">
        <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-red-600 mb-4">
              Đã xảy ra lỗi
            </h2>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!collection) {
    return (
      <Layout title="Không tìm thấy">
        <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-600 mb-4">
              Không tìm thấy bộ sưu tập
            </h2>
            <p className="text-gray-500">Bộ sưu tập này không tồn tại hoặc đã bị xóa</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={collection.name}>
      <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          {collection.image_url && (
            <img 
              src={collection.image_url} 
              alt={collection.name} 
              className="w-full h-64 mx-auto mb-6 rounded-lg object-cover"
            />
          )}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{collection.name}</h1>
          {collection.description && (
            <p className="text-gray-600 max-w-3xl">{collection.description}</p>
          )}
        </div>
        
        {collection.products && collection.products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 justify-items-center">
            {collection.products.map(product => (
              <ProductCard 
                key={product.product_id} 
                product={product} 
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">Không có sản phẩm nào trong bộ sưu tập này</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CollectionDetail;