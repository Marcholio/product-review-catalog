/// <reference types="cypress" />
import '@testing-library/cypress/add-commands';

// Custom command to login
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/auth');
  cy.findByLabelText(/email/i).type(email);
  cy.findByLabelText(/password/i).type(password);
  cy.findByRole('button', { name: /sign in/i }).click();
  // Wait for the login to complete
  cy.url().should('not.include', '/auth');
});

// Custom command to add a product to wishlist
Cypress.Commands.add('addToWishlist', (productId: string) => {
  cy.visit(`/products/${productId}`);
  cy.findByRole('button', { name: /add to wishlist/i }).click();
  // Wait for the wishlist operation to complete
  cy.findByRole('button', { name: /remove from wishlist/i }).should('exist');
});

// Custom command to submit a product review
Cypress.Commands.add('submitReview', (productId: string, rating: number, comment: string) => {
  cy.visit(`/products/${productId}`);
  // Select star rating
  cy.get(`[aria-label="Rate ${rating} stars"]`).click();
  // Add comment
  cy.findByLabelText(/comment/i).type(comment);
  // Submit review
  cy.findByRole('button', { name: /submit review/i }).click();
  // Wait for submission to complete
  cy.contains(comment).should('be.visible');
});

declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>
      addToWishlist(productId: string): Chainable<void>
      submitReview(productId: string, rating: number, comment: string): Chainable<void>
    }
  }
}