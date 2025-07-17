-- Database initialization script for md-todo application
-- This script runs all migrations in order

-- Run migration 001: Initial schema
\i /docker-entrypoint-initdb.d/migrations/001_initial_schema.sql

-- Run migration 002: Sample data
\i /docker-entrypoint-initdb.d/migrations/002_sample_data.sql