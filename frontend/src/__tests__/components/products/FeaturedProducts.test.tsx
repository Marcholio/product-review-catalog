import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import FeaturedProducts from '../../../components/products/FeaturedProducts'
import { mockProducts } from '../../mocks/products'

// Mock the ProductCard component
vi.mock('../../../components/products/ProductCard', () => ({
  default: ({ product, isFeatured, onClick, className }: { 
    product: any; 
    isFeatured?: boolean; 
    onClick?: (id: string) => void;
    className?: string;
  }) => (
    <div 
      data-testid={`product-card-${product.id}`}
      data-is-featured={isFeatured}
      data-classname={className}
      onClick={() => onClick?.(product.id)}
    >
      ProductCard: {product.name}
    </div>
  ),
}))

describe('FeaturedProducts Component', () => {
  const mockOnProductClick = vi.fn()
  
  it('renders featured products correctly', () => {
    // Products with rating >= 4.5 are considered featured
    const featuredProducts = mockProducts.filter(p => p.rating >= 4.5)
    
    render(
      <FeaturedProducts 
        products={mockProducts}
        onProductClick={mockOnProductClick}
      />
    )
    
    // Check if the component title is displayed
    expect(screen.getByText('Featured Products')).toBeInTheDocument()
    
    // Check if it only renders the featured products (rating >= 4.5)
    featuredProducts.forEach(product => {
      expect(screen.getByTestId(`product-card-${product.id}`)).toBeInTheDocument()
      expect(screen.getByText(`ProductCard: ${product.name}`)).toBeInTheDocument()
    })
    
    // Make sure that non-featured products are not rendered
    const nonFeaturedProducts = mockProducts.filter(p => p.rating < 4.5)
    nonFeaturedProducts.forEach(product => {
      expect(screen.queryByTestId(`product-card-${product.id}`)).not.toBeInTheDocument()
    })
  })
  
  it('returns null when no featured products exist', () => {
    // Create products with ratings < 4.5
    const nonFeaturedProducts = mockProducts.map(p => ({ ...p, rating: 4.0 }))
    
    const { container } = render(
      <FeaturedProducts 
        products={nonFeaturedProducts}
        onProductClick={mockOnProductClick}
      />
    )
    
    // The component should not render anything
    expect(container.firstChild).toBeNull()
    expect(screen.queryByText('Featured Products')).not.toBeInTheDocument()
  })
  
  it('passes correct props to ProductCard components', () => {
    render(
      <FeaturedProducts 
        products={mockProducts}
        onProductClick={mockOnProductClick}
      />
    )
    
    // Check if featured products are passed the correct props
    const featuredProducts = mockProducts.filter(p => p.rating >= 4.5)
    featuredProducts.forEach(product => {
      const card = screen.getByTestId(`product-card-${product.id}`)
      expect(card).toHaveAttribute('data-is-featured', 'true')
      expect(card).toHaveAttribute('data-classname', 'shadow-md hover:shadow-lg')
    })
  })
  
  it('limits the number of featured products to 4', () => {
    // Create more than 4 featured products
    const manyFeaturedProducts = [
      ...mockProducts,
      ...mockProducts.map(p => ({ ...p, id: `${p.id}-copy`, rating: 5 }))
    ]
    
    render(
      <FeaturedProducts 
        products={manyFeaturedProducts}
        onProductClick={mockOnProductClick}
      />
    )
    
    // Only 4 featured products should be rendered
    const renderedCards = screen.getAllByTestId(/product-card-/)
    expect(renderedCards.length).toBe(4)
  })
})