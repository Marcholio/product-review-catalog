import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Navbar from '../../components/Navbar'

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
  Link: ({ children, to, className, onClick }: any) => (
    <a href={to} className={className} onClick={onClick} data-testid={`link-${to}`}>
      {children}
    </a>
  ),
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: '/' }),
}))

// Mock the useAuth hook
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser,
    logout: mockLogout,
  }),
}))

// Mock react-icons
vi.mock('react-icons/fi', () => ({
  FiShoppingBag: () => <span data-testid="icon-shopping-bag">ShoppingBagIcon</span>,
  FiHeart: () => <span data-testid="icon-heart">HeartIcon</span>,
  FiUser: () => <span data-testid="icon-user">UserIcon</span>,
  FiLogOut: () => <span data-testid="icon-logout">LogoutIcon</span>,
  FiMenu: () => <span data-testid="icon-menu">MenuIcon</span>,
  FiX: () => <span data-testid="icon-close">CloseIcon</span>,
}))

// Mock functions and variables
const mockNavigate = vi.fn()
const mockLogout = vi.fn()
let mockUser: { name: string } | null = null

describe('Navbar Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset mock user to null (logged out) by default
    mockUser = null
  })
  
  it('renders correctly when user is not logged in', () => {
    render(<Navbar />)
    
    // Brand should be visible
    expect(screen.getByText('Product Catalog')).toBeInTheDocument()
    
    // Login link should be visible
    expect(screen.getByText('Login / Sign Up')).toBeInTheDocument()
    
    // Wishlist should not be visible
    expect(screen.queryByText('Wishlist')).not.toBeInTheDocument()
  })
  
  it('renders correctly when user is logged in', () => {
    // Set mock user as logged in
    mockUser = { name: 'Test User' }
    
    render(<Navbar />)
    
    // User name should be visible
    expect(screen.getByText('Test User')).toBeInTheDocument()
    
    // Logout button should be visible
    expect(screen.getByText('Logout')).toBeInTheDocument()
    
    // Wishlist link should be visible
    expect(screen.getByText('Wishlist')).toBeInTheDocument()
  })
  
  it('toggles mobile menu when menu button is clicked', async () => {
    render(<Navbar />)
    
    // Mobile menu should initially be closed
    expect(screen.queryByText('Products')).not.toBeInTheDocument()
    
    // Get the menu button (on mobile view)
    const menuButton = screen.getByRole('button', { name: /open menu/i })
    
    // Click menu button to open mobile menu
    await waitFor(() => {
      fireEvent.click(menuButton)
    })
    
    // Now Products link should be visible in mobile menu
    expect(screen.getByText('Products')).toBeInTheDocument()
    
    // Menu icon should change to close icon
    expect(screen.getByRole('button', { name: /close menu/i })).toBeInTheDocument()
    
    // Click again to close the menu
    const closeButton = screen.getByRole('button', { name: /close menu/i })
    await waitFor(() => {
      fireEvent.click(closeButton)
    })
    
    // Products link should disappear
    expect(screen.queryByText('Products')).not.toBeInTheDocument()
  })
  
  it('calls logout and navigates when logout button is clicked', async () => {
    // Set mock user as logged in
    mockUser = { name: 'Test User' }
    
    render(<Navbar />)
    
    // Click logout button
    const logoutButton = screen.getByText('Logout')
    await waitFor(() => {
      fireEvent.click(logoutButton)
    })
    
    // Check if logout function was called
    expect(mockLogout).toHaveBeenCalledTimes(1)
    
    // Check if navigate was called with correct path
    expect(mockNavigate).toHaveBeenCalledWith('/')
  })
  
  it('closes mobile menu when a link is clicked', async () => {
    render(<Navbar />)
    
    // Open mobile menu
    const menuButton = screen.getByRole('button', { name: /open menu/i })
    await waitFor(() => {
      fireEvent.click(menuButton)
    })
    
    // Mobile menu should be open
    expect(screen.getByText('Products')).toBeInTheDocument()
    
    // Click on the products link
    const productsLink = screen.getByText('Products')
    await waitFor(() => {
      fireEvent.click(productsLink)
    })
    
    // Mobile menu should close
    expect(screen.queryByText('Products')).not.toBeInTheDocument()
  })
})