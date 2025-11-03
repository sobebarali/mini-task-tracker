# Multi-stage build for optimized production image
# Stage 1: Build
FROM node:20-alpine AS builder

# Install build dependencies
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY turbo.json ./
COPY tsconfig*.json ./

# Copy workspace packages
COPY apps/server/package.json ./apps/server/
COPY packages/db/package.json ./packages/db/

# Install dependencies
RUN npm ci

# Copy source code
COPY apps/ ./apps/
COPY packages/ ./packages/

# Build the application
RUN npm run build

# Stage 2: Production
FROM node:20-alpine AS production

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY turbo.json ./

# Copy workspace packages
COPY apps/server/package.json ./apps/server/
COPY packages/db/package.json ./packages/db/

# Install only production dependencies
RUN npm ci --only=production

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
