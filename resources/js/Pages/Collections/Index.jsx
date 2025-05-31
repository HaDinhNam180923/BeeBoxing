import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MainLayout from '@/components/layouts/MainLayout';
import CollectionCard from '@/components/collections/CollectionCard';

const CollectionsIndex = () => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/collections');
        
        if (response.data.status) {
          setCollections(response.data.data);
        }
      } catch (error) {
        console.error('Lỗi khi lấy danh sách bộ sưu tập:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCollections();
  }, []);

  return (
    <MainLayout title="Bộ sưu tập">
      <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Bộ sưu tập</h1>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="aspect-[5/4] bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        ) : collections.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Không có bộ sưu tập nào</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {collections.map(collection => (
              <CollectionCard 
                key={collection.collection_id} 
                collection={collection} 
              />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default CollectionsIndex;