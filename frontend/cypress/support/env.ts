// This file contains environment-specific settings for Cypress tests

// The base URL for the application
export const baseUrl: string = Cypress.config('baseUrl') as string;

// API endpoint
export const apiUrl: string = 'http://localhost:3000/api';

// Test user credentials
export const testUser = {
  name: 'Test User',
  email: 'testuser@example.com',
  password: 'password123'
};

// Test admin credentials
export const adminUser = {
  name: 'Admin User',
  email: 'admin@example.com',
  password: 'adminpass123'
};

// Default timeout for API requests
export const requestTimeout = 10000;

// Check if we're running in CI mode
export const isCI = Cypress.env('CI') === true;