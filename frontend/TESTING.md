# Testing Documentation

This document outlines the testing approach and tools used in the Product Review Catalog application.

## Testing Layers

The application implements a comprehensive testing strategy with multiple layers:

1. **Unit Tests**: For individual components and hooks
2. **Integration Tests**: For connected components and services
3. **End-to-End Tests**: For user flows across multiple pages

## Unit and Integration Testing

Unit and integration tests are implemented using:

- **Vitest**: A Vite-native test runner with a Jest-compatible API
- **React Testing Library**: For component testing with user-centric queries
- **Happy DOM**: For DOM simulation in tests

### Running Unit Tests

```bash
# Run tests once
npm test

# Run tests in watch mode
npm run test:watch
```

### Key Unit Test Files

- Components:
  - `src/__tests__/components/ui/*.test.tsx` - UI component tests
  - `src/__tests__/components/products/*.test.tsx` - Product-related component tests
  - `src/__tests__/components/auth/*.test.tsx` - Authentication-related component tests

- Hooks:
  - `src/__tests__/hooks/*.test.ts` - Custom hook tests

## End-to-End Testing

End-to-end tests are implemented using:

- **Cypress**: For browser-based end-to-end testing
- **Testing Library Cypress**: For user-centric queries in Cypress tests

### Running E2E Tests

From the project root directory:

```bash
# Run tests in interactive mode with the UI open
npm run test:e2e

# Run a specific test file
npm run test:e2e:navbar   # Runs the navbar tests
npm run test:e2e:basic    # Runs basic smoke test

# Run all E2E tests headlessly
npm run test:e2e:all
```

These commands will automatically:
1. Start the frontend dev server
2. Wait for it to be available
3. Run the Cypress tests
4. Shut down the server when tests complete

### Key E2E Test Files

- `frontend/cypress/e2e/basic.cy.js`: Basic smoke tests
- `frontend/cypress/e2e/navbar.cy.js`: Tests for the navigation elements
- `frontend/cypress/e2e/auth-flow.cy.js`: Tests for the authentication flow
- `frontend/cypress/e2e/product-details.cy.js`: Tests for the product details page
- `frontend/cypress/e2e/wishlist.cy.js`: Tests for the wishlist functionality
- `frontend/cypress/e2e/end-to-end.cy.js`: Complete user journey tests

### Custom Cypress Commands

Custom commands have been added to streamline testing common workflows:

- `cy.login(email, password)`: Logs in with the specified credentials
- `cy.addToWishlist(productId)`: Adds a product to the wishlist

### Test Data

Test data fixtures are stored in:

- `frontend/cypress/fixtures/products.json`: Mock product data
- `frontend/cypress/fixtures/users.json`: Mock user data
- `frontend/cypress/fixtures/example.json`: Example data structure

## Test Coverage

The testing strategy focuses on:

1. **Core Components**: All reusable UI components have unit tests
2. **Key User Flows**: Critical user journeys are covered with E2E tests
3. **Business Logic**: Custom hooks have comprehensive unit tests

## Best Practices

- **Testing Behavior, Not Implementation**: Tests focus on what the user experiences
- **Realistic Testing**: Tests interact with the application like a real user would
- **Maintainable Tests**: Tests are structured to be resilient to UI changes
- **Mocking External Dependencies**: API calls are intercepted and mocked for consistent testing

## Troubleshooting

If you encounter issues with the E2E tests:

1. **Verify the dev server is running**: Make sure the frontend is accessible at http://localhost:5173
2. **Check the test specs**: Ensure your test is looking for elements that exist in the UI
3. **Browser issues**: Try running in a different browser with `--browser chrome` option
4. **Timeout issues**: Increase timeouts with `--config defaultCommandTimeout=10000`