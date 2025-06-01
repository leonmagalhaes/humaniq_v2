import React from 'react';

interface InputProps {
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  name: string;
  label?: string;
  error?: string;
  required?: boolean;
  className?: string;
  labelClassName?: string; // Add this line
  maxLength?: number;
  disabled?: boolean;
}

const Input: React.FC<InputProps> = ({
  type = 'text',
  placeholder,
  value,
  onChange,
  name,
  label,
  error,
  required = false,
  className = '',
  labelClassName = 'block text-white mb-2 font-medium', // Add default value
  maxLength,
  disabled = false,
}) => {
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label htmlFor={name} className={labelClassName}>
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        type={type}
        id={name}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        className={`w-full bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg px-4 py-3 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent ${error ? 'border-red-500' : ''} ${className}`}
        maxLength={maxLength}
        disabled={disabled}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default Input;
