# syntax=docker/dockerfile:1
FROM node:20-alpine

WORKDIR /app

# Install dependencies for backend only
COPY backend/package.json backend/package-lock.json* ./backend/
RUN cd backend && npm ci || npm install

# Copy source
COPY backend ./backend

# Expose and run
WORKDIR /app/backend
EXPOSE 5000
CMD ["npm", "start"]