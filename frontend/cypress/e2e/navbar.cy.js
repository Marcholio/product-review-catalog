// Tests for the navigation bar
describe('Navigation Bar', () => {
  it('should have a navigation bar with links', () => {
    // Visit the home page
    cy.visit('/')
    
    // There should be a navigation bar on the page
    cy.get('nav').should('exist')
    
    // The navigation should contain the app name/logo
    cy.get('nav').contains('Product Catalog').should('exist')
    
    // The page should contain at least one link
    cy.get('a').should('exist')
  })

  it('should have a login link when not logged in', () => {
    cy.visit('/')
    
    // When not logged in, there should be a login/signup link
    cy.contains('Login').should('exist')
  })
})