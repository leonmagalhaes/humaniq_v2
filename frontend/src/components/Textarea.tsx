import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  labelClassName?: string; // Add this line
}

const Textarea: React.FC<TextareaProps> = ({
  label,
  error,
  labelClassName = 'block text-sm font-medium text-gray-200 mb-2', // Add default value
  ...props
}) => (
  <div className="mb-4">
    {label && <label className={labelClassName}>{label}</label>}
    <textarea
      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black ${error ? 'border-red-500' : ''}`}
      {...props}
    />
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

export default Textarea;