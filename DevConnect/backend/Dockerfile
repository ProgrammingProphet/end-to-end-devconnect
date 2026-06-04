# syntax=docker/dockerfile:1.6

# 1. Build Stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev

# 2. Production Stage
FROM node:20-alpine
ENV NODE_ENV=production
WORKDIR /app

# Copy dependency files and node_modules from builder stage
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./
COPY src/ ./src/

# Use non-root user
USER node

# Expose backend port
EXPOSE 5000

# Start server
CMD ["node", "src/server.js"]

