// ***********************************************
// This file defines custom commands for Cypress
// ***********************************************

// Example custom command to login
Cypress.Commands.add('login', (email, password) => {
  cy.visit('/auth')
  cy.get('[name="email"]').type(email)
  cy.get('[name="password"]').type(password)
  cy.get('button[type="submit"]').click()
})

// Command to add a product to wishlist
Cypress.Commands.add('addToWishlist', (productId) => {
  cy.visit(`/products/${productId}`)
  cy.get('[data-testid="wishlist-button"]').click()
})