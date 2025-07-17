-- Migration 002: Sample data for development
-- This migration adds sample todos for testing and development

-- Insert sample data for development
INSERT INTO todos (title, content, completed) VALUES
    ('Sample Task 1', '# Welcome to MD-Todo

This is a **sample task** with *markdown* formatting.

- [ ] Subtask 1
- [x] Subtask 2
- [ ] Subtask 3', false),
    ('Completed Task', '## This task is completed

This demonstrates how completed tasks appear in the UI.

```javascript
console.log("Hello, World!");
```', true),
    ('Task with Code', '### Development Task

Implement the following function:

```rust
fn hello_world() {
    println!("Hello, World!");
}
```

Make sure to include proper error handling.', false)
ON CONFLICT DO NOTHING;