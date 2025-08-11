# syntax=docker/dockerfile:1
FROM node:20-alpine

WORKDIR /app

# Install dependencies for backend only
COPY backend/package.json ./backend/package.json
COPY backend/package-lock.json ./backend/package-lock.json
RUN cd backend && if [ -f package-lock.json ]; then npm ci; else npm install; fi

# Copy source
COPY backend ./backend

# Expose and run
WORKDIR /app/backend
EXPOSE 5000
CMD ["npm", "start"]