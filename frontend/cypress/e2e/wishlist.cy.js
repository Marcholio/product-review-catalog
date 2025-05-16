/// <reference types="cypress" />

describe('Wishlist Functionality', () => {
  beforeEach(() => {
    // Clear localStorage first
    cy.clearLocalStorage();
    
    // Mock authentication by setting localStorage
    cy.window().then((win) => {
      win.localStorage.setItem('user', JSON.stringify({
        id: 1,
        name: 'Test User',
        email: 'test@example.com'
      }));
      win.localStorage.setItem('token', 'mock-jwt-token');
    });
    
    // Set up API intercepts for wishlist data
    cy.intercept('GET', '**/wishlist', {
      statusCode: 200,
      body: {
        success: true,
        data: [
          {
            id: 1,
            userId: 1,
            productId: 1,
            product: {
              id: 1,
              name: "Premium Headphones",
              description: "High-quality over-ear headphones with noise cancellation",
              price: 249.99,
              image: "https://example.com/headphones.jpg",
              category: "Electronics",
              rating: 4.7
            }
          },
          {
            id: 2,
            userId: 1,
            productId: 3,
            product: {
              id: 3,
              name: "Smart Watch Pro",
              description: "Waterproof smartwatch with heart rate monitoring and GPS",
              price: 299.99,
              image: "https://example.com/smartwatch.jpg",
              category: "Electronics",
              rating: 4.8
            }
          }
        ]
      }
    }).as('getWishlist');
    
    // Visit the wishlist page
    cy.visit('/wishlist');
  });

  it('displays the wishlist with saved products', () => {
    cy.wait('@getWishlist');
    
    // Wishlist title should be visible
    cy.contains('My Wishlist').should('be.visible');
    
    // Should display both wishlist items
    cy.get('[data-testid="wishlist-item"]').should('have.length', 2);
    cy.contains('Premium Headphones').should('be.visible');
    cy.contains('Smart Watch Pro').should('be.visible');
    
    // Price info should be visible
    cy.contains('$249.99').should('be.visible');
    cy.contains('$299.99').should('be.visible');
  });

  it('allows removing items from the wishlist', () => {
    cy.wait('@getWishlist');
    
    // Intercept removal API call
    cy.intercept('DELETE', '**/wishlist/product/1', {
      statusCode: 200,
      body: {
        success: true,
        message: 'Product removed from wishlist'
      }
    }).as('removeFromWishlist');
    
    // Find the first product and click remove button
    cy.contains('Premium Headphones')
      .parents('[data-testid="wishlist-item"]')
      .find('[aria-label="Remove from wishlist"]')
      .click();
    
    // Wait for API call
    cy.wait('@removeFromWishlist');
    
    // Should now have only one product
    cy.get('[data-testid="wishlist-item"]').should('have.length', 1);
    cy.contains('Premium Headphones').should('not.exist');
    cy.contains('Smart Watch Pro').should('be.visible');
  });

  it('redirects to product details when clicking on a product', () => {
    cy.wait('@getWishlist');
    
    // Click on product name to navigate to details
    cy.contains('Premium Headphones').click();
    
    // Should navigate to product details page
    cy.url().should('include', '/products/1');
  });

  it('shows empty state when wishlist is empty', () => {
    // Override wishlist data to be empty
    cy.intercept('GET', '**/wishlist', {
      statusCode: 200,
      body: {
        success: true,
        data: []
      }
    }).as('getEmptyWishlist');
    
    // Reload the page to get empty wishlist
    cy.reload();
    cy.wait('@getEmptyWishlist');
    
    // Should show empty state message
    cy.contains('Your wishlist is empty').should('be.visible');
    
    // Should have a button to browse products
    cy.findByRole('link', { name: /browse products/i }).should('be.visible');
    cy.findByRole('link', { name: /browse products/i }).should('have.attr', 'href', '/');
  });

  it('allows adding products to cart from wishlist', () => {
    cy.wait('@getWishlist');
    
    // Intercept API call when adding to cart
    cy.intercept('POST', '**/cart/add', {
      statusCode: 200,
      body: {
        success: true,
        message: 'Product added to cart'
      }
    }).as('addToCart');
    
    // Find the first product and click add to cart button
    cy.contains('Premium Headphones')
      .parents('[data-testid="wishlist-item"]')
      .find('[data-testid="add-to-cart-btn"]')
      .click();
    
    // Wait for API call
    cy.wait('@addToCart');
    
    // Should show success message
    cy.contains('Added to cart').should('be.visible');
  });
});