import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ProductCard from '../../../components/products/ProductCard'
import { mockProducts } from '../../mocks/products'

// Mock the ImageWithFallback component
vi.mock('../../../components/ImageWithFallback', () => ({
  default: ({ src, alt, className }: { src: string; alt: string; className: string }) => (
    <img src={src} alt={alt} className={className} data-testid="mock-image" />
  ),
}))

describe('ProductCard Component', () => {
  const mockProduct = mockProducts[0]
  const mockOnClick = vi.fn()
  
  it('renders product information correctly', () => {
    render(
      <ProductCard 
        product={mockProduct}
        onClick={mockOnClick}
      />
    )
    
    // Check if product details are rendered
    expect(screen.getByText(mockProduct.name)).toBeInTheDocument()
    expect(screen.getByText(mockProduct.description)).toBeInTheDocument()
    expect(screen.getByText(`€${Number(mockProduct.price).toFixed(2)}`)).toBeInTheDocument()
    expect(screen.getByText(mockProduct.category)).toBeInTheDocument()
    
    // Check if the image is rendered
    const image = screen.getByTestId('mock-image')
    expect(image).toHaveAttribute('src', mockProduct.imageUrl)
    expect(image).toHaveAttribute('alt', mockProduct.name)
  })
  
  it('shows featured badge for products with rating >= 4.5', () => {
    const featuredProduct = { ...mockProduct, rating: 4.5 }
    const nonFeaturedProduct = { ...mockProduct, rating: 4.4 }
    
    const { rerender } = render(<ProductCard product={featuredProduct} />)
    expect(screen.getByText('Featured')).toBeInTheDocument()
    
    rerender(<ProductCard product={nonFeaturedProduct} />)
    expect(screen.queryByText('Featured')).not.toBeInTheDocument()
  })
  
  it('shows review count when available', () => {
    render(<ProductCard product={mockProduct} />)
    
    expect(screen.getByText(`(${mockProduct.reviewCount})`)).toBeInTheDocument()
  })
  
  it('calls onClick handler with product id when clicked', () => {
    render(
      <ProductCard 
        product={mockProduct}
        onClick={mockOnClick}
      />
    )
    
    // Find the card container and click it
    const card = screen.getByText(mockProduct.name).closest('.group')
    fireEvent.click(card as HTMLElement)
    
    expect(mockOnClick).toHaveBeenCalledWith(mockProduct.id)
  })
  
  it('applies custom className when provided', () => {
    render(
      <ProductCard 
        product={mockProduct}
        className="custom-class"
      />
    )
    
    const card = screen.getByText(mockProduct.name).closest('.group')
    expect(card).toHaveClass('custom-class')
  })
})