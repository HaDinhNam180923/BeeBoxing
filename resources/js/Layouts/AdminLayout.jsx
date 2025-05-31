import React from 'react';

export default function AdminLayout({ children, header }) {

  return (
    <div className="min-h-screen bg-gray-100">

      <div className="lg:pl-64">
        {/* {header && (
          <header className="bg-white shadow">
            <div className="mx-auto px-4 py-6 sm:px-6 lg:px-8">
              {header}
            </div>
          </header>
        )} */}

        <main className="py-6">
          <div className="mx-auto px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}