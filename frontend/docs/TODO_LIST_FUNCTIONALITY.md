# Todo List Functionality

## Overview

This document provides comprehensive documentation for the Todo List functionality in the MD-Todo application. The Todo List is the core feature that enables users to view, filter, sort, and manage their tasks with full Markdown support and accessibility features.

The Todo List functionality is built around the `TodoList` component, which provides a rich interface for displaying todos with integrated filtering, sorting, and task completion management capabilities.

## TodoList Component

The `TodoList` component is the primary interface for displaying and interacting with todo items. It supports filtering, sorting, completion state management, and deletion operations.

### Component Props

The component accepts the following props through the `TodoListProps` interface:

```tsx
interface TodoListProps {
  todos: Todo[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  filter?: FilterType;
  sortBy?: SortType;
  onFilterChange?: (filter: FilterType) => void;
  onSortChange?: (sortBy: SortType) => void;
}
```

**Props Description:**

- `todos: Todo[]` - Array of todo items to display
- `onToggle: (id: string) => void` - Callback function called when a todo's completion state is toggled
- `onDelete: (id: string) => void` - Callback function called when a todo is deleted
- `filter?: FilterType` - Current filter setting (defaults to 'all')
- `sortBy?: SortType` - Current sort setting (defaults to 'created_at_desc')
- `onFilterChange?: (filter: FilterType) => void` - Optional callback for filter changes
- `onSortChange?: (sortBy: SortType) => void` - Optional callback for sort changes

## Filtering

The filtering functionality allows users to view specific subsets of their todos based on completion status. This feature helps users focus on what matters most at any given time.

### FilterType Options

The `FilterType` supports the following values:

- `'all'` - Shows all todos regardless of completion status
- `'completed'` - Shows only completed todos
- `'incomplete'` - Shows only incomplete/pending todos

### Filter Controls

The filter control is displayed as a dropdown selector that allows users to easily switch between different views:

```tsx
<select
  value={filter}
  onChange={(e) => onFilterChange?.(e.target.value as FilterType)}
>
  <option value="all">All</option>
  <option value="completed">Completed</option>
  <option value="incomplete">Incomplete</option>
</select>
```

The filtering functionality enable users to:

- Focus on pending tasks when they need to work
- Review completed tasks to track progress
- View all tasks for a comprehensive overview

## Sorting

The sorting functionality helps users organize their todos in the most useful order for their workflow. Users can sort by creation date, title, or completion status.

### SortType Options

The `SortType` supports the following sorting options:

- `'created_at_desc'` - Newest first (default)
- `'created_at_asc'` - Oldest first
- `'title_asc'` - Title A-Z
- `'title_desc'` - Title Z-A
- `'completed'` - By status (incomplete tasks first, then completed)

### Sort Controls

The sort control provides a user-friendly dropdown interface:

```tsx
<select
  value={sortBy}
  onChange={(e) => onSortChange?.(e.target.value as SortType)}
>
  <option value="created_at_desc">Newest First</option>
  <option value="created_at_asc">Oldest First</option>
  <option value="title_asc">Title A-Z</option>
  <option value="title_desc">Title Z-A</option>
  <option value="completed">By Status</option>
</select>
```

The sorting functionality allows users to organize their tasks efficiently, making it easier to find and manage specific todos.

## Task Completion

The task completion management system provides intuitive controls for tracking todo progress with clear visual feedback.

### Completion State Management

Each todo has a completion state managed through a checkbox interface:

```tsx
<input
  type="checkbox"
  checked={todo.completed}
  onChange={() => onToggle(todo.id)}
  aria-label={`Mark "${todo.title}" as ${
    todo.completed ? "incomplete" : "complete"
  }`}
/>
```

### Visual Indication

Completed todos receive distinct visual indication to clearly indicate their status:

- **Strikethrough text**: The title receives a line-through style
- **Reduced opacity**: The entire todo item becomes semi-transparent (75% opacity)
- **Muted colors**: Text colors are changed to gray variants

### Completion State Toggle

Users can easily toggle completion status by clicking the checkbox, which triggers the `onToggle` callback with the todo's ID.

## Markdown Rendering Integration

The Todo List seamlessly integrates with the application's Markdown processing system to provide rich text rendering for todo content.

### MarkdownParser Integration

Each todo's content is processed through the `MarkdownParser` class:

```tsx
const markdownParser = new MarkdownParser();

// In the component render
<div
  dangerouslySetInnerHTML={{
    __html: markdownParser.toHtml(todo.content),
  }}
/>;
```

### Supported Features

The Markdown integration provides:

- **Syntax highlighting** for code blocks with automatic syntax highlighting
- **Link rendering** with proper HTML anchor tags
- **Text formatting** including bold, italic, and emphasis
- **Security sanitization** to prevent XSS attacks
- **List support** for nested and ordered lists

## Usage Examples

### Basic TodoList Implementation

```tsx
import { TodoList, FilterType, SortType } from "../components/TodoList";
import { useState } from "react";

function TodoManager({ todos }: { todos: Todo[] }) {
  const [filter, setFilter] = useState<FilterType>("all");
  const [sortBy, setSortBy] = useState<SortType>("created_at_desc");

  const handleToggle = (id: string) => {
    // Implementation for toggling completion state
    updateTodo(id, { completed: !todos.find((t) => t.id === id)?.completed });
  };

  const handleDelete = (id: string) => {
    // Implementation for deleting todo
    if (confirm("Are you sure you want to delete this todo?")) {
      deleteTodo(id);
    }
  };

  return (
    <TodoList
      todos={todos}
      onToggle={handleToggle}
      onDelete={handleDelete}
      filter={filter}
      sortBy={sortBy}
      onFilterChange={setFilter}
      onSortChange={setSortBy}
    />
  );
}
```

### Controlled Filtering and Sorting

```tsx
function AdvancedTodoList() {
  const [filter, setFilter] = useState<FilterType>("incomplete");
  const [sortBy, setSortBy] = useState<SortType>("title_asc");

  return (
    <TodoList
      todos={todos}
      onToggle={handleToggle}
      onDelete={handleDelete}
      filter={filter}
      sortBy={sortBy}
      onFilterChange={setFilter}
      onSortChange={setSortBy}
    />
  );
}
```

## Accessibility

The Todo List component implements comprehensive accessibility features to ensure usability for all users.

### Keyboard Navigation

- All interactive elements are keyboard accessible
- Tab order follows logical flow through the interface
- Enter and Space keys activate buttons and checkboxes

### Screen Reader Support

- Proper `aria-label` attributes on all interactive elements for screen reader accessibility
- Semantic HTML structure with appropriate heading hierarchy
- List items are properly marked up with `<ul>` and `<li>` elements
- Form controls have associated labels

### Visual Accessibility

- High contrast colors meet WCAG guidelines
- Focus indicators are clearly visible
- Text sizing respects user preferences
- Color is not the only means of conveying information
