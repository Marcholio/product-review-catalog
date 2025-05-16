// ***********************************************************
// This support file is loaded automatically before your tests.
// ***********************************************************

// With ES modules, we can only use import statements
import './commands.js'

// Import Testing Library Cypress
import '@testing-library/cypress/add-commands'

// Prevent Cypress from failing the test when there's an uncaught exception
Cypress.on('uncaught:exception', (err, runnable) => {
  console.log('Uncaught exception:', err.message)
  return false
})