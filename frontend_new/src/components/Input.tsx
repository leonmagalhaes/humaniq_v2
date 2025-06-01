import React, { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  fullWidth = true,
  className = '',
  ...rest
}) => {
  const widthClass = fullWidth ? 'w-full' : '';
  const errorClass = error ? 'border-red-500 focus:ring-red-500' : 'border-gray-light focus:ring-primary';
  
  return (
    <div className={`mb-4 ${widthClass}`}>
      {label && (
        <label className="block text-white text-sm font-medium mb-2">
          {label}
        </label>
      )}
      <input
        className={`bg-gray-dark border ${errorClass} rounded-lg py-2 px-4 text-white w-full focus:outline-none focus:ring-2 ${className}`}
        {...rest}
      />
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};

export default Input;
