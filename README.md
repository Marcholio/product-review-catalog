# Product Review Catalog

A full-stack application for managing product catalogs with user reviews.

## Features

- Product catalog browsing and searching
- User authentication and authorization
- Product reviews and ratings
- Admin dashboard for product management
- RESTful API backend
- PostgreSQL database for persistent storage

## Project Structure

```
.
├── frontend/           # React frontend application
├── backend/           # Node.js Express backend
└── docker/            # Docker configuration files
```

## Prerequisites

- Node.js (v18 or later)
- Docker and Docker Compose
- PostgreSQL (if running locally)
- npm or yarn

## Quick Start

1. Clone the repository
2. Start the database:
   ```bash
   docker-compose up -d db
   ```
3. Install and start the backend:
   ```bash
   cd backend
   npm install
   npm run dev
   ```
4. Install and start the frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## Development

- Frontend runs on http://localhost:5173
- Backend API runs on http://localhost:3000
- PostgreSQL runs on localhost:5432

## Testing

The application includes comprehensive test coverage:

- **Unit tests**: `npm test` in the frontend directory
- **End-to-End tests**: `npm run test:e2e` in the frontend directory

See [frontend/TESTING.md](frontend/TESTING.md) for detailed testing documentation.

## Environment Variables

Create `.env` files in both frontend and backend directories. Example configurations are provided in `.env.example` files.

## License

MIT License - See LICENSE file for details
