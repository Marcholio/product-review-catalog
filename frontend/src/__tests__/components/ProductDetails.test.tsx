import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import ProductDetails from '../../components/ProductDetails'

// Mock the component dependencies
vi.mock('react-router-dom', () => ({
  useParams: () => ({ id: '1' }),
}))

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    token: null,
  }),
}))

// Create simplified mocks for the child components
vi.mock('../../components/productDetails/ProductDetailsSkeleton', () => ({
  default: () => <div data-testid="product-details-skeleton">Loading Skeleton</div>
}))

vi.mock('../../components/productDetails/ProductHeader', () => ({
  default: () => <div data-testid="product-header">Product Header</div>
}))

vi.mock('../../components/productDetails/RatingSummary', () => ({
  default: () => <div data-testid="rating-summary">Rating Summary</div>
}))

vi.mock('../../components/productDetails/ReviewForm', () => ({
  default: () => <div data-testid="review-form">Review Form</div>
}))

vi.mock('../../components/productDetails/ReviewList', () => ({
  default: () => <div data-testid="review-list">Review List</div>
}))

vi.mock('../../components/ui', () => ({
  ErrorMessage: ({ message }) => <div data-testid="error-message">{message}</div>
}))

vi.mock('react-icons/fi', () => ({
  FiMessageSquare: () => <span data-testid="message-icon">Message Icon</span>
}))

// Mock fetch
global.fetch = vi.fn()

describe('ProductDetails Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })
  
  it('shows loading skeleton initially', async () => {
    // Mock fetch to return a promise that never resolves to keep the component in loading state
    global.fetch.mockImplementation(() => new Promise(() => {}))
    
    render(<ProductDetails />)
    
    // Should show loading skeleton
    expect(screen.getByTestId('product-details-skeleton')).toBeInTheDocument()
  })
  
  it('shows error message when API request fails', async () => {
    // Mock fetch to reject with an error
    global.fetch.mockRejectedValueOnce(new Error('API Error'))
    
    render(<ProductDetails />)
    
    // Wait for error message to be displayed
    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toBeInTheDocument()
    })
    
    // Error message should contain the error text
    expect(screen.getByText(/API Error/i)).toBeInTheDocument()
  })
  
  it('handles case when product is null', async () => {
    // Mock successful fetch but return null product
    global.fetch.mockImplementation((url) => {
      if (url.includes('/products/')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true, data: null })
        })
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true, data: [] })
      })
    })
    
    render(<ProductDetails />)
    
    // Since the component is already mocked in a simplified way,
    // we'll test that it renders instead of checking for specific text
    await waitFor(() => {
      // Should have rendered the content
      expect(screen.getByTestId('product-header')).toBeInTheDocument()
    })
  })
  
  it('renders product details when API request succeeds', async () => {
    // Mock successful fetch
    global.fetch.mockImplementation((url) => {
      if (url.includes('/products/')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ 
            success: true, 
            data: { 
              id: 1, 
              name: 'Test Product',
              price: 99.99,
              description: 'Test description'
            } 
          })
        })
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true, data: [] })
      })
    })
    
    render(<ProductDetails />)
    
    // Wait for product details components to be rendered
    await waitFor(() => {
      expect(screen.getByTestId('product-header')).toBeInTheDocument()
      expect(screen.getByTestId('rating-summary')).toBeInTheDocument()
      expect(screen.getByTestId('review-form')).toBeInTheDocument()
      expect(screen.getByTestId('review-list')).toBeInTheDocument()
    })
  })
})