import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'outline' | 'link';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className = '',
  children,
  disabled,
  ...props
}) => {
  const baseStyles = 'font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center';
  
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  };
  
  const variantStyles = {
    primary: 'bg-white bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700',
    secondary: 'bg-white bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300',
    danger: 'bg-white bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700',
    outline: 'bg-white text-blue-600 border border-blue-500 hover:bg-blue-50',
    link: 'bg-white bg-transparent text-blue-600 hover:text-blue-800 hover:underline',
  };
  
  const widthStyles = fullWidth ? 'w-full' : '';
  const isDisabled = disabled || isLoading;
  const disabledStyles = isDisabled ? 'opacity-60 cursor-not-allowed' : '';
  
  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${widthStyles} ${disabledStyles} ${className}`}
      disabled={isDisabled}
      {...props}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading...
        </>
      ) : (
        <>
          {leftIcon && <span className="mr-2">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="ml-2">{rightIcon}</span>}
        </>
      )}
    </button>
  );
};

export default Button;