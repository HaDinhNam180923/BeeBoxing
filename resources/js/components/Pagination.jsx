import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const PaginationLink = ({ children, isActive, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-2 rounded-md text-sm font-medium
        ${isActive 
          ? 'bg-indigo-500 text-white hover:bg-indigo-600' 
          : 'text-gray-700 hover:bg-gray-100'
        } focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
    >
      {children}
    </button>
  );
};

export const PaginationItem = ({ children }) => {
  return (
    <div className="mx-1">
      {children}
    </div>
  );
};

export const PaginationPrevious = ({ onClick, disabled }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center px-3 py-2 rounded-md text-sm font-medium
        ${disabled 
          ? 'text-gray-400 cursor-not-allowed' 
          : 'text-gray-700 hover:bg-gray-100'
        } focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
    >
      <ChevronLeft className="w-4 h-4 mr-1" />
      Previous
    </button>
  );
};

export const PaginationNext = ({ onClick, disabled }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center px-3 py-2 rounded-md text-sm font-medium
        ${disabled 
          ? 'text-gray-400 cursor-not-allowed' 
          : 'text-gray-700 hover:bg-gray-100'
        } focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
    >
      Next
      <ChevronRight className="w-4 h-4 ml-1" />
    </button>
  );
};

export const PaginationContent = ({ children }) => {
  return (
    <div className="flex items-center justify-center space-x-1">
      {children}
    </div>
  );
};

export const Pagination = ({ children }) => {
  return (
    <nav className="flex items-center justify-center my-8">
      {children}
    </nav>
  );
};