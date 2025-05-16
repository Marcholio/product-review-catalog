# Product Review Catalog

A full-stack TypeScript application for browsing products, submitting reviews, and managing wishlists.

![License](https://img.shields.io/badge/license-MIT-blue.svg)

## 🌟 Features

- **Product Management**: Browse, search, filter, and sort products
- **User Authentication**: Register, login, and profile management
- **Reviews & Ratings**: Submit and view product reviews with ratings
- **Wishlist**: Save favorite products for later
- **Admin Dashboard**: Manage products, reviews, and user accounts
- **Responsive Design**: Works on desktop and mobile devices
- **Dark Mode Support**: Toggle between light and dark themes

## 🚀 Tech Stack

### Frontend
- React with TypeScript
- React Router for navigation
- Context API for state management
- Tailwind CSS for styling
- Vite for build tooling

### Backend
- Node.js with Express
- TypeScript with ESM modules
- Sequelize ORM for database operations
- JWT authentication
- OpenAPI/Swagger documentation

### Database
- PostgreSQL
- Sequelize ORM

### DevOps
- Docker & Docker Compose
- Environment-based configuration

## 📁 Project Structure

```
.
├── frontend/           # React frontend application
│   ├── src/            # Frontend source code
│   │   ├── components/ # React components
│   │   ├── contexts/   # React context providers
│   │   └── types/      # TypeScript type definitions
│   └── public/         # Static assets
├── backend/            # Node.js Express backend
│   ├── src/            # Backend source code
│   │   ├── config/     # Configuration files
│   │   ├── controllers/# Request handlers
│   │   ├── models/     # Database models
│   │   ├── routes/     # API route definitions
│   │   ├── middleware/ # Express middleware
│   │   ├── services/   # Business logic
│   │   └── utils/      # Utility functions
│   └── tests/          # Backend tests
└── docker-compose.yml  # Docker configuration
```

## 🔧 Prerequisites

- Node.js (v18 or later)
- Docker and Docker Compose
- npm or yarn

## 🏁 Quick Start

1. **Clone the repository**

2. **Start the database:**
   ```bash
   docker-compose up -d db
   ```

3. **Set up environment variables:**
   - Create `.env` files in both the `frontend` and `backend` directories using the examples below

4. **Install and start the backend:**
   ```bash
   cd backend
   npm install
   npm run dev  # Runs on http://localhost:3000
   ```

5. **Install and start the frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev  # Runs on http://localhost:5173
   ```

## 💻 Development

### Backend Commands

```bash
# From the backend directory:
npm run dev        # Start development server with auto-reload
npm run build      # Build TypeScript to JavaScript
npm run watch      # Watch mode for TypeScript compilation
npm run test       # Run tests with Jest
```

### Frontend Commands

```bash
# From the frontend directory:
npm run dev        # Start development server
npm run build      # Build for production
npm run lint       # Run ESLint
npm run preview    # Preview production build
```

### API Documentation

The API documentation is available at http://localhost:3000/api-docs when the backend is running.

## 🏗️ Architecture

### Backend

The backend follows a typical Express MVC pattern:
- `src/models/` - Sequelize ORM models (Product, Review, User, Wishlist)
- `src/controllers/` - Request handlers
- `src/routes/` - API route definitions
- `src/middleware/` - Auth, error handling, and other middleware
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
- Context API for state management (AuthContext, CartContext)
- Tailwind CSS for styling

The component structure includes:
- Product browsing and filtering (ProductList)
- Product details with reviews (ProductDetails)
- User authentication (AuthForm)
- User wishlist management (Wishlist)
- Shopping cart functionality (Cart)
- Admin dashboard (AdminDashboard)

### Database Schema

The primary models are:
- **Product**: Product catalog items with name, description, price, etc.
- **User**: User accounts with authentication details
- **Review**: Product reviews with ratings
- **Wishlist**: User-saved product collections

## 🧪 Testing

The application includes comprehensive test coverage:

- **Backend Tests**: `npm test` in the backend directory
- **Frontend Unit Tests**: `npm test` in the frontend directory
- **Frontend E2E Tests**: `npm run test:e2e` in the frontend directory

## 🔐 Environment Setup

### Backend Environment Variables (.env)

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

### Frontend Environment Variables (.env)

```
VITE_API_URL=http://localhost:3000/api
```

## 🔄 API Endpoints

The API includes the following main endpoints:

- **Products**: `/api/products`
  - GET `/api/products` - List all products with filters and pagination
  - GET `/api/products/categories` - Get all product categories
  - GET `/api/products/:id` - Get product details by ID

- **Reviews**: `/api/reviews`
  - GET `/api/reviews/product/:id` - Get reviews for a product
  - POST `/api/reviews/product/:id` - Add a review to a product

- **Users**: `/api/users`
  - POST `/api/users/register` - Register a new user
  - POST `/api/users/login` - Authenticate a user
  - PATCH `/api/users/preferences` - Update user preferences

- **Wishlist**: `/api/wishlist`
  - GET `/api/wishlist` - Get user's wishlist
  - POST `/api/wishlist/product/:id` - Add product to wishlist
  - DELETE `/api/wishlist/product/:id` - Remove product from wishlist

- **Admin**: `/api/admin`
  - Various administrative endpoints for managing the system

## 📄 License

MIT License - See [LICENSE](LICENSE) file for details