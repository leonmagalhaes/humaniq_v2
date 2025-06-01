import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  onClick,
  hoverable = false,
}) => {
  const hoverClass = hoverable ? 'hover:bg-white hover:bg-opacity-10 cursor-pointer' : '';
  
  return (
    <div 
      className={`bg-white bg-opacity-5 backdrop-blur-sm rounded-xl p-6 shadow-lg transition-all ${hoverClass} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;
