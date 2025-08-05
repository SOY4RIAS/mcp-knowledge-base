# Use Bun as base image
FROM oven/bun:1 as base

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json bun.lockb ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN bun run build

# Production stage
FROM oven/bun:1-slim as production

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S bun -u 1001

# Set working directory
WORKDIR /app

# Copy built application
COPY --from=base --chown=bun:nodejs /app/dist ./dist
COPY --from=base --chown=bun:nodejs /app/package.json ./

# Switch to non-root user
USER bun

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start the application
CMD ["bun", "run", "start"] 