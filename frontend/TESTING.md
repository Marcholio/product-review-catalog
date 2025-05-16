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

```bash
# Open Cypress in interactive mode
npm run cy:open
# or
npm run test:e2e

# Run Cypress tests headlessly
npm run cy:run
# or
npm run test:e2e:ci
```

### Key E2E Test Files

- `cypress/e2e/homepage.cy.ts`: Tests for the homepage functionality
- `cypress/e2e/product-details.cy.ts`: Tests for the product details page
- `cypress/e2e/auth-flow.cy.ts`: Tests for the authentication flow
- `cypress/e2e/wishlist.cy.ts`: Tests for the wishlist functionality
- `cypress/e2e/end-to-end.cy.ts`: Complete user journey tests

### Custom Cypress Commands

Custom commands have been added to streamline testing common workflows:

- `cy.login(email, password)`: Logs in with the specified credentials
- `cy.addToWishlist(productId)`: Adds a product to the wishlist
- `cy.submitReview(productId, rating, comment)`: Submits a product review

### Test Data

Test data fixtures are stored in:

- `cypress/fixtures/products.json`: Mock product data
- `cypress/fixtures/users.json`: Mock user data

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