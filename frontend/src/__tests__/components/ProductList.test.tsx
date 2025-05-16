import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import ProductList from '../../components/ProductList'

// Mock the needed components and hooks
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}))

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser,
    token: mockToken,
    updatePreferences: mockUpdatePreferences,
  }),
}))

// Mock the UI components
vi.mock('../../components/ui', () => ({
  ErrorMessage: ({ message }: any) => <div data-testid="error-message">{message}</div>
}))

// Mock the product components
vi.mock('../../components/products', () => ({
  FilterSection: () => <div data-testid="filter-section">Filter Section</div>,
  HeroSection: () => <div data-testid="hero-section">Hero Section</div>,
  FeaturedProducts: () => <div data-testid="featured-products">Featured Products</div>,
  ProductGrid: ({ loading }: any) => (
    <div data-testid="product-grid">
      {loading ? 'Loading...' : 'Product Grid'}
    </div>
  ),
  Pagination: () => <div data-testid="pagination">Pagination</div>,
}))

// Mock global fetch
global.fetch = vi.fn()

// Mock console.log and console.error to reduce test noise
console.log = vi.fn()
console.error = vi.fn()

// Define mock functions and variables
const mockNavigate = vi.fn()
const mockUpdatePreferences = vi.fn()
let mockUser: { preferences?: any } | null = null
let mockToken: string | null = null

describe('ProductList Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUser = null
    mockToken = null
    
    // Default mock response for products
    global.fetch.mockImplementation((url) => {
      if (url.includes('/products?')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            data: {
              products: [
                { id: 1, name: 'Product 1', price: 99.99, rating: 4.0 },
                { id: 2, name: 'Product 2', price: 149.99, rating: 4.8 },
              ],
              totalPages: 1,
              totalProducts: 2
            }
          })
        })
      } else if (url.includes('/products/categories')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            data: ['Electronics', 'Home', 'Clothing']
          })
        })
      }
      return Promise.reject(new Error('Unhandled request'))
    })
  })
  
  it('renders loading state initially', () => {
    render(<ProductList />)
    
    expect(screen.getByTestId('hero-section')).toBeInTheDocument()
    expect(screen.getByTestId('filter-section')).toBeInTheDocument()
    expect(screen.getByText(/Loading/i)).toBeInTheDocument()
  })
  
  it('renders product grid after loading', async () => {
    render(<ProductList />)
    
    // Wait for products to load
    await waitFor(() => {
      expect(screen.getByText('Product Grid')).toBeInTheDocument()
    })
    
    // Featured products should be visible
    expect(screen.getByTestId('featured-products')).toBeInTheDocument()
  })
  
  it('shows error message when API request fails', async () => {
    // Mock API error
    global.fetch.mockImplementationOnce(() => {
      return Promise.resolve({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: () => Promise.resolve({ message: 'Server error occurred' })
      })
    })
    
    render(<ProductList />)
    
    // Wait for error message to appear
    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toBeInTheDocument()
    })
  })
  
  it('loads with user preferences when user is logged in', async () => {
    // Set mock user with preferences
    mockUser = {
      preferences: {
        defaultSort: 'price',
        defaultCategory: 'Electronics',
        minBudget: 100,
        maxBudget: 500
      }
    }
    mockToken = 'test-token'
    
    render(<ProductList />)
    
    // Wait for products to load
    await waitFor(() => {
      expect(screen.getByText('Product Grid')).toBeInTheDocument()
    })
    
    // All components should be rendered
    expect(screen.getByTestId('hero-section')).toBeInTheDocument()
    expect(screen.getByTestId('filter-section')).toBeInTheDocument()
    expect(screen.getByTestId('featured-products')).toBeInTheDocument()
  })
})