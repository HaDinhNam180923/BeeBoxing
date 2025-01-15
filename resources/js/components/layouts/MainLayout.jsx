// src/components/layouts/MainLayout.jsx
import React from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

const MainLayout = ({ children, title }) => {
  return (
    <AuthenticatedLayout>
      <Head title={title} />
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>
    </AuthenticatedLayout>
  );
};

export default MainLayout;