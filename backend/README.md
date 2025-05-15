# Product Review Catalog - Backend

The backend service for the Product Review Catalog application, providing APIs for managing products, reviews, wishlists, and users.

## Architecture

The backend follows a clean, layered architecture:

- **Controllers**: Handle HTTP requests/responses
- **Services**: Contain business logic
- **Models**: Define data schema and database interactions
- **Routes**: Define API endpoints
- **Middleware**: Handle cross-cutting concerns
- **Utils**: Reusable utility functions
- **Config**: Application configuration

## Directory Structure

```
src/
├── app.ts                    # Express application setup
├── server.ts                 # Server entry point
├── config/                   # Configuration files
│   ├── database.ts           # Database connection
│   ├── environment.ts        # Environment variables
│   ├── security.ts           # Security settings
│   └── swagger.ts            # API documentation
├── controllers/              # Request handlers
│   ├── productController.ts
│   ├── reviewController.ts
│   ├── userController.ts
│   └── wishlistController.ts
├── db/                       # Database utilities
│   ├── init.ts               # Database initialization
│   ├── seed.ts               # Database seeding
│   └── seedData.ts           # Seed data
├── middleware/               # Express middleware
│   ├── auth/                 # Authentication middleware
│   │   ├── authMiddleware.ts
│   │   ├── index.ts
│   │   └── tokenService.ts
│   ├── errorHandler.ts       # Global error handler
│   └── validation/           # Request validation
├── models/                   # Sequelize models
│   ├── Product.ts
│   ├── Review.ts
│   ├── User.ts
│   └── Wishlist.ts
├── routes/                   # API routes
│   ├── productRoutes.ts
│   ├── reviewRoutes.ts
│   ├── userRoutes.ts
│   └── wishlistRoutes.ts
├── services/                 # Business logic
│   ├── productService.ts
│   ├── reviewService.ts
│   ├── userService.ts
│   └── wishlistService.ts
└── utils/                    # Utility functions
    ├── errors/               # Custom error classes
    │   └── AppError.ts
    ├── helpers/              # Helper utilities
    │   ├── asyncHandler.ts
    │   ├── paginationHelper.ts
    │   └── responseHandler.ts
    ├── ratingUtils.ts        # Rating calculation utilities
    └── validators/           # Input validation
```

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- PostgreSQL database

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file with the following variables:
   ```
   # Server
   PORT=3000
   NODE_ENV=development
   
   # Database
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=product_catalog
   DB_USER=admin
   DB_PASSWORD=adminpass
   
   # Auth
   JWT_SECRET=your-secret-key-for-jwt
   JWT_EXPIRES_IN=1d
   
   # Options
   SEED_DATABASE=true
   FORCE_SYNC=false
   ```

3. Build the project:
   ```bash
   npm run build
   ```

4. Start development server:
   ```bash
   npm run dev
   ```

### Available Scripts

- `npm start`: Run the production server
- `npm run dev`: Run the development server
- `npm run dev:seed`: Run the development server with database seeding
- `npm run build`: Build the project
- `npm run watch`: Watch for changes and rebuild
- `npm run test`: Run tests
- `npm run lint`: Run linting
- `npm run seed`: Seed the database

## API Documentation

API documentation is available at `/api-docs` when the server is running.

## Error Handling

The application uses a centralized error handling mechanism with custom error classes for different HTTP status codes.

## Authentication

JWT-based authentication is implemented with middleware for both required and optional authentication.

## Data Validation

Input validation is performed using middleware before reaching controllers.

## Response Format

All API responses follow a standard format:

```json
{
  "success": true,
  "data": {...},
  "message": "Optional message",
  "meta": {...}
}
```

Error responses:

```json
{
  "error": "Error name",
  "message": "Error message",
  "context": {...}
}
```