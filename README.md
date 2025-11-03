# Mini Task Tracker

A REST API task management system built with Node.js, Express, TypeScript, MongoDB, and Redis caching.

## Tech Stack

- **Node.js** - Runtime environment
- **Express** - Web framework
- **TypeScript** - Type safety (strict mode)
- **Mongoose** - MongoDB ODM with schema validation
- **MongoDB** - NoSQL database
- **Redis** - Caching layer for performance
- **JWT** - Secure authentication
- **Jest** - Testing framework with 70%+ coverage
- **Zod** - Runtime input validation
- **Turborepo** - Monorepo build system
- **Biome** - Linter and formatter
- **Husky** - Git hooks for code quality

## Features

- ✅ RESTful API with layered architecture (Controller → Service → Repository)
- ✅ JWT-based authentication with 7-day token expiration
- ✅ Password hashing with bcrypt
- ✅ Redis caching for GET requests with automatic invalidation
- ✅ Input validation with Zod schemas
- ✅ Comprehensive test suite (49 tests, 70%+ coverage)
- ✅ Request ID tracing for debugging
- ✅ User-specific task management with authorization
- ✅ Docker Compose for MongoDB and Redis
- ✅ Type-safe database operations with Mongoose

## Getting Started

### Prerequisites

- Node.js (v18+)
- Docker and Docker Compose (for MongoDB and Redis)

### Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Set up environment variables:**

Create `apps/server/.env`:
```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/mini-task-tracker
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=your-super-secret-jwt-key-min-32-characters
```

3. **Start MongoDB and Redis with Docker:**
```bash
npm run db:start
```

4. **Run the development server:**
```bash
npm run dev
```

The API is now running at **http://localhost:3000**

## Project Structure

```
mini-task-tracker/
├── apps/
│   └── server/                    # Express REST API
│       ├── src/
│       │   ├── apis/              # Feature-based organization
│       │   │   ├── auth/          # Authentication feature
│       │   │   │   ├── controllers/    # HTTP handlers
│       │   │   │   ├── services/       # Business logic
│       │   │   │   ├── validators/     # Zod schemas
│       │   │   │   ├── types/          # TypeScript types
│       │   │   │   └── auth.routes.ts  # Route definitions
│       │   │   └── tasks/         # Tasks feature
│       │   │       ├── controllers/    # HTTP handlers
│       │   │       ├── services/       # Business logic
│       │   │       ├── repository/     # DB + Redis operations
│       │   │       ├── validators/     # Zod schemas
│       │   │       ├── types/          # TypeScript types
│       │   │       └── tasks.routes.ts # Route definitions
│       │   ├── middleware/        # Auth middleware
│       │   └── index.ts           # App entry point
│       └── tests/                 # Jest tests (49 tests)
│           ├── auth/
│           └── tasks/
└── packages/
    └── db/                        # Database package
        ├── src/
        │   ├── models/            # Mongoose schemas
        │   │   ├── user.model.ts
        │   │   └── task.model.ts
        │   └── index.ts           # DB connection + exports
        └── docker-compose.yml     # MongoDB + Redis
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login and receive JWT token

### Tasks (Requires Authentication)
- `GET /api/tasks` - List all tasks (Redis cached)
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

**Authentication:** Include `Authorization: Bearer <token>` header

## Available Scripts

### Development
```bash
npm run dev              # Start dev server (hot reload)
npm run dev:server       # Start only server
npm run check-types      # TypeScript type checking
npm run check            # Run Biome linting/formatting
```

### Database
```bash
npm run db:start         # Start MongoDB + Redis (detached)
npm run db:watch         # Start MongoDB + Redis (logs visible)
npm run db:stop          # Stop containers
npm run db:down          # Stop and remove containers
```

### Testing
```bash
npm test                 # Run all tests
npm run test:coverage    # Run tests with coverage report
npm run test:watch       # Run tests in watch mode
```

### Production
```bash
npm run build            # Build for production
npm start                # Start production server
```

## Architecture

**Layered Architecture Pattern:**
```
Controller → Service → Repository → Database/Redis
           ↓
      Validators (Zod)
```

**Layer Responsibilities:**
- **Controllers**: HTTP request/response, auth checks, validation calls
- **Services**: Business logic orchestration, logging with request IDs
- **Repository**: Database operations, Redis caching, data transformation
- **Validators**: Zod schemas for input validation
- **Types**: TypeScript interfaces for type safety

**Key Patterns:**
- Request IDs for tracing: `randomBytes(16).toString('hex')`
- Consistent response format: `{ data: T | null, error: APIError | null }`
- Redis caching on GET with 5-minute TTL
- Cache invalidation on create/update/delete operations
- User-specific cache keys for data isolation

## Testing

The project follows **Test-Driven Development (TDD)** with comprehensive test coverage:

- **49 tests** covering all features
- **70%+ code coverage** across the codebase
- Integration tests for full request/response cycles
- Unit tests for middleware and validation
- Mocked MongoDB (mongodb-memory-server) and Redis

Run tests:
```bash
npm test                 # Run all tests
npm run test:coverage    # View coverage report
```

## Security Features

- ✅ Password hashing with bcrypt (10 rounds)
- ✅ JWT authentication with expiration
- ✅ Input validation with Zod schemas
- ✅ Authorization checks (users can only access their own tasks)
- ✅ Mongoose schema validation
- ✅ User-specific cache keys
- ✅ Environment variable configuration
- ✅ Request size limits
- ✅ No sensitive data in responses

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `3000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/mini-task-tracker` |
| `REDIS_HOST` | Redis host | `localhost` |
| `REDIS_PORT` | Redis port | `6379` |
| `JWT_SECRET` | Secret key for JWT (min 32 chars) | **Required** |

## Contributing

1. Follow the existing code style (enforced by Biome)
2. Write tests before implementation (TDD)
3. Ensure all tests pass: `npm test`
4. Run type checking: `npm run check-types`
5. Run linting: `npm run check`
6. Maintain 70%+ test coverage

## License

MIT
