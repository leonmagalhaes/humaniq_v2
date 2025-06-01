import React from 'react';

interface ModalProps {
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
    <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 relative">
      <button
        onClick={onClose}
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-2xl font-bold"
        aria-label="Fechar"
        type="button"
      >
        ×
      </button>
      {children}
    </div>
  </div>
);

export default Modal;