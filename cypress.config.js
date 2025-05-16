module.exports = {
  e2e: {
    supportFile: false, // Disable the support file entirely
    baseUrl: 'http://localhost:5173', // Using Vite's default port
    specPattern: 'frontend/cypress/e2e/**/*.{js,jsx,ts,tsx}',
    setupNodeEvents(on, config) {
      // No event handlers
    },
  },
}