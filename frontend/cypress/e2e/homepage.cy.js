/// <reference types="cypress" />

describe('Homepage', () => {
  beforeEach(() => {
    // Visit the homepage before each test
    cy.visit('/');
    
    // Intercept API calls to use fixtures
    cy.intercept('GET', '**/products*', { fixture: 'products.json' }).as('getProducts');
    cy.intercept('GET', '**/products/categories', { 
      body: { success: true, data: ['Electronics', 'Furniture', 'Clothing'] }
    }).as('getCategories');
  });

  it('displays the product catalog header', () => {
    cy.contains('Product Catalog').should('be.visible');
  });

  it('displays product grid with products', () => {
    cy.wait('@getProducts');
    cy.get('[data-testid="product-card"]').should('have.length.at.least', 1);
  });

  it('allows filtering products by category', () => {
    cy.wait('@getCategories');
    cy.wait('@getProducts');
    
    // Click on Electronics category
    cy.contains('button', 'Electronics').click();
    
    // It should trigger another products API call
    cy.wait('@getProducts');
    
    // Should now show only electronics
    cy.get('[data-testid="product-card"]').each(($card) => {
      cy.wrap($card).find('[data-testid="product-category"]').should('contain', 'Electronics');
    });
  });

  it('allows searching for products', () => {
    cy.wait('@getProducts');
    
    // Type "headphones" in the search field
    cy.get('[data-testid="search-input"]').type('headphones');
    
    // Wait for debounced API call
    cy.wait('@getProducts');
    
    // Should filter products containing "headphones"
    cy.get('[data-testid="product-card"]').should('have.length', 1);
    cy.contains('Premium Headphones').should('be.visible');
  });
});