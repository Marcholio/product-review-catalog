module.exports = {
  e2e: {
    supportFile: 'frontend/cypress/support/e2e.js',
    baseUrl: 'http://localhost:5173',
    specPattern: 'frontend/cypress/e2e/**/*.{js,jsx,ts,tsx}',
    setupNodeEvents(on, config) {
      // No event handlers
    },
  },
}