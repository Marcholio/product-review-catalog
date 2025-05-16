import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import FormInput from '../../../components/ui/FormInput'

describe('FormInput Component', () => {
  it('renders correctly with default props', () => {
    render(<FormInput id="test-input" name="test" />)
    
    const input = screen.getByRole('textbox')
    expect(input).toBeInTheDocument()
    expect(input).toHaveAttribute('id', 'test-input')
    expect(input).toHaveAttribute('name', 'test')
  })
  
  it('renders label when provided', () => {
    render(<FormInput id="name" label="Your Name" />)
    
    expect(screen.getByText('Your Name')).toBeInTheDocument()
    expect(screen.getByLabelText('Your Name')).toBeInTheDocument()
  })
  
  it('shows error message when error is provided', () => {
    render(<FormInput id="email" error="Invalid email address" />)
    
    expect(screen.getByText('Invalid email address')).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toHaveClass('border-red-300')
  })
  
  it('shows helper text when provided and no error', () => {
    render(<FormInput id="password" helper="Must be at least 8 characters" />)
    
    expect(screen.getByText('Must be at least 8 characters')).toBeInTheDocument()
  })
  
  it('renders left icon when provided', () => {
    const LeftIcon = () => <span data-testid="left-icon">📧</span>
    
    render(<FormInput id="email" leftIcon={<LeftIcon />} />)
    
    expect(screen.getByTestId('left-icon')).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toHaveClass('pl-10')
  })
  
  it('handles value changes', () => {
    const handleChange = vi.fn()
    
    render(
      <FormInput 
        id="firstName" 
        value="John" 
        onChange={handleChange} 
      />
    )
    
    const input = screen.getByRole('textbox')
    expect(input).toHaveValue('John')
    
    fireEvent.change(input, { target: { value: 'Jane' } })
    expect(handleChange).toHaveBeenCalledTimes(1)
  })
  
  it('applies disabled styles when disabled', () => {
    render(<FormInput id="disabled-input" disabled />)
    
    const input = screen.getByRole('textbox')
    expect(input).toBeDisabled()
    expect(input).toHaveClass('opacity-60', 'cursor-not-allowed', 'bg-gray-100')
  })
  
  it('applies custom className to the container', () => {
    render(<FormInput id="styled-input" className="custom-class" />)
    
    const container = screen.getByRole('textbox').closest('div')?.parentElement
    expect(container).toHaveClass('custom-class')
  })
})