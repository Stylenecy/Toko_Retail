// src/components/Modal.jsx
import React from 'react';
import { FiX } from 'react-icons/fi';

function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-xl w-full max-w-lg m-8"
        onClick={(e) => e.stopPropagation()} 
      >
        <div className="flex justify-between items-center p-5 border-b">
          <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600"
          >
            <FiX size={24} />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

export default Modal;