# Multi-stage build for optimized production image
# Stage 1: Build
FROM node:20-alpine AS builder

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Set HUSKY=0 to skip husky git hooks in Docker
ENV HUSKY=0

WORKDIR /app

# Copy root package files and lockfile
COPY package.json package-lock.json turbo.json ./
COPY tsconfig*.json ./

# Copy workspace package.json files
COPY apps/server/package.json ./apps/server/
COPY packages/db/package.json ./packages/db/

# Install all dependencies (including dev dependencies)
RUN npm ci

# Copy source code
COPY apps/ ./apps/
COPY packages/ ./packages/

# Build the application
RUN npm run build

# Stage 2: Production dependencies
FROM node:20-alpine AS deps

# Install build dependencies needed for bcrypt
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy root package files and lockfile
COPY package.json package-lock.json turbo.json ./

# Copy workspace package.json files
COPY apps/server/package.json ./apps/server/
COPY packages/db/package.json ./packages/db/

# Install only production dependencies (ignore all scripts including husky)
RUN npm ci --omit=dev --ignore-scripts

# Rebuild bcrypt native bindings for Alpine Linux
RUN npm rebuild bcrypt

# Stage 3: Production runtime
FROM node:20-alpine AS production

WORKDIR /app

# Copy root package files
COPY package.json package-lock.json turbo.json ./

# Copy workspace package.json files
COPY apps/server/package.json ./apps/server/
COPY packages/db/package.json ./packages/db/

# Copy all node_modules from deps stage (npm workspaces hoists to root)
COPY --from=deps /app/node_modules ./node_modules

# Copy built application from builder stage
COPY --from=builder /app/apps/server/dist ./apps/server/dist
COPY --from=builder /app/packages/db/dist ./packages/db/dist

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Change ownership
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/', (res) => { process.exit(res.statusCode === 200 ? 0 : 1); })"

# Start the application
CMD ["node", "apps/server/dist/index.js"]
