-- Database initialization script for md-todo application
-- Creates the todos table with UUID v7 primary key and necessary indexes

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create todos table
CREATE TABLE IF NOT EXISTS todos (
    id UUID PRIMARY KEY DEFAULT uuidv7(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_todos_completed ON todos(completed);
CREATE INDEX IF NOT EXISTS idx_todos_created_at ON todos(created_at);
CREATE INDEX IF NOT EXISTS idx_todos_updated_at ON todos(updated_at);

-- Create a trigger to automatically update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_todos_updated_at
    BEFORE UPDATE ON todos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for development
INSERT INTO todos (title, content, completed) VALUES
    ('Sample Task 1', '# Welcome to MD-Todo\n\nThis is a **sample task** with *markdown* formatting.\n\n- [ ] Subtask 1\n- [x] Subtask 2\n- [ ] Subtask 3', false),
    ('Completed Task', '## This task is completed\n\nThis demonstrates how completed tasks appear in the UI.\n\n```javascript\nconsole.log("Hello, World!");\n```', true),
    ('Task with Code', '### Development Task\n\nImplement the following function:\n\n```rust\nfn hello_world() {\n    println!("Hello, World!");\n}\n```\n\nMake sure to include proper error handling.', false)
ON CONFLICT DO NOTHING;