/// <reference types="cypress" />

// Simplified test focusing just on wishlist functionality
describe('Simple Wishlist Test', () => {
  it('shows wishlist content when user is logged in', () => {
    // Setup authentication
    cy.visit('/');
    
    // Intercept API calls
    cy.intercept('GET', '**/products*', {
      statusCode: 200,
      body: {
        success: true,
        data: [
          {
            id: 1,
            name: "Premium Headphones",
            description: "High-quality over-ear headphones",
            price: 249.99,
            image: "https://example.com/headphones.jpg",
            category: "Electronics",
            rating: 4.7
          },
          {
            id: 2,
            name: "Smart Watch",
            description: "Fitness tracker with notifications",
            price: 199.99,
            image: "https://example.com/watch.jpg",
            category: "Electronics",
            rating: 4.5
          }
        ]
      }
    }).as('getProducts');
    
    cy.intercept('GET', '**/products/categories', {
      statusCode: 200,
      body: {
        success: true,
        data: ['Electronics', 'Clothing', 'Home']
      }
    }).as('getCategories');
    
    // Set up wishlist data
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
              description: "High-quality over-ear headphones",
              price: 249.99,
              image: "https://example.com/headphones.jpg",
              category: "Electronics",
              rating: 4.7
            }
          }
        ]
      }
    }).as('getWishlist');
    
    // Wait for the homepage to load
    cy.wait('@getProducts');
    cy.wait('@getCategories');
    
    // Set authentication in localStorage
    cy.window().then((win) => {
      win.localStorage.setItem('user', JSON.stringify({
        id: 1,
        name: 'Test User',
        email: 'test@example.com'
      }));
      win.localStorage.setItem('token', 'mock-jwt-token');
      
      // Force reload to apply authentication
      win.location.reload();
    });
    
    // Wait for the homepage to reload
    cy.wait('@getProducts');
    cy.wait('@getCategories');
    
    // Verify login status
    cy.contains('Test User').should('be.visible');
    
    // Navigate to wishlist
    cy.get('a').contains('Wishlist').click();
    
    // Verify wishlist content
    cy.wait('@getWishlist');
    cy.contains('Premium Headphones').should('be.visible');
  });
  
  it('shows empty wishlist message', () => {
    // Visit homepage
    cy.visit('/');
    
    // Set up API intercepts
    cy.intercept('GET', '**/products*', {
      statusCode: 200,
      body: {
        success: true,
        data: [
          {
            id: 1,
            name: "Premium Headphones",
            price: 249.99,
            category: "Electronics",
            rating: 4.7
          }
        ]
      }
    }).as('getProducts');
    
    cy.intercept('GET', '**/products/categories', {
      statusCode: 200,
      body: {
        success: true,
        data: ['Electronics', 'Clothing', 'Home']
      }
    }).as('getCategories');
    
    // Empty wishlist data
    cy.intercept('GET', '**/wishlist', {
      statusCode: 200,
      body: {
        success: true,
        data: []
      }
    }).as('getEmptyWishlist');
    
    // Set authentication in localStorage
    cy.window().then((win) => {
      win.localStorage.setItem('user', JSON.stringify({
        id: 1,
        name: 'Test User',
        email: 'test@example.com'
      }));
      win.localStorage.setItem('token', 'mock-jwt-token');
    });
    
    // Wait for API calls to complete
    cy.wait('@getProducts');
    cy.wait('@getCategories');
    
    // Reload page to apply auth
    cy.reload();
    cy.wait('@getProducts');
    cy.wait('@getCategories');
    
    // Navigate to wishlist
    cy.get('a').contains('Wishlist').click();
    
    // Verify empty wishlist message
    cy.wait('@getEmptyWishlist');
    cy.contains('Your wishlist is empty').should('be.visible');
  });
});