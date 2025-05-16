import React from 'react';

interface ErrorMessageProps {
  message: string | null;
  className?: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, className = '' }) => {
  if (!message) return null;
  
  return (
    <div className={`bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center ${className}`} role="alert">
      <svg 
        className="h-5 w-5 text-red-500 mr-2" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
        />
      </svg>
      <span>{message}</span>
    </div>
  );
};

export default ErrorMessage;