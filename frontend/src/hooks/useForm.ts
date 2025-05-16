import { useState, ChangeEvent, FormEvent, useCallback } from 'react';

export type ValidationErrors<T> = Partial<Record<keyof T, string>>;

export interface UseFormOptions<T> {
  initialValues: T;
  onSubmit: (values: T) => void | Promise<void>;
  validate?: (values: T) => ValidationErrors<T>;
}

export function useForm<T extends Record<string, any>>({
  initialValues,
  onSubmit,
  validate
}: UseFormOptions<T>) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<ValidationErrors<T>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle input changes
  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (!name) return;
    
    // Handle different input types appropriately
    const inputValue = type === 'checkbox'
      ? (e.target as HTMLInputElement).checked
      : type === 'number'
        ? parseFloat(value)
        : value;
    
    setValues(prev => ({
      ...prev,
      [name]: inputValue
    }));
  }, []);

  // Set a specific field value
  const setValue = useCallback((name: keyof T, value: any) => {
    setValues(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  // Handle blur events to track touched fields
  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name } = e.target;
    
    if (!name) return;
    
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
    
    if (validate) {
      const validationErrors = validate(values);
      setErrors(validationErrors);
    }
  }, [values, validate]);

  // Set all fields as touched (useful before form submission)
  const touchAll = useCallback(() => {
    const touchedFields = Object.keys(values).reduce((acc, key) => {
      acc[key as keyof T] = true;
      return acc;
    }, {} as Record<keyof T, boolean>);
    
    setTouched(touchedFields);
  }, [values]);

  // Reset the form to initial values
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  // Handle form submission
  const handleSubmit = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    
    // Touch all fields to show errors
    touchAll();
    
    // Validate if needed
    if (validate) {
      const validationErrors = validate(values);
      setErrors(validationErrors);
      
      // Don't submit if there are errors
      if (Object.keys(validationErrors).length > 0) {
        return;
      }
    }
    
    setIsSubmitting(true);
    
    try {
      await onSubmit(values);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [values, validate, onSubmit, touchAll]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    setValue,
    resetForm,
    touchAll
  };
}

export default useForm;