# Architecture Documentation

## Overview

MD-Todo is a modern full-stack web application built with a clean separation of concerns, utilizing cutting-edge technologies for optimal performance and maintainability.

## Technology Stack

### Frontend
- **Framework**: React 18 with Remix
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Testing**: Vitest + Testing Library
- **Build Tool**: Vite

### Backend
- **Language**: Rust
- **Framework**: axum (async web framework)
- **Database ORM**: Direct SQL queries (Future: sqlx)
- **Testing**: Built-in Rust testing framework
- **Build Tool**: Cargo

### Database
- **Database**: PostgreSQL 18
- **Primary Keys**: UUID v7 for better performance
- **Migrations**: Sequential migration files
- **Initialization**: Docker-based setup

### Infrastructure
- **Containerization**: Docker + Docker Compose
- **CI/CD**: GitHub Actions
- **Development**: Hot reload for both frontend and backend

## System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│    Frontend     │    │     Backend     │    │    Database     │
│  (React+Remix)  │◄──►│  (Rust+axum)   │◄──►│  (PostgreSQL)   │
│   Port: 3000    │    │   Port: 8000    │    │   Port: 5432    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Component Interactions

### Frontend-Backend Communication
- RESTful API endpoints
- JSON request/response format
- CORS enabled for development
- Error handling with standardized responses

### Backend-Database Communication
- Direct SQL queries with prepared statements
- Connection pooling (Future implementation)
- Transaction support for data consistency
- Migration-based schema management

## Data Flow

1. **User Interaction**: User interacts with React components
2. **API Request**: Remix loader/action makes HTTP request to backend
3. **Request Processing**: axum router processes request
4. **Database Query**: Backend queries PostgreSQL database
5. **Response**: Data flows back through the same path
6. **UI Update**: React components re-render with new data

## Development Workflow

1. **Local Development**: Docker Compose for full stack
2. **Hot Reload**: Both frontend and backend support live updates
3. **Testing**: Automated tests for both layers
4. **CI/CD**: GitHub Actions for quality assurance
5. **Deployment**: Docker-based deployment strategy