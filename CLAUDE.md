# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a full-stack Product Review Catalog application with:
- React frontend (TypeScript)
- Express backend (TypeScript)
- PostgreSQL database 
- Docker for containerization

The application allows users to browse products, write reviews, authenticate, and manage wishlists.

## Common Commands

### Project Setup

```bash
# Start the PostgreSQL database
docker-compose up -d db

# Backend setup
cd backend
npm install
npm run dev  # Runs on http://localhost:3000

# Frontend setup
cd frontend
npm install
npm run dev  # Runs on http://localhost:5173
```

### Backend Development

```bash
# From the backend directory:
npm run dev        # Start development server with auto-reload
npm run build      # Build TypeScript to JavaScript
npm run watch      # Watch mode for TypeScript compilation
npm run test       # Run tests with Jest
```

### Frontend Development

```bash
# From the frontend directory:
npm run dev        # Start development server
npm run build      # Build for production
npm run lint       # Run ESLint
npm run preview    # Preview production build
```

## Architecture

### Backend

The backend follows a typical Express MVC pattern:
- `src/models/` - Sequelize ORM models (Product, Review, User, Wishlist)
- `src/controllers/` - Request handlers
- `src/routes/` - API route definitions
- `src/middleware/` - Auth and other middleware
- `src/config/` - Database, security, and Swagger configuration

Key features:
- TypeScript with ESM modules
- Sequelize ORM for database operations
- JWT authentication
- OpenAPI/Swagger documentation
- Security features (rate limiting, helmet, CORS)

### Frontend

The frontend is a React application built with:
- TypeScript
- React Router for navigation
- Context API for state management (AuthContext)
- Tailwind CSS for styling

The component structure includes:
- Product browsing and filtering (ProductList)
- Product details with reviews (ProductDetails)
- User authentication (AuthForm)
- User wishlist management (Wishlist)

### Database Schema

The primary models are:
- Product: Product catalog items with name, description, price, etc.
- User: User accounts with authentication details
- Review: Product reviews with ratings
- Wishlist: User-saved product collections

## Environment Setup

Both frontend and backend require `.env` files:

### Backend Environment Variables
```
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USER=admin
DB_PASSWORD=adminpass
DB_NAME=product_catalog
JWT_SECRET=your_jwt_secret
NODE_ENV=development
FORCE_SYNC=false
SEED_DATABASE=true
SEED_COUNT=100
ALLOWED_ORIGINS=http://localhost:5173
```

### Frontend Environment Variables
```
VITE_API_URL=http://localhost:3000/api
```