# Development Environment Setup

## Prerequisites

Before setting up the development environment, ensure you have the following installed:

### Required Software
- **Docker**: Version 20.10 or higher
- **Docker Compose**: Version 2.0 or higher
- **Git**: For version control

### Optional (for local development without Docker)
- **Node.js**: Version 18 or higher
- **npm**: Comes with Node.js
- **Rust**: Version 1.70 or higher with Cargo
- **PostgreSQL**: Version 15 or higher

## Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/saitotm/md-todo.git
cd md-todo
```

### 2. Start with Docker Compose
```bash
# Start all services in detached mode
docker-compose up -d

# View logs (optional)
docker-compose logs -f
```

### 3. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Database**: PostgreSQL on localhost:5432

### 4. Stop the Application
```bash
docker-compose down
```

## Development Setup Options

### Option 1: Full Docker Development (Recommended)

This is the easiest way to get started and ensures consistency across different environments.

```bash
# Start all services
docker-compose up -d

# View specific service logs
docker-compose logs frontend
docker-compose logs backend
docker-compose logs db

# Restart a specific service
docker-compose restart backend

# Rebuild and start (after code changes)
docker-compose up -d --build
```

### Option 2: Local Development

For faster development cycles, you can run services locally while keeping the database in Docker.

#### Start Database Only
```bash
# Start only PostgreSQL
docker-compose up -d db
```

#### Frontend Development
```bash
cd frontend
npm install
npm run dev
```
Frontend will be available at http://localhost:3000

#### Backend Development
```bash
cd backend
cargo run
```
Backend will be available at http://localhost:8000

## Environment Variables

Copy the example environment file:
```bash
cp .env.example .env
```

Edit `.env` with your specific configuration:
```env
# Database Configuration
POSTGRES_DB=md_todo_dev
POSTGRES_USER=md_todo_user
POSTGRES_PASSWORD=md_todo_password
DATABASE_URL=postgres://md_todo_user:md_todo_password@localhost:5432/md_todo_dev

# Application Configuration
API_URL=http://localhost:8000
RUST_LOG=debug
```

## Testing

### Run All Tests
```bash
# Using Docker
docker-compose exec frontend npm test
docker-compose exec backend cargo test

# Local development
cd frontend && npm test
cd backend && cargo test
```

### Frontend Testing
```bash
cd frontend
npm test                 # Run tests once
npm run test:ui         # Run tests with UI
```

### Backend Testing
```bash
cd backend
cargo test              # Run all tests
cargo test --verbose    # Run with detailed output
```

## Development Commands

### Frontend Commands
```bash
cd frontend
npm run dev             # Start development server
npm run build           # Build for production
npm run lint            # Run ESLint
npm run typecheck       # Run TypeScript type checking
```

### Backend Commands
```bash
cd backend
cargo run               # Start development server
cargo build             # Build the project
cargo test              # Run tests
cargo fmt               # Format code
cargo clippy            # Run linter
```

### Database Commands
```bash
# Connect to database
docker-compose exec db psql -U md_todo_user -d md_todo_dev

# View database logs
docker-compose logs db

# Reset database (removes all data)
docker-compose down
docker volume rm md-todo_postgres_data
docker-compose up -d db
```

## Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Check what's using the port
lsof -i :3000  # or :8000, :5432

# Stop conflicting services
docker-compose down
```

#### Database Connection Issues
```bash
# Check database status
docker-compose ps db

# Restart database
docker-compose restart db

# Check database logs
docker-compose logs db
```

#### Build Failures
```bash
# Clean and rebuild
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

#### Permission Issues (Linux/WSL)
```bash
# Fix Docker permissions
sudo usermod -aG docker $USER
# Log out and log back in
```

## IDE Setup

### VS Code Extensions
- **Frontend**: ES7+ React/Redux/React-Native snippets, Tailwind CSS IntelliSense
- **Backend**: rust-analyzer, CodeLLDB
- **General**: Docker, GitLens, Prettier