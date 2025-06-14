import React from 'react';

export default function ShipperLayout({ children, header }) {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="lg:pl-64">
        <main className="py-6">
          <div className="mx-auto px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}