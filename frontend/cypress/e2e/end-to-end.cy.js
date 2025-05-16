/// <reference types="cypress" />

describe('End-to-End User Flow', () => {
  // We'll use these variables throughout the tests
  const user = {
    name: 'E2E Test User',
    email: 'e2etest@example.com',
    password: 'testpassword'
  };
  
  const testProduct = {
    id: 1,
    name: 'Premium Headphones'
  };

  beforeEach(() => {
    // Clear localStorage before each test
    cy.clearLocalStorage();
    
    // Set up common API intercepts
    cy.intercept('GET', '**/products*', { fixture: 'products.json' }).as('getProducts');
    cy.intercept('GET', '**/products/categories', { 
      body: { success: true, data: ['Electronics', 'Furniture', 'Clothing'] }
    }).as('getCategories');
  });

  it('completes a full user journey from registration to product review', () => {
    // 1. Visit homepage as a guest
    cy.visit('/');
    cy.wait('@getProducts');
    cy.wait('@getCategories');
    
    // 2. Navigate to auth page
    cy.contains('a', 'Login').click();
    cy.url().should('include', '/auth');
    
    // 3. Switch to registration form
    cy.contains('Create a new account').click();
    
    // 4. Set up register API mock
    cy.intercept('POST', '**/users/register', {
      statusCode: 201,
      body: {
        success: true,
        data: {
          user: {
            id: 99,
            name: user.name,
            email: user.email
          },
          token: 'mock-jwt-token'
        }
      }
    }).as('registerRequest');
    
    // 5. Fill and submit registration form
    cy.get('input[name="name"]').type(user.name);
    cy.get('input[name="email"]').type(user.email);
    cy.get('input[name="password"]').type(user.password);
    cy.get('input[name="confirmPassword"]').type(user.password);
    cy.contains('button', 'Sign up').click();
    
    // 6. Wait for registration and redirect to homepage
    cy.wait('@registerRequest');
    cy.url().should('not.include', '/auth');
    
    // 7. Verify logged in state - username should appear in nav
    cy.contains(user.name).should('be.visible');
    
    // 8. Click on a product to view details
    cy.intercept('GET', `**/products/${testProduct.id}`, {
      statusCode: 200,
      body: {
        success: true,
        data: {
          id: testProduct.id,
          name: testProduct.name,
          description: "High-quality over-ear headphones with noise cancellation",
          price: 249.99,
          image: "https://example.com/headphones.jpg",
          category: "Electronics",
          stock: 42,
          rating: 4.7
        }
      }
    }).as('getProductDetails');
    
    cy.intercept('GET', `**/reviews/product/${testProduct.id}`, {
      statusCode: 200,
      body: {
        success: true,
        data: [
          {
            id: 1,
            productId: testProduct.id,
            userId: 2,
            userName: "Jane Doe",
            rating: 5,
            comment: "Excellent noise cancellation and sound quality. Battery life is impressive.",
            createdAt: "2023-06-10T14:22:00.000Z"
          }
        ]
      }
    }).as('getProductReviews');
    
    // Click on the product
    cy.contains(testProduct.name).click();
    
    // 9. Wait for product details page to load
    cy.wait('@getProductDetails');
    cy.wait('@getProductReviews');
    cy.url().should('include', `/products/${testProduct.id}`);
    
    // 10. Add the product to wishlist
    cy.intercept('POST', `**/wishlist/product/${testProduct.id}`, {
      statusCode: 200,
      body: {
        success: true,
        message: 'Product added to wishlist'
      }
    }).as('addToWishlist');
    
    cy.contains('button', 'Add to Wishlist').click();
    cy.wait('@addToWishlist');
    
    // 11. Submit a review for the product
    cy.intercept('POST', `**/reviews/product/${testProduct.id}`, {
      statusCode: 200,
      body: {
        success: true,
        data: {
          id: 99,
          productId: testProduct.id,
          userId: 99,
          userName: user.name,
          rating: 4,
          comment: "Very comfortable and great sound quality!",
          createdAt: new Date().toISOString()
        }
      }
    }).as('submitReview');
    
    // Select 4 stars
    cy.get('[aria-label="Rate 4 stars"]').click();
    
    // Add review comment
    cy.get('textarea[name="comment"]').type('Very comfortable and great sound quality!');
    
    // Submit the review
    cy.contains('button', 'Submit Review').click();
    
    // Wait for submission
    cy.wait('@submitReview');
    
    // Review should appear in the list
    cy.contains('Very comfortable and great sound quality!').should('be.visible');
    
    // 12. Navigate to wishlist page
    cy.intercept('GET', '**/wishlist', {
      statusCode: 200,
      body: {
        success: true,
        data: [
          {
            id: 1,
            userId: 99,
            productId: testProduct.id,
            product: {
              id: testProduct.id,
              name: testProduct.name,
              description: "High-quality over-ear headphones with noise cancellation",
              price: 249.99,
              image: "https://example.com/headphones.jpg",
              category: "Electronics",
              rating: 4.7
            }
          }
        ]
      }
    }).as('getWishlist');
    
    cy.contains('a', 'Wishlist').click();
    
    // 13. Check wishlist contains the product
    cy.wait('@getWishlist');
    cy.url().should('include', '/wishlist');
    cy.contains(testProduct.name).should('be.visible');
    
    // 14. Log out
    cy.contains('button', 'Logout').click();
    
    // 15. Verify logged out state
    cy.contains(user.name).should('not.exist');
    cy.contains('a', 'Login').should('be.visible');
  });
});