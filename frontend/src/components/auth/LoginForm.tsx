import React from 'react';
import { FiMail, FiLock } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { useForm } from '../../hooks';
import { Button, FormInput, ErrorMessage } from '../ui';

interface LoginFormProps {
  onSwitchToRegister: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToRegister }) => {
  const { login, loading, error, clearError } = useAuth();

  const validateForm = (values: { email: string; password: string }) => {
    const errors: Record<string, string> = {};
    
    if (!values.email) {
      errors.email = 'Email is required';
    } else if (!values.email.includes('@')) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!values.password) {
      errors.password = 'Password is required';
    } else if (values.password.length < 6) {
      errors.password = 'Password must be at least 6 characters long';
    }
    
    return errors;
  };

  const { 
    values, 
    errors: formErrors, 
    handleChange, 
    handleBlur, 
    handleSubmit 
  } = useForm({
    initialValues: {
      email: '',
      password: '',
    },
    validate: validateForm,
    onSubmit: async (values) => {
      clearError();
      try {
        await login(values.email, values.password);
      } catch (err) {
        // Error is handled by the auth context
      }
    },
  });

  return (
    <div className="w-full">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
        Sign in to your account
      </h2>
      
      <form className="space-y-6" onSubmit={handleSubmit}>
        <FormInput
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          label="Email Address"
          value={values.email}
          onChange={handleChange}
          onBlur={handleBlur}
          leftIcon={<FiMail className="h-5 w-5 text-gray-400" />}
          error={formErrors.email}
          placeholder="you@example.com"
        />
        
        <FormInput
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          label="Password"
          value={values.password}
          onChange={handleChange}
          onBlur={handleBlur}
          leftIcon={<FiLock className="h-5 w-5 text-gray-400" />}
          error={formErrors.password}
          placeholder="Your password"
        />

        {error && (
          <ErrorMessage message={error.message} />
        )}

        <Button
          type="submit"
          variant="primary"
          fullWidth
          isLoading={loading}
        >
          Sign in
        </Button>

        <div className="relative pt-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">
              New to Product Catalog?
            </span>
          </div>
        </div>

        <Button
          type="button"
          variant="secondary"
          fullWidth
          onClick={onSwitchToRegister}
        >
          Create a new account
        </Button>
      </form>
    </div>
  );
};

export default LoginForm;