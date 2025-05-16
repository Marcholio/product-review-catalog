import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Button from '../../../components/ui/Button'

describe('Button Component', () => {
  it('renders correctly with default props', () => {
    render(<Button>Click me</Button>)
    
    const button = screen.getByRole('button', { name: /click me/i })
    expect(button).toBeInTheDocument()
    expect(button).toHaveClass('bg-gradient-to-r', 'from-blue-500', 'to-blue-600')
  })
  
  it('renders different variants correctly', () => {
    const { rerender } = render(<Button variant="primary">Primary</Button>)
    expect(screen.getByRole('button')).toHaveClass('from-blue-500', 'to-blue-600')
    
    rerender(<Button variant="secondary">Secondary</Button>)
    expect(screen.getByRole('button')).toHaveClass('bg-gray-100')
    
    rerender(<Button variant="danger">Danger</Button>)
    expect(screen.getByRole('button')).toHaveClass('from-red-500', 'to-red-600')
    
    rerender(<Button variant="outline">Outline</Button>)
    expect(screen.getByRole('button')).toHaveClass('bg-white', 'text-blue-600')
    
    rerender(<Button variant="link">Link</Button>)
    expect(screen.getByRole('button')).toHaveClass('bg-transparent', 'text-blue-600')
  })
  
  it('renders with different sizes', () => {
    const { rerender } = render(<Button size="sm">Small</Button>)
    expect(screen.getByRole('button')).toHaveClass('px-3', 'py-1.5')
    
    rerender(<Button size="md">Medium</Button>)
    expect(screen.getByRole('button')).toHaveClass('px-4', 'py-2.5')
    
    rerender(<Button size="lg">Large</Button>)
    expect(screen.getByRole('button')).toHaveClass('px-6', 'py-3')
  })
  
  it('handles click events', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
  
  it('does not fire click events when disabled', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick} disabled>Click me</Button>)
    
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).not.toHaveBeenCalled()
  })
  
  it('displays loading state correctly', () => {
    render(<Button isLoading>Submit</Button>)
    
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
    expect(screen.queryByText(/submit/i)).not.toBeInTheDocument()
    
    // Check if there's an SVG for the loading spinner
    const svg = document.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })
  
  it('renders with left and right icons', () => {
    const LeftIcon = () => <span data-testid="left-icon">L</span>
    const RightIcon = () => <span data-testid="right-icon">R</span>
    
    render(
      <Button 
        leftIcon={<LeftIcon />} 
        rightIcon={<RightIcon />}
      >
        With Icons
      </Button>
    )
    
    expect(screen.getByTestId('left-icon')).toBeInTheDocument()
    expect(screen.getByTestId('right-icon')).toBeInTheDocument()
  })
  
  it('applies fullWidth class correctly', () => {
    render(<Button fullWidth>Full Width</Button>)
    expect(screen.getByRole('button')).toHaveClass('w-full')
  })
})