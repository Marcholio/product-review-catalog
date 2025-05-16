import React, { forwardRef } from 'react';

export interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  helper?: string;
}

const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, error, leftIcon, helper, className = '', ...props }, ref) => {
    const baseInputStyles = "appearance-none block w-full border rounded-lg bg-gray-50 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150 ease-in-out";
    const leftIconStyles = leftIcon ? "pl-10" : "pl-4";
    const errorStyles = error ? "border-red-300 focus:ring-red-500" : "border-gray-300";
    const disabledStyles = props.disabled ? "opacity-60 cursor-not-allowed bg-gray-100" : "";
    
    return (
      <div className={className}>
        {label && (
          <label htmlFor={props.id} className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            className={`${baseInputStyles} ${leftIconStyles} ${errorStyles} ${disabledStyles} py-3 pr-4`}
            {...props}
          />
        </div>
        {error ? (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        ) : helper ? (
          <p className="mt-1 text-xs text-gray-500">{helper}</p>
        ) : null}
      </div>
    );
  }
);

FormInput.displayName = 'FormInput';

export default FormInput;