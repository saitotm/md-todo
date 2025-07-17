# Docker Development Environment

This document describes how to set up and use the Docker development environment for the MD-Todo application.

## Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+

## Quick Start

1. **Clone the repository and navigate to the project directory**
   ```bash
   git clone <repository-url>
   cd md-todo
   ```

2. **Copy environment variables**
   ```bash
   cp .env.example .env
   ```

3. **Start the development environment**
   ```bash
   docker-compose up -d
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - PostgreSQL: localhost:5432

## Services

### Database (PostgreSQL)
- **Container**: `md-todo-db`
- **Port**: 5432
- **Database**: `md_todo_dev`
- **User**: `md_todo_user`
- **Password**: `md_todo_password`

### Backend (Rust + axum)
- **Container**: `md-todo-backend`
- **Port**: 8000
- **Hot Reload**: Enabled with `cargo-watch`
- **Logs**: `docker-compose logs -f backend`

### Frontend (React + Remix)
- **Container**: `md-todo-frontend`
- **Port**: 3000
- **Hot Reload**: Enabled with Vite
- **Logs**: `docker-compose logs -f frontend`

## Development Workflow

### Starting the Environment
```bash
# Start all services
docker-compose up -d

# Start specific service
docker-compose up -d db backend
```

### Viewing Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Stopping the Environment
```bash
# Stop all services
docker-compose down

# Stop and remove volumes (⚠️ This will delete database data)
docker-compose down -v
```

### Rebuilding Services
```bash
# Rebuild all services
docker-compose up -d --build

# Rebuild specific service
docker-compose up -d --build backend
```

## Database Management

### Connecting to Database
```bash
# Using docker exec
docker exec -it md-todo-db psql -U md_todo_user -d md_todo_dev

# Using external client
psql -h localhost -p 5432 -U md_todo_user -d md_todo_dev
```

### Database Initialization
The database is automatically initialized with:
- UUID v7 extension
- `todos` table with proper indexes
- Sample data for development

### Resetting Database
```bash
# Stop and remove database volume
docker-compose down -v

# Restart to reinitialize
docker-compose up -d
```

## File Structure

```
md-todo/
├── docker-compose.yml          # Docker Compose configuration
├── .env.example               # Environment variables template
├── database/
│   └── init.sql              # Database initialization script
├── frontend/
│   └── Dockerfile            # Frontend container configuration
└── backend/
    └── Dockerfile            # Backend container configuration
```

## Troubleshooting

### Port Conflicts
If ports 3000, 8000, or 5432 are already in use, modify the port mappings in `docker-compose.yml`:

```yaml
ports:
  - "3001:3000"  # Change host port
```

### Permission Issues
On Linux, you may need to adjust file permissions:
```bash
sudo chown -R $USER:$USER .
```

### Container Build Issues
Clear Docker cache and rebuild:
```bash
docker system prune -a
docker-compose up -d --build
```

### Database Connection Issues
Check if database is ready:
```bash
docker-compose exec db pg_isready -U md_todo_user
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgres://md_todo_user:md_todo_password@db:5432/md_todo_dev` |
| `RUST_LOG` | Backend logging level | `debug` |
| `API_URL` | Backend API URL for frontend | `http://backend:8000` |
| `POSTGRES_DB` | PostgreSQL database name | `md_todo_dev` |
| `POSTGRES_USER` | PostgreSQL username | `md_todo_user` |
| `POSTGRES_PASSWORD` | PostgreSQL password | `md_todo_password` |

## Performance Optimization

### Volume Caching
The configuration includes volume caching for:
- Node.js dependencies (`node_modules`)
- Cargo registry cache
- Rust target directory

### Hot Reload
Both frontend and backend support hot reload:
- **Frontend**: Vite development server
- **Backend**: `cargo-watch` for automatic rebuilding