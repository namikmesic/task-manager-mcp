FROM node:22.12-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install all dependencies for building
RUN npm ci

# Copy source code
COPY index.ts ./

# Build the TypeScript code
RUN npm run build

# Install only production dependencies
RUN npm ci --omit=dev

FROM node:22-alpine AS release

WORKDIR /app

# Copy built files and production dependencies
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Create data directory
RUN mkdir -p /app/data

# Set environment variable for data persistence
ENV TASK_FILE_PATH=/app/data/tasks.json
ENV NODE_ENV=production

ENTRYPOINT ["node", "dist/index.js"]