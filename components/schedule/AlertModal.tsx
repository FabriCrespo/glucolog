import React from 'react';

interface AlertModalProps {
  isVisible: boolean;
  onClose: () => void;
  title: string;
  message: string;
}

const AlertModal: React.FC<AlertModalProps> = ({ 
  isVisible, 
  onClose, 
  title, 
  message 
}) => {
  if (!isVisible) return null;
  
  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg w-80 text-center">
        <h3 className="text-xl font-semibold mb-4">{title}</h3>
        <p className="mb-4">{message}</p>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-green-500 text-white rounded"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
};

export default AlertModal;