import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Card from '../../../components/ui/Card'

describe('Card Component', () => {
  it('renders children correctly', () => {
    render(
      <Card>
        <div data-testid="card-content">Card Content</div>
      </Card>
    )
    
    expect(screen.getByTestId('card-content')).toBeInTheDocument()
    expect(screen.getByText('Card Content')).toBeInTheDocument()
  })
  
  it('renders with default variant', () => {
    render(<Card>Default Card</Card>)
    
    const card = screen.getByText('Default Card').closest('div')
    expect(card).toHaveClass('bg-white', 'shadow', 'rounded-xl')
  })
  
  it('renders with different variants correctly', () => {
    const { rerender } = render(<Card variant="default">Default</Card>)
    let card = screen.getByText('Default').closest('div')
    expect(card).toHaveClass('bg-white', 'shadow')
    
    rerender(<Card variant="elevated">Elevated</Card>)
    card = screen.getByText('Elevated').closest('div')
    expect(card).toHaveClass('bg-white', 'shadow-lg')
    
    rerender(<Card variant="outlined">Outlined</Card>)
    card = screen.getByText('Outlined').closest('div')
    expect(card).toHaveClass('bg-white', 'border', 'border-gray-100')
  })
  
  it('applies custom className', () => {
    render(<Card className="custom-class">Custom Class</Card>)
    
    const card = screen.getByText('Custom Class').closest('div')
    expect(card).toHaveClass('custom-class')
  })
  
  it('handles onClick events', () => {
    const handleClick = vi.fn()
    render(<Card onClick={handleClick}>Clickable Card</Card>)
    
    const card = screen.getByText('Clickable Card').closest('div')
    expect(card).toHaveClass('cursor-pointer')
    
    fireEvent.click(card as HTMLElement)
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
  
  it('applies hover styles when hover prop is true', () => {
    render(<Card hover>Hoverable Card</Card>)
    
    const card = screen.getByText('Hoverable Card').closest('div')
    expect(card).toHaveClass(
      'transition-all', 
      'duration-300', 
      'hover:shadow-lg', 
      'hover:-translate-y-1', 
      'cursor-pointer'
    )
  })
})