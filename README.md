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

- **Docker and Docker Compose** (recommended)
- OR Node.js (v18+) for local development

### Quick Start with Docker (Recommended)

The easiest way to run the entire application stack (API + MongoDB + Redis):

1. **Clone the repository:**
```bash
git clone <repository-url>
cd mini-task-tracker
```

2. **Set up environment variables:**

Copy the example environment file:
```bash
cp .env.example .env
```

Edit `.env` and set your JWT secret (min 32 characters):
```env
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-change-this
```

3. **Start all services with Docker Compose:**

**Production mode:**
```bash
docker-compose up -d
```

**Development mode (with hot reload):**
```bash
docker-compose -f docker-compose.dev.yml up
```

4. **Verify the services are running:**
```bash
# Check service status
docker-compose ps

# View logs
docker-compose logs -f api
```

The API is now running at **http://localhost:3000**

5. **Stop the services:**
```bash
# Stop containers
docker-compose down

# Stop and remove volumes (clears all data)
docker-compose down -v
```

### Local Development (Without Docker)

If you prefer to run the services locally:

1. **Install dependencies:**
```bash
npm install
```

2. **Set up environment variables:**

Create `apps/server/.env`:
```env
NODE_ENV=development
PORT=3000
DATABASE_URL=mongodb://root:password@localhost:27017/mini-task-tracker?authSource=admin
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

### Docker Commands
```bash
# Production mode (optimized build)
docker-compose up -d                  # Start all services in background
docker-compose down                   # Stop all services
docker-compose down -v                # Stop and remove volumes (clears data)
docker-compose logs -f api            # View API logs
docker-compose ps                     # Check service status
docker-compose restart api            # Restart API service

# Development mode (with hot reload)
docker-compose -f docker-compose.dev.yml up        # Start in dev mode
docker-compose -f docker-compose.dev.yml down      # Stop dev services
docker-compose -f docker-compose.dev.yml logs -f   # View all logs

# Rebuild after code changes
docker-compose build --no-cache api   # Rebuild API image
docker-compose up -d --build          # Rebuild and restart
```

### Development (Local)
```bash
npm run dev              # Start dev server (hot reload)
npm run dev:server       # Start only server
npm run check-types      # TypeScript type checking
npm run check            # Run Biome linting/formatting
```

### Database (Local - Docker containers only)
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
npm start                # Start production server (local)

# Or use Docker:
docker-compose up -d     # Start production stack with Docker
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

| Variable | Description | Default | Docker |
|----------|-------------|---------|--------|
| `NODE_ENV` | Environment mode | `development` | ✅ |
| `PORT` | Server port | `3000` | ✅ |
| `DATABASE_URL` | MongoDB connection string | `mongodb://root:password@localhost:27017/mini-task-tracker?authSource=admin` | Auto-configured |
| `REDIS_HOST` | Redis host | `localhost` | Auto-configured to `redis` |
| `REDIS_PORT` | Redis port | `6379` | ✅ |
| `JWT_SECRET` | Secret key for JWT (min 32 chars) | **Required** | ✅ Required in `.env` |
| `JWT_EXPIRES_IN` | JWT token expiration | `7d` | ✅ |
| `CORS_ALLOWED_ORIGINS` | Comma-separated allowed origins | `*` | ✅ |

**Note:** When using Docker Compose, the `DATABASE_URL` and `REDIS_HOST` are automatically configured to use Docker service names (`mongodb` and `redis`). You only need to set `JWT_SECRET` and optionally `PORT` and `CORS_ALLOWED_ORIGINS` in your `.env` file.

## Docker Architecture

The application uses a multi-container Docker setup:

```
┌─────────────────────────────────────────┐
│         Docker Network                  │
│                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────┐ │
│  │   API    │  │ MongoDB  │  │ Redis│ │
│  │  Server  │◄─┤ Database │  │Cache │ │
│  │  :3000   │  │  :27017  │  │:6379 │ │
│  └────┬─────┘  └──────────┘  └──────┘ │
│       │                                │
└───────┼────────────────────────────────┘
        │
        ▼
   Host :3000
```

### Docker Files

- `Dockerfile` - Multi-stage production build (optimized)
- `Dockerfile.dev` - Development build with hot reload
- `docker-compose.yml` - Production stack configuration
- `docker-compose.dev.yml` - Development stack with volume mounts
- `.dockerignore` - Excludes unnecessary files from build

### Production vs Development

**Production (`docker-compose.yml`):**
- Optimized multi-stage build
- Minimal image size
- No source code mounting
- Non-root user for security
- Health checks enabled
- Automatic restarts

**Development (`docker-compose.dev.yml`):**
- Source code mounted as volumes
- Hot reload with `tsx watch`
- All dev dependencies included
- Faster iteration cycle
- Logs visible in terminal

## Contributing

1. Follow the existing code style (enforced by Biome)
2. Write tests before implementation (TDD)
3. Ensure all tests pass: `npm test`
4. Run type checking: `npm run check-types`
5. Run linting: `npm run check`
6. Maintain 70%+ test coverage

## License

MIT
