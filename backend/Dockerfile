# Backend Dockerfile for development environment
FROM rust:1.81-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    pkg-config \
    libssl-dev \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install cargo-watch for hot reload
RUN cargo install cargo-watch

# Set working directory
WORKDIR /app

# Copy Cargo files
COPY Cargo.toml Cargo.lock ./

# Create dummy main.rs and lib.rs to cache dependencies
RUN mkdir src && echo "fn main() {}" > src/main.rs && echo "" > src/lib.rs

# Build dependencies (this will be cached)
RUN cargo build --release
RUN rm -rf src

# Copy source code
COPY src ./src

# Expose port
EXPOSE 8000

# Start development server with hot reload
CMD ["cargo", "watch", "-x", "run"]