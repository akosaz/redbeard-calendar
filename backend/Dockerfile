# Multi-stage build for optimized production image

# Stage 1: Build
FROM node:24-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci --verbose

# Copy backend source
COPY backend ./backend

# Build backend
RUN npm run build --workspace=backend

# Stage 2: Production
FROM node:24-alpine AS production

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy built application from builder
COPY --from=builder /app/backend/dist ./dist

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Change ownership
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application
CMD ["node", "dist/server.js"]
