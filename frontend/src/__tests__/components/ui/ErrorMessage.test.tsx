import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ErrorMessage from '../../../components/ui/ErrorMessage'

describe('ErrorMessage Component', () => {
  it('renders the error message', () => {
    render(<ErrorMessage message="Something went wrong" />)
    
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })
  
  it('applies custom className', () => {
    render(<ErrorMessage message="Error message" className="custom-class" />)
    
    const errorMessage = screen.getByRole('alert')
    expect(errorMessage).toHaveClass('custom-class')
  })
  
  it('includes an error icon', () => {
    render(<ErrorMessage message="Error with icon" />)
    
    const svg = document.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })
  
  it('returns null when message is null', () => {
    const { container } = render(<ErrorMessage message={null} />)
    
    expect(container.firstChild).toBeNull()
  })
  
  it('returns null when message is an empty string', () => {
    const { container } = render(<ErrorMessage message="" />)
    
    expect(container.firstChild).toBeNull()
  })
})