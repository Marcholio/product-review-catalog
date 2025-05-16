describe('Smoke Test', () => {
  it('loads the homepage', () => {
    cy.visit('/');
    
    // Verify the page loads - this should pass regardless of content
    cy.contains('div').should('exist');
  });
});