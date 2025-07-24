# Frontend Dockerfile for development environment
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Start development server with hot reload
CMD ["sh", "-c", "npm install && npm run dev -- --host 0.0.0.0 --port 3000"]