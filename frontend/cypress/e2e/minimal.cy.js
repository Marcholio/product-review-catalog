// The simplest possible Cypress test
describe('Minimal Test', () => {
  it('visits the home page', () => {
    cy.visit('/')
    cy.get('body').should('be.visible')
  })
})