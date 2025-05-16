// Basic test to verify Cypress setup
describe('Basic Test', () => {
  it('visits the app root url', () => {
    cy.visit('/')
    // Just check that the page loaded - any element will do
    cy.get('body').should('be.visible')
  })
})