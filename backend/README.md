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
│   ├── cache.js              # Response caching middleware
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
   
   # Security
   ALLOWED_ORIGINS=http://localhost:5173
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX=100
   
   # Options
   SEED_DATABASE=true
   FORCE_SYNC=false
   SEED_COUNT=100
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

## Key Features

### API Documentation

API documentation is available at `/api-docs` when the server is running. The documentation is generated using Swagger/OpenAPI and provides:

- Endpoint descriptions
- Request/response schemas
- Authentication requirements
- Try-it-out functionality

### Security Features

The application implements several security measures:

1. **Authentication**: JWT-based authentication with refresh token capabilities
2. **Authorization**: Role-based access control for admin functionality
3. **Rate Limiting**: Configurable rate limiting to prevent abuse
   ```javascript
   // Different rate limits for different routes
   app.use('/api/products', createRateLimiter('productSearch'));  // More lenient
   app.use('/api/auth', createRateLimiter('auth'));  // Stricter
   ```
4. **Input Validation**: Request validation to prevent malicious input
5. **Security Headers**: Helmet middleware for HTTP security headers
6. **CORS Protection**: Configurable CORS settings
7. **Error Handling**: Sanitized error responses in production

### Caching

The application uses in-memory caching for frequently accessed data:

```javascript
// Cache product list for 5 minutes (300 seconds)
router.get('/', optionalAuth, cacheMiddleware(300, generateQueryCacheKey), productController.getAllProducts);

// Cache categories for 1 hour (3600 seconds) since they rarely change
router.get('/categories', cacheMiddleware(3600), productController.getProductCategories);
```

The caching system:
- Supports custom key generation for query parameters
- Has configurable TTL (Time To Live) per route
- Automatically invalidates on related data mutations

### Error Handling

The application uses a centralized error handling mechanism with custom error classes for different HTTP status codes.

```javascript
// AppError class for consistent error handling
throw new AppError('Product not found', 404);

// Centralized error handler
app.use(errorHandler);
```

### Authentication

JWT-based authentication is implemented with middleware for both required and optional authentication:

```javascript
// Required authentication
router.get('/wishlist', auth, wishlistController.getUserWishlist);

// Optional authentication (for personalized content)
router.get('/products', optionalAuth, productController.getAllProducts);
```

### Data Validation

Input validation is performed using middleware before reaching controllers:

```javascript
router.post(
  '/users/register',
  validateUserRegistration,
  userController.registerUser
);
```

## Database Models

### Relationships

- **User** - Has many Reviews and one Wishlist
- **Product** - Has many Reviews and belongs to many Users through Wishlist
- **Review** - Belongs to one User and one Product
- **Wishlist** - Belongs to one User and has many Products

### Migrations

Database migrations are handled using Sequelize's sync feature with the option to force sync during development.

## Response Format

All API responses follow a standard format:

```json
{
  "success": true,
  "data": {...},
  "message": "Optional message",
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalItems": 100,
      "totalPages": 10
    }
  }
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

## Performance Optimization

The backend implements several performance optimizations:

1. **Database Indexing**: Indexes on frequently queried fields
2. **Response Compression**: gzip compression for all responses
3. **Query Optimization**: Efficient SQL queries with proper JOINs
4. **Pagination**: All list endpoints support pagination
5. **Caching**: In-memory caching for frequently accessed data

## Contributing

Please follow these guidelines when contributing:

1. Use TypeScript for all new code
2. Follow the existing architecture and patterns
3. Write tests for new features
4. Document API endpoints with JSDoc comments for Swagger