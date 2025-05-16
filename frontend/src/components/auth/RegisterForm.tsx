import React from 'react';
import { FiMail, FiLock, FiUser } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { useForm } from '../../hooks';
import { Button, FormInput, ErrorMessage } from '../ui';

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSwitchToLogin }) => {
  const { register, loading, error, clearError } = useAuth();

  const validateForm = (values: { name: string; email: string; password: string }) => {
    const errors: Record<string, string> = {};
    
    if (!values.name) {
      errors.name = 'Name is required';
    }
    
    if (!values.email) {
      errors.email = 'Email is required';
    } else if (!values.email.includes('@')) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!values.password) {
      errors.password = 'Password is required';
    } else {
      // More comprehensive password validation will happen on the server
      // These are just basic frontend validations
      const password = values.password;
      
      if (password.length < 8) {
        errors.password = 'Password must be at least 8 characters long';
      } else {
        let strength = 0;
        
        // Check for uppercase letters
        if (/[A-Z]/.test(password)) strength++;
        
        // Check for lowercase letters
        if (/[a-z]/.test(password)) strength++;
        
        // Check for numbers
        if (/[0-9]/.test(password)) strength++;
        
        // Check for special characters
        if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) strength++;
        
        if (strength < 3) {
          errors.password = 'Password must include a mix of uppercase, lowercase, numbers, and special characters';
        }
      }
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
      name: '',
      email: '',
      password: '',
    },
    validate: validateForm,
    onSubmit: async (values) => {
      clearError();
      try {
        await register(values.email, values.password, values.name);
      } catch (err) {
        // Error is handled by the auth context
      }
    },
  });

  return (
    <div className="w-full">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
        Create a new account
      </h2>
      
      <form className="space-y-6" onSubmit={handleSubmit}>
        <FormInput
          id="name"
          name="name"
          type="text"
          required
          label="Full Name"
          value={values.name}
          onChange={handleChange}
          onBlur={handleBlur}
          leftIcon={<FiUser className="h-5 w-5 text-gray-400" />}
          error={formErrors.name || (error?.field === 'name' ? error.message : undefined)}
          placeholder="John Smith"
        />
        
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
          error={formErrors.email || (error?.field === 'email' ? error.message : undefined)}
          placeholder="you@example.com"
        />
        
        <FormInput
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          label="Password"
          value={values.password}
          onChange={handleChange}
          onBlur={handleBlur}
          leftIcon={<FiLock className="h-5 w-5 text-gray-400" />}
          error={formErrors.password || (error?.field === 'password' ? error.message : undefined)}
          placeholder="Create a password"
          helper="Must be at least 8 characters with a mix of uppercase, lowercase, numbers, and special characters"
        />

        {error && !error.field && (
          <ErrorMessage message={error.message} />
        )}

        <Button
          type="submit"
          variant="primary"
          fullWidth
          isLoading={loading}
        >
          Create account
        </Button>

        <div className="relative pt-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">
              Already have an account?
            </span>
          </div>
        </div>

        <Button
          type="button"
          variant="secondary"
          fullWidth
          onClick={onSwitchToLogin}
        >
          Sign in to existing account
        </Button>
      </form>
    </div>
  );
};

export default RegisterForm;