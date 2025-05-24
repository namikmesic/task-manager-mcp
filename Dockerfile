# Build stage
FROM node:22.15-alpine AS builder

# Install security updates
RUN apk update && apk upgrade && rm -rf /var/cache/apk/*

WORKDIR /app

# Copy dependency files first for better caching
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies with clean install and audit
RUN npm ci --audit && npm audit fix --audit-level=moderate || true

# Copy source files
COPY eslint.config.js ./
COPY *.ts ./

# Build the TypeScript code
RUN npm run build

# Production stage
FROM node:22.15-alpine AS production-deps

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies with security audit
RUN npm ci --omit=dev --ignore-scripts && \
    npm audit fix --production --audit-level=moderate || true

# Final stage
FROM node:22.15-alpine AS release

# Install security updates and dumb-init for proper signal handling
RUN apk update && \
    apk upgrade && \
    apk add --no-cache dumb-init && \
    rm -rf /var/cache/apk/*

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Copy built files and dependencies with proper ownership
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=production-deps --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./package.json

# Create data directory with proper permissions
RUN mkdir -p /app/data && chown -R nodejs:nodejs /app/data

# Switch to non-root user
USER nodejs

# Set environment variables
ENV TASK_FILE_PATH=/app/data/tasks.json \
    NODE_ENV=production \
    NODE_OPTIONS="--max-old-space-size=512"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/index.js"]