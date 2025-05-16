import React from 'react';

export type CardVariant = 'default' | 'elevated' | 'outlined';

interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  className = '',
  onClick,
  hover = false,
}) => {
  const baseStyles = 'rounded-xl overflow-hidden';
  
  const variantStyles = {
    default: 'bg-white shadow',
    elevated: 'bg-white shadow-lg',
    outlined: 'bg-white border border-gray-100',
  };
  
  const hoverStyles = hover
    ? 'transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer'
    : '';
  
  const clickableStyles = onClick ? 'cursor-pointer' : '';
  
  return (
    <div
      className={`${baseStyles} ${variantStyles[variant]} ${hoverStyles} ${clickableStyles} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;