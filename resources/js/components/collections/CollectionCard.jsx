import React from 'react';
import { Link } from '@inertiajs/react';

const CollectionCard = ({ collection }) => {
  return (
    <div className="relative overflow-hidden group rounded-lg">
      <Link href={route('collections.detail', collection.slug)}>
        <div className="aspect-[5/4] overflow-hidden">
          <img
            src={collection.image_url || '/storage/images/collection-placeholder.jpg'}
            alt={collection.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
        
        <div className="absolute bottom-0 left-0 p-4 w-full">
          <h3 className="text-xl font-bold text-white">{collection.name}</h3>
          {collection.description && (
            <p className="text-sm text-white/80 mt-1 line-clamp-2">{collection.description}</p>
          )}
          <div className="mt-3">
            <span className="inline-block px-4 py-2 bg-white font-medium text-sm rounded-full transition-colors group-hover:bg-blue-500 group-hover:text-white">
              Xem bộ sưu tập
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default CollectionCard;