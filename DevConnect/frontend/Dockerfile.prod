# syntax=docker/dockerfile:1.6

############################
# 1️⃣ Build Stage
############################
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency files first for caching
COPY package*.json ./

# Install dependencies
RUN --mount=type=cache,target=/root/.npm \
    npm ci

# Copy source code
COPY . .

# Set production environment variables
ENV VITE_API_URL=/api
ENV VITE_ENVIRONMENT=production

# Build the app
RUN npm run build


############################
# 2️⃣ Production Stage
############################
FROM nginxinc/nginx-unprivileged:1.27-alpine

# Switch to root for file operations
USER root

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy built assets and fix permissions
COPY --from=builder /app/dist /usr/share/nginx/html
RUN chown -R nginx:nginx /usr/share/nginx/html

# Copy nginx configuration and fix permissions
COPY nginx.conf /etc/nginx/conf.d/default.conf
RUN chown -R nginx:nginx /etc/nginx/conf.d

# Switch back to the unprivileged user
USER nginx

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:8080/ || exit 1

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]