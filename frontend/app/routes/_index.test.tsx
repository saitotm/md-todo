import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import IndexRoute from './_index';

// Mock Remix hooks
vi.mock('@remix-run/react', () => ({
  useLoaderData: vi.fn(() => ({
    todos: [],
    error: null
  })),
  useActionData: vi.fn(() => null),
  Form: ({ children, ...props }: any) => <form {...props}>{children}</form>
}));

// Mock API client
vi.mock('../lib/api-client', () => ({
  getTodos: vi.fn(),
  updateTodo: vi.fn(),
  deleteTodo: vi.fn()
}));

// Mock TodoList component
vi.mock('../components/TodoList', () => ({
  TodoList: ({ todos, onToggle, onDelete }: any) => (
    <div data-testid="todo-list-mock">
      <div data-testid="todo-count">{todos.length} todos</div>
      <button onClick={() => onToggle('test-id')}>Toggle Test</button>
      <button onClick={() => onDelete('test-id')}>Delete Test</button>
    </div>
  )
}));

describe('Index Route', () => {
  it('renders todo management interface', () => {
    render(<IndexRoute />);
    expect(screen.getByText('Your Todos')).toBeInTheDocument();
  });

  it('displays statistics bar', () => {
    render(<IndexRoute />);
    expect(screen.getByText(/Total:/)).toBeInTheDocument();
    expect(screen.getByText(/Completed:/)).toBeInTheDocument();
    expect(screen.getByText(/Pending:/)).toBeInTheDocument();
  });

  it('renders TodoList component', () => {
    render(<IndexRoute />);
    expect(screen.getByTestId('todo-list-mock')).toBeInTheDocument();
  });

  it('displays placeholder for todo creation', () => {
    render(<IndexRoute />);
    expect(screen.getByText('Create New Todo')).toBeInTheDocument();
    expect(screen.getByText(/Todo creation form will be implemented/)).toBeInTheDocument();
  });
});