// resources/js/Components/common/Modal.jsx
import React from 'react';

export default function Modal({ 
  open, 
  onClose, 
  children 
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-25 transition-opacity"
        onClick={onClose}
      />
      
      {/* Dialog */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 text-left shadow-xl transition-all">
          {children}
        </div>
      </div>
    </div>
  );
}

// Subcomponents
Modal.Header = function ModalHeader({ children }) {
  return <div className="mb-4">{children}</div>;
};

Modal.Title = function ModalTitle({ children }) {
  return <h3 className="text-lg font-medium text-gray-900">{children}</h3>;
};

Modal.Description = function ModalDescription({ children }) {
  return <p className="mt-2 text-sm text-gray-500">{children}</p>;
};

Modal.Footer = function ModalFooter({ children }) {
  return <div className="mt-4 flex justify-end space-x-3">{children}</div>;
};