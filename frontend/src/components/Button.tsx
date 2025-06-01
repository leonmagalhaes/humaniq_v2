import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'outline' | 'text' | 'secondary';
  className?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  isLoading?: boolean; // Adicionado isLoading
}

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  className = '',
  disabled = false,
  fullWidth = false,
  isLoading = false, // Adicionado isLoading com valor padrão
}) => {
  const baseClasses = 'font-medium py-2 px-6 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary';
  
  const variantClasses = {
    primary: 'bg-secondary text-white hover:bg-opacity-90',
    outline: 'border-2 border-secondary text-secondary hover:bg-secondary hover:bg-opacity-10',
    text: 'text-secondary hover:underline',
    secondary: 'bg-gray-500 text-white hover:bg-gray-600'
  };
  
  const widthClass = fullWidth ? 'w-full' : '';
  const disabledClass = (disabled || isLoading) ? 'opacity-50 cursor-not-allowed' : '';
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`${baseClasses} ${variantClasses[variant]} ${widthClass} ${disabledClass} ${className}`}
    >
      {isLoading ? (
        <span className="flex items-center justify-center">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Carregando...
        </span>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;