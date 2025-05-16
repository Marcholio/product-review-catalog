# Product Review Catalog Frontend

This is the frontend application for the Product Review Catalog, built with React, TypeScript, and Vite.

## Features

- Product catalog browsing with filtering and sorting
- Product details page with reviews
- User authentication (login/register)
- Wishlist management
- Shopping cart functionality
- Admin dashboard
- Responsive design with Tailwind CSS
- Dark mode support

## Tech Stack

- React 18
- TypeScript
- Vite for build tooling
- React Router for navigation
- Context API for state management
- Tailwind CSS for styling
- React Icons

## Project Structure

```
src/
├── assets/           # Static assets like images
├── components/       # React components
│   ├── admin/        # Admin dashboard components
│   ├── cart/         # Shopping cart components
│   ├── onboarding/   # User onboarding components
│   ├── productDetails/ # Product details components
│   ├── products/     # Product listing components
│   └── ui/           # Reusable UI components
├── contexts/         # React context providers
│   ├── AuthContext.tsx  # Authentication state
│   ├── CartContext.tsx  # Shopping cart state
│   └── OnboardingContext.tsx # Onboarding state
├── hooks/            # Custom React hooks
├── types/            # TypeScript type definitions
└── utils/            # Utility functions
```

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or yarn

### Installation

1. Create a `.env` file in the frontend directory with the following content:
   ```
   VITE_API_URL=http://localhost:3000/api
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

The application will be available at http://localhost:5173.

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview the production build
- `npm test` - Run unit tests
- `npm run test:e2e` - Run end-to-end tests

## Key Components

### Authentication

Authentication is managed through the `AuthContext` which provides:
- User login/register functionality
- User profile and preferences management
- Protected routes for authenticated users only

### Products

Product-related components include:
- `ProductList` - Main product browsing page with filtering
- `ProductDetails` - Detailed product view with reviews
- `FeaturedProducts` - Showcase of highest-rated products

### User Features

User-specific features include:
- `Wishlist` - Save and manage favorite products
- `Cart` - Shopping cart with checkout functionality
- `UserPreferences` - User settings and preferences

### Admin Dashboard

The admin dashboard provides management interfaces for:
- Product management (CRUD operations)
- Review moderation
- User management
- Analytics and reporting

## API Communication

The application communicates with the backend API using fetch. The base URL is configured in the `.env` file.

Example API call:
```typescript
const fetchProducts = async () => {
  try {
    const response = await fetch(`${API_URL}/products`);
    if (!response.ok) throw new Error('Failed to fetch products');
    const data = await response.json();
    return data.success && data.data ? data.data : data;
  } catch (err) {
    console.error('Error fetching products:', err);
    throw err;
  }
};
```

## State Management

The application uses React Context API for state management:

- `AuthContext` - Manages user authentication and profile
- `CartContext` - Manages shopping cart state
- `OnboardingContext` - Manages user onboarding flow

## Styling

The application uses Tailwind CSS for styling with a responsive design approach:

```jsx
<div className="flex flex-col md:flex-row justify-between p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
  {/* Component content */}
</div>
```

## Testing

The frontend uses React Testing Library and Jest for unit tests, and Playwright for end-to-end tests.

## Contributing

Please follow these guidelines when contributing to the frontend:

1. Use TypeScript for all new components and functions
2. Follow the existing component structure and naming conventions
3. Write tests for new features
4. Follow the ESLint configuration for code style