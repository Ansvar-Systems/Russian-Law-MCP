# ===============================================================================
# MCP SERVER DOCKERFILE
# ===============================================================================
#
# Multi-stage Dockerfile for building and running the Russian Law MCP server.
#
# IMPORTANT: The database must be pre-built BEFORE running docker build.
# It is NOT built during the Docker build because the DB includes ingested
# data that requires network access to pravo.gov.ru.
#
# Build:
#   npm run build
#   docker build -t russian-law-mcp .
#
# Run (stdio mode):
#   docker run -i russian-law-mcp node dist/index.js
#
# Run (HTTP mode for Fly.io / remote access):
#   docker run -p 8080:8080 russian-law-mcp
#
# ===============================================================================

# -------------------------------------------------------------------------------
# STAGE 1: BUILD
# -------------------------------------------------------------------------------

FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --ignore-scripts

COPY tsconfig.json ./
COPY src ./src

RUN npm run build

# -------------------------------------------------------------------------------
# STAGE 2: PRODUCTION
# -------------------------------------------------------------------------------

FROM node:20-alpine AS production

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

# Copy compiled JavaScript from builder stage
COPY --from=builder /app/dist ./dist

# Copy pre-built database
COPY data/database.db ./data/database.db

# Security: non-root user
RUN addgroup -S nodejs && adduser -S nodejs -G nodejs \
 && chown -R nodejs:nodejs /app/data
USER nodejs

# Environment
ENV NODE_ENV=production
ENV RUSSIAN_LAW_DB_PATH=/app/data/database.db
ENV PORT=8080

EXPOSE 8080

# Default: HTTP server for remote deployment (Fly.io)
# Override with "node dist/index.js" for stdio mode
CMD ["node", "dist/serve.js"]
