/// <reference types="cypress" />

describe('Product Details Page', () => {
  beforeEach(() => {
    // Set up API intercepts
    cy.intercept('GET', '**/products/1', { 
      fixture: 'products.json',
      statusCode: 200,
      body: {
        success: true,
        data: {
          id: 1,
          name: "Premium Headphones",
          description: "High-quality over-ear headphones with noise cancellation",
          price: 249.99,
          image: "https://example.com/headphones.jpg",
          category: "Electronics",
          stock: 42,
          rating: 4.7,
          createdAt: "2023-05-15T08:30:00.000Z",
          updatedAt: "2023-07-02T14:45:00.000Z"
        }
      }
    }).as('getProductDetails');
    
    cy.intercept('GET', '**/reviews/product/1', {
      statusCode: 200,
      body: {
        success: true,
        data: [
          {
            id: 1,
            productId: 1,
            userId: 2,
            userName: "Jane Doe",
            rating: 5,
            comment: "Excellent noise cancellation and sound quality. Battery life is impressive.",
            createdAt: "2023-06-10T14:22:00.000Z"
          },
          {
            id: 2,
            productId: 1,
            userId: 3,
            userName: "John Smith",
            rating: 4,
            comment: "Very comfortable, but a bit pricey.",
            createdAt: "2023-06-15T09:45:00.000Z"
          }
        ]
      }
    }).as('getProductReviews');
    
    // Visit the product details page
    cy.visit('/products/1');
  });

  it('displays product information correctly', () => {
    cy.wait('@getProductDetails');
    
    cy.contains('Premium Headphones').should('be.visible');
    cy.contains('$249.99').should('be.visible');
    cy.contains('High-quality over-ear headphones with noise cancellation').should('be.visible');
    cy.contains('Electronics').should('be.visible');
  });

  it('displays product reviews', () => {
    cy.wait('@getProductReviews');
    
    cy.contains('Customer Reviews').should('be.visible');
    cy.contains('Jane Doe').should('be.visible');
    cy.contains('John Smith').should('be.visible');
    cy.contains('Excellent noise cancellation').should('be.visible');
  });

  it('allows logged in users to add product to wishlist', () => {
    cy.wait('@getProductDetails');
    cy.wait('@getProductReviews');
    
    // Mock auth context by setting localStorage
    cy.window().then((win) => {
      win.localStorage.setItem('user', JSON.stringify({
        id: 1,
        name: 'Test User',
        email: 'test@example.com'
      }));
      win.localStorage.setItem('token', 'mock-jwt-token');
      
      // Reload page to apply auth state
      cy.reload();
    });
    
    // Intercept wishlist API call
    cy.intercept('POST', '**/wishlist/product/1', {
      statusCode: 200,
      body: { success: true, message: 'Product added to wishlist' }
    }).as('addToWishlist');
    
    // Click wishlist button
    cy.contains('button', 'Add to Wishlist').click();
    
    // Verify API called
    cy.wait('@addToWishlist');
    
    // Button should now show 'Remove from Wishlist'
    cy.contains('button', 'Remove from Wishlist').should('exist');
  });

  it('allows logged in users to submit reviews', () => {
    cy.wait('@getProductDetails');
    cy.wait('@getProductReviews');
    
    // Mock auth context
    cy.window().then((win) => {
      win.localStorage.setItem('user', JSON.stringify({
        id: 1,
        name: 'Test User',
        email: 'test@example.com'
      }));
      win.localStorage.setItem('token', 'mock-jwt-token');
      
      // Reload page to apply auth state
      cy.reload();
    });
    
    // Intercept review submission API call
    cy.intercept('POST', '**/reviews/product/1', {
      statusCode: 200,
      body: {
        success: true,
        data: {
          id: 3,
          productId: 1,
          userId: 1,
          userName: "Test User",
          rating: 5,
          comment: "Love the quality and comfort!",
          createdAt: new Date().toISOString()
        }
      }
    }).as('submitReview');
    
    // Select 5 stars
    cy.get('[aria-label="Rate 5 stars"]').click();
    
    // Type comment
    cy.get('textarea[name="comment"]').type('Love the quality and comfort!');
    
    // Submit review
    cy.contains('button', 'Submit Review').click();
    
    // Verify API called
    cy.wait('@submitReview');
    
    // New review should appear
    cy.contains('Love the quality and comfort!').should('be.visible');
  });
});