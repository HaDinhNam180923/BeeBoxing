import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CollectionCard from './CollectionCard';

const FeaturedCollections = () => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/collections/featured');
        
        if (response.data.status) {
          setCollections(response.data.data);
        }
      } catch (error) {
        console.error('Lỗi khi lấy bộ sưu tập:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCollections();
  }, []);

  if (loading) {
    return (
      <div className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse flex flex-col space-y-4">
            <div className="h-10 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="aspect-[5/4] bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!collections || collections.length === 0) {
    return null;
  }

  return (
    <div className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Bộ sưu tập nổi bật</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {collections.map(collection => (
            <CollectionCard 
              key={collection.collection_id} 
              collection={collection} 
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeaturedCollections;