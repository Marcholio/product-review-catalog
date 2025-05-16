import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useForm } from '../../hooks/useForm'

describe('useForm hook', () => {
  it('initializes with the provided values', () => {
    const { result } = renderHook(() => 
      useForm({
        initialValues: { name: 'John', email: 'john@example.com' },
        onSubmit: vi.fn(),
      })
    )
    
    expect(result.current.values).toEqual({ name: 'John', email: 'john@example.com' })
    expect(result.current.errors).toEqual({})
    expect(result.current.touched).toEqual({})
    expect(result.current.isSubmitting).toBe(false)
  })
  
  it('updates values on handleChange', () => {
    const { result } = renderHook(() => 
      useForm({
        initialValues: { name: '', email: '' },
        onSubmit: vi.fn(),
      })
    )
    
    act(() => {
      const event = {
        target: {
          name: 'name',
          value: 'John Doe',
        },
      } as React.ChangeEvent<HTMLInputElement>
      
      result.current.handleChange(event)
    })
    
    expect(result.current.values).toEqual({ name: 'John Doe', email: '' })
  })
  
  it('marks field as touched on handleBlur', () => {
    const { result } = renderHook(() => 
      useForm({
        initialValues: { name: '', email: '' },
        onSubmit: vi.fn(),
      })
    )
    
    act(() => {
      const event = {
        target: {
          name: 'email',
        },
      } as React.FocusEvent<HTMLInputElement>
      
      result.current.handleBlur(event)
    })
    
    expect(result.current.touched).toEqual({ email: true })
  })
  
  it('validates fields on blur when validate function is provided', () => {
    const validate = (values: { name: string; email: string }) => {
      const errors: Record<string, string> = {}
      
      if (!values.name) {
        errors.name = 'Name is required'
      }
      
      if (!values.email) {
        errors.email = 'Email is required'
      } else if (!values.email.includes('@')) {
        errors.email = 'Invalid email address'
      }
      
      return errors
    }
    
    const { result } = renderHook(() => 
      useForm({
        initialValues: { name: '', email: 'invalidemail' },
        onSubmit: vi.fn(),
        validate,
      })
    )
    
    act(() => {
      const event = {
        target: { name: 'email' },
      } as React.FocusEvent<HTMLInputElement>
      
      result.current.handleBlur(event)
    })
    
    expect(result.current.errors).toEqual({
      name: 'Name is required',
      email: 'Invalid email address',
    })
  })
  
  it('validates all fields on submission', async () => {
    const onSubmit = vi.fn()
    const validate = vi.fn().mockReturnValue({ name: 'Name is required' })
    
    const { result } = renderHook(() => 
      useForm({
        initialValues: { name: '', email: '' },
        onSubmit,
        validate,
      })
    )
    
    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() } as unknown as React.FormEvent)
    })
    
    expect(validate).toHaveBeenCalledWith({ name: '', email: '' })
    expect(result.current.errors).toEqual({ name: 'Name is required' })
    expect(result.current.touched).toEqual({ name: true, email: true }) // All fields should be touched
    expect(onSubmit).not.toHaveBeenCalled() // onSubmit should not be called if validation fails
  })
  
  it('calls onSubmit if validation passes', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    const validate = vi.fn().mockReturnValue({})
    
    const { result } = renderHook(() => 
      useForm({
        initialValues: { name: 'John Doe', email: 'john@example.com' },
        onSubmit,
        validate,
      })
    )
    
    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() } as unknown as React.FormEvent)
    })
    
    expect(validate).toHaveBeenCalledWith({ name: 'John Doe', email: 'john@example.com' })
    expect(onSubmit).toHaveBeenCalledWith({ name: 'John Doe', email: 'john@example.com' })
    expect(result.current.isSubmitting).toBe(false) // isSubmitting should be false after submission
  })
  
  it('handles isSubmitting state correctly', async () => {
    // Create a delayed onSubmit function
    const onSubmit = vi.fn().mockImplementation(() => {
      return new Promise(resolve => {
        setTimeout(resolve, 1000)
      })
    })
    
    const { result } = renderHook(() => 
      useForm({
        initialValues: { name: 'John' },
        onSubmit,
      })
    )
    
    let submitPromise: Promise<void> | undefined
    
    act(() => {
      submitPromise = result.current.handleSubmit({ preventDefault: vi.fn() } as unknown as React.FormEvent)
    })
    
    // isSubmitting should be true during submission
    expect(result.current.isSubmitting).toBe(true)
    
    // Wait for the submission to complete
    await act(async () => {
      await submitPromise
    })
    
    // isSubmitting should be false after submission
    expect(result.current.isSubmitting).toBe(false)
  })
  
  it('resets the form correctly', () => {
    const { result } = renderHook(() => 
      useForm({
        initialValues: { name: 'John', email: 'john@example.com' },
        onSubmit: vi.fn(),
      })
    )
    
    // First modify some values and set errors/touched
    act(() => {
      result.current.setValue('name', 'Jane')
      result.current.touchAll()
      // We'd also have errors but can't set them directly
    })
    
    expect(result.current.values.name).toBe('Jane')
    expect(result.current.touched).toEqual({ name: true, email: true })
    
    // Now reset the form
    act(() => {
      result.current.resetForm()
    })
    
    // Check if everything is reset
    expect(result.current.values).toEqual({ name: 'John', email: 'john@example.com' })
    expect(result.current.errors).toEqual({})
    expect(result.current.touched).toEqual({})
    expect(result.current.isSubmitting).toBe(false)
  })
})