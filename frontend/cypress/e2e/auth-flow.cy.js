/// <reference types="cypress" />

describe('Authentication Flow', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    cy.clearLocalStorage();
    
    // Visit the auth page
    cy.visit('/auth');
  });

  it('displays the auth form with login/register toggle', () => {
    // Page should have login form initially
    cy.contains('Sign in to your account').should('be.visible');
    cy.findByLabelText(/email/i).should('exist');
    cy.findByLabelText(/password/i).should('exist');
    cy.findByRole('button', { name: /sign in/i }).should('exist');
    
    // Should have option to switch to register
    cy.contains('Create a new account').should('be.visible').click();
    
    // Page should now show register form
    cy.contains('Create an account').should('be.visible');
    cy.findByLabelText(/name/i).should('exist');
    cy.findByLabelText(/email/i).should('exist');
    cy.findByLabelText(/password/i).should('exist');
    cy.findByLabelText(/confirm password/i).should('exist');
    cy.findByRole('button', { name: /sign up/i }).should('exist');
  });

  it('validates login form fields', () => {
    // Try submitting with empty fields
    cy.findByRole('button', { name: /sign in/i }).click();
    
    // Should show validation errors
    cy.contains('Email is required').should('be.visible');
    cy.contains('Password is required').should('be.visible');
    
    // Try with invalid email
    cy.findByLabelText(/email/i).type('invalid-email');
    cy.findByRole('button', { name: /sign in/i }).click();
    cy.contains('Please enter a valid email address').should('be.visible');
    
    // Try with short password
    cy.findByLabelText(/email/i).clear().type('valid@example.com');
    cy.findByLabelText(/password/i).type('12345');
    cy.findByRole('button', { name: /sign in/i }).click();
    cy.contains('Password must be at least 6 characters long').should('be.visible');
  });

  it('handles successful login flow', () => {
    // Intercept login API call
    cy.intercept('POST', '**/users/login', {
      statusCode: 200,
      body: {
        success: true,
        data: {
          user: {
            id: 1,
            name: 'Test User',
            email: 'test@example.com'
          },
          token: 'mock-jwt-token'
        }
      }
    }).as('loginRequest');
    
    // Fill and submit login form
    cy.findByLabelText(/email/i).type('test@example.com');
    cy.findByLabelText(/password/i).type('password123');
    cy.findByRole('button', { name: /sign in/i }).click();
    
    // Wait for API call
    cy.wait('@loginRequest');
    
    // Should redirect to homepage
    cy.url().should('not.include', '/auth');
    
    // Should have user info in localStorage
    cy.window().then((win) => {
      const user = JSON.parse(win.localStorage.getItem('user'));
      expect(user.name).to.equal('Test User');
      expect(win.localStorage.getItem('token')).to.equal('mock-jwt-token');
    });
  });

  it('handles failed login with error message', () => {
    // Intercept login API call with error
    cy.intercept('POST', '**/users/login', {
      statusCode: 401,
      body: {
        success: false,
        message: 'Invalid email or password'
      }
    }).as('loginRequest');
    
    // Fill and submit login form
    cy.findByLabelText(/email/i).type('wrong@example.com');
    cy.findByLabelText(/password/i).type('wrongpassword');
    cy.findByRole('button', { name: /sign in/i }).click();
    
    // Wait for API call
    cy.wait('@loginRequest');
    
    // Should show error message
    cy.contains('Invalid email or password').should('be.visible');
    
    // Should still be on auth page
    cy.url().should('include', '/auth');
  });

  it('handles successful registration flow', () => {
    // Switch to register form
    cy.contains('Create a new account').click();
    
    // Intercept register API call
    cy.intercept('POST', '**/users/register', {
      statusCode: 201,
      body: {
        success: true,
        data: {
          user: {
            id: 99,
            name: 'New User',
            email: 'newuser@example.com'
          },
          token: 'new-user-token'
        }
      }
    }).as('registerRequest');
    
    // Fill and submit registration form
    cy.findByLabelText(/name/i).type('New User');
    cy.findByLabelText(/email/i).type('newuser@example.com');
    cy.findByLabelText(/password/i).type('newpassword123');
    cy.findByLabelText(/confirm password/i).type('newpassword123');
    cy.findByRole('button', { name: /sign up/i }).click();
    
    // Wait for API call
    cy.wait('@registerRequest');
    
    // Should redirect to homepage
    cy.url().should('not.include', '/auth');
    
    // Should have user info in localStorage
    cy.window().then((win) => {
      const user = JSON.parse(win.localStorage.getItem('user'));
      expect(user.name).to.equal('New User');
      expect(win.localStorage.getItem('token')).to.equal('new-user-token');
    });
  });
});