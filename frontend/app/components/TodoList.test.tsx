import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TodoList } from './TodoList';
import { Todo } from '../lib/types';

// Mock the MarkdownParser to ensure predictable test results
vi.mock('../lib/markdown-parser', () => ({
  MarkdownParser: vi.fn().mockImplementation(() => ({
    toHtml: vi.fn((content: string) => {
      // Simple mock that converts basic markdown to HTML
      let result = content;
      
      // Handle bold first (to avoid conflict with italic)
      if (result.includes('**')) {
        result = result.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      }
      
      // Handle italic - process remaining single asterisks
      // This will work correctly even after bold processing
      result = result.replace(/\*([^*<>]+?)\*/g, '<em>$1</em>');
      
      // Handle headers
      if (result.includes('# ')) {
        result = result.replace(/# (.*)/g, '<h1>$1</h1>');
      }
      
      // If no specific markdown found, wrap in paragraph
      if (result === content && !result.includes('<')) {
        result = `<p>${result}</p>`;
      }
      
      return result;
    })
  }))
}));

// Sample test data
const createMockTodo = (overrides: Partial<Todo> = {}): Todo => ({
  id: '018c2e65-4b7f-7000-8000-000000000000',
  title: 'Sample Todo',
  content: 'This is a sample todo item',
  completed: false,
  created_at: '2025-01-17T10:00:00Z',
  updated_at: '2025-01-17T10:00:00Z',
  ...overrides
});

const mockTodos: Todo[] = [
  createMockTodo({
    id: '018c2e65-4b7f-7000-8000-000000000001',
    title: 'First Todo',
    content: 'This is the first todo item',
    completed: false
  }),
  createMockTodo({
    id: '018c2e65-4b7f-7000-8000-000000000002',
    title: 'Completed Todo',
    content: 'This todo is **completed**',
    completed: true
  }),
  createMockTodo({
    id: '018c2e65-4b7f-7000-8000-000000000003',
    title: 'Markdown Todo',
    content: '# Header\n\nThis has **bold** text and a list:\n\n- Item 1\n- Item 2',
    completed: false
  })
];

// Mock handler functions
const mockOnToggle = vi.fn();
const mockOnDelete = vi.fn();

describe('TodoList Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering and Display', () => {
    it('renders empty state when no todos are provided', () => {
      render(<TodoList todos={[]} onToggle={mockOnToggle} onDelete={mockOnDelete} />);
      
      expect(screen.getByText(/no todos yet/i)).toBeInTheDocument();
      expect(screen.getByText(/create your first todo/i)).toBeInTheDocument();
    });

    it('renders list of todos when todos are provided', () => {
      render(<TodoList todos={mockTodos} onToggle={mockOnToggle} onDelete={mockOnDelete} />);
      
      expect(screen.getByText('First Todo')).toBeInTheDocument();
      expect(screen.getByText('Completed Todo')).toBeInTheDocument();
      expect(screen.getByText('Markdown Todo')).toBeInTheDocument();
    });

    it('displays todo titles correctly', () => {
      render(<TodoList todos={mockTodos} onToggle={mockOnToggle} onDelete={mockOnDelete} />);
      
      mockTodos.forEach(todo => {
        expect(screen.getByText(todo.title)).toBeInTheDocument();
      });
    });

    it('applies correct CSS classes to todo list container', () => {
      render(<TodoList todos={mockTodos} onToggle={mockOnToggle} onDelete={mockOnDelete} />);
      
      const listContainer = screen.getByTestId('todo-list-container');
      expect(listContainer).toHaveClass('space-y-4');
    });

    it('applies correct CSS classes to individual todo items', () => {
      render(<TodoList todos={mockTodos} onToggle={mockOnToggle} onDelete={mockOnDelete} />);
      
      const todoItems = screen.getAllByTestId(/^todo-item-/);
      todoItems.forEach(item => {
        expect(item).toHaveClass('border', 'rounded-lg', 'p-4', 'bg-white', 'dark:bg-gray-800');
      });
    });
  });

  describe('Markdown Rendering Integration', () => {
    it('renders markdown content as HTML for todo items', () => {
      render(<TodoList todos={mockTodos} onToggle={mockOnToggle} onDelete={mockOnDelete} />);
      
      // Check that markdown is converted to HTML
      expect(screen.getByText('completed')).toBeInTheDocument(); // Bold text should be rendered
    });

    it('handles different markdown syntax in todo content', () => {
      const markdownTodo = createMockTodo({
        id: '018c2e65-4b7f-7000-8000-000000000004',
        title: 'Complex Markdown',
        content: '# Header\n\n**Bold text** and *italic* text\n\n- List item 1\n- List item 2'
      });

      render(<TodoList todos={[markdownTodo]} onToggle={mockOnToggle} onDelete={mockOnDelete} />);
      
      expect(screen.getByText('Complex Markdown')).toBeInTheDocument();
    });

    it('safely handles potentially dangerous markdown content', () => {
      const dangerousTodo = createMockTodo({
        id: '018c2e65-4b7f-7000-8000-000000000005',
        title: 'Dangerous Content',
        content: '<script>alert("xss")</script>\n\n**Safe content**'
      });

      render(<TodoList todos={[dangerousTodo]} onToggle={mockOnToggle} onDelete={mockOnDelete} />);
      
      // Should not execute script, but display safe content
      expect(screen.getByText('Dangerous Content')).toBeInTheDocument();
      expect(document.querySelector('script')).not.toBeInTheDocument();
    });

    it('preserves markdown structure for long content', () => {
      const longContentTodo = createMockTodo({
        id: '018c2e65-4b7f-7000-8000-000000000006',
        title: 'Long Content',
        content: '# Main Header\n\nThis is a paragraph with **important** information.\n\n## Subheader\n\n- First item\n- Second item\n- Third item\n\n**Conclusion:** This is the end.'
      });

      render(<TodoList todos={[longContentTodo]} onToggle={mockOnToggle} onDelete={mockOnDelete} />);
      
      expect(screen.getByText('Long Content')).toBeInTheDocument();
    });
  });

  describe('Completion Status Display', () => {
    it('displays completed todos with visual indication', () => {
      render(<TodoList todos={mockTodos} onToggle={mockOnToggle} onDelete={mockOnDelete} />);
      
      const completedTodoItem = screen.getByTestId('todo-item-018c2e65-4b7f-7000-8000-000000000002');
      expect(completedTodoItem).toHaveClass('opacity-75');
    });

    it('displays uncompleted todos without completion styling', () => {
      render(<TodoList todos={mockTodos} onToggle={mockOnToggle} onDelete={mockOnDelete} />);
      
      const uncompletedTodoItem = screen.getByTestId('todo-item-018c2e65-4b7f-7000-8000-000000000001');
      expect(uncompletedTodoItem).not.toHaveClass('opacity-75');
    });

    it('shows completion checkbox for each todo', () => {
      render(<TodoList todos={mockTodos} onToggle={mockOnToggle} onDelete={mockOnDelete} />);
      
      mockTodos.forEach(todo => {
        const checkbox = screen.getByTestId(`checkbox-${todo.id}`);
        expect(checkbox).toBeInTheDocument();
        expect(checkbox).toHaveAttribute('type', 'checkbox');
      });
    });

    it('sets checkbox checked state based on todo completion status', () => {
      render(<TodoList todos={mockTodos} onToggle={mockOnToggle} onDelete={mockOnDelete} />);
      
      const completedCheckbox = screen.getByTestId('checkbox-018c2e65-4b7f-7000-8000-000000000002');
      const uncompletedCheckbox = screen.getByTestId('checkbox-018c2e65-4b7f-7000-8000-000000000001');
      
      expect(completedCheckbox).toBeChecked();
      expect(uncompletedCheckbox).not.toBeChecked();
    });
  });

  describe('Interactive Functionality', () => {
    it('calls onToggle with correct todo id when checkbox is clicked', () => {
      render(<TodoList todos={mockTodos} onToggle={mockOnToggle} onDelete={mockOnDelete} />);
      
      const checkbox = screen.getByTestId('checkbox-018c2e65-4b7f-7000-8000-000000000001');
      fireEvent.click(checkbox);
      
      expect(mockOnToggle).toHaveBeenCalledWith('018c2e65-4b7f-7000-8000-000000000001');
      expect(mockOnToggle).toHaveBeenCalledTimes(1);
    });

    it('calls onDelete with correct todo id when delete button is clicked', () => {
      render(<TodoList todos={mockTodos} onToggle={mockOnToggle} onDelete={mockOnDelete} />);
      
      const deleteButton = screen.getByTestId('delete-button-018c2e65-4b7f-7000-8000-000000000001');
      fireEvent.click(deleteButton);
      
      expect(mockOnDelete).toHaveBeenCalledWith('018c2e65-4b7f-7000-8000-000000000001');
      expect(mockOnDelete).toHaveBeenCalledTimes(1);
    });

    it('shows delete button for each todo item', () => {
      render(<TodoList todos={mockTodos} onToggle={mockOnToggle} onDelete={mockOnDelete} />);
      
      mockTodos.forEach(todo => {
        const deleteButton = screen.getByTestId(`delete-button-${todo.id}`);
        expect(deleteButton).toBeInTheDocument();
        expect(deleteButton).toHaveAttribute('type', 'button');
      });
    });

    it('handles multiple rapid toggle clicks correctly', () => {
      render(<TodoList todos={mockTodos} onToggle={mockOnToggle} onDelete={mockOnDelete} />);
      
      const checkbox = screen.getByTestId('checkbox-018c2e65-4b7f-7000-8000-000000000001');
      
      fireEvent.click(checkbox);
      fireEvent.click(checkbox);
      fireEvent.click(checkbox);
      
      expect(mockOnToggle).toHaveBeenCalledTimes(3);
      expect(mockOnToggle).toHaveBeenNthCalledWith(1, '018c2e65-4b7f-7000-8000-000000000001');
      expect(mockOnToggle).toHaveBeenNthCalledWith(2, '018c2e65-4b7f-7000-8000-000000000001');
      expect(mockOnToggle).toHaveBeenNthCalledWith(3, '018c2e65-4b7f-7000-8000-000000000001');
    });
  });

  describe('Accessibility', () => {
    it('provides proper ARIA attributes for todo list', () => {
      render(<TodoList todos={mockTodos} onToggle={mockOnToggle} onDelete={mockOnDelete} />);
      
      const todoList = screen.getByRole('list');
      expect(todoList).toHaveAttribute('aria-label', 'Todo items');
    });

    it('provides proper ARIA attributes for todo items', () => {
      render(<TodoList todos={mockTodos} onToggle={mockOnToggle} onDelete={mockOnDelete} />);
      
      const todoItems = screen.getAllByRole('listitem');
      expect(todoItems).toHaveLength(mockTodos.length);
      
      todoItems.forEach((item, index) => {
        expect(item).toHaveAttribute('aria-labelledby', `todo-title-${mockTodos[index].id}`);
      });
    });

    it('provides accessible labels for checkboxes', () => {
      render(<TodoList todos={mockTodos} onToggle={mockOnToggle} onDelete={mockOnDelete} />);
      
      mockTodos.forEach(todo => {
        const checkbox = screen.getByTestId(`checkbox-${todo.id}`);
        expect(checkbox).toHaveAttribute('aria-label', `Mark "${todo.title}" as ${todo.completed ? 'incomplete' : 'complete'}`);
      });
    });

    it('provides accessible labels for delete buttons', () => {
      render(<TodoList todos={mockTodos} onToggle={mockOnToggle} onDelete={mockOnDelete} />);
      
      mockTodos.forEach(todo => {
        const deleteButton = screen.getByTestId(`delete-button-${todo.id}`);
        expect(deleteButton).toHaveAttribute('aria-label', `Delete "${todo.title}"`);
      });
    });

    it('uses proper heading hierarchy for todo titles', () => {
      render(<TodoList todos={mockTodos} onToggle={mockOnToggle} onDelete={mockOnDelete} />);
      
      mockTodos.forEach(todo => {
        const title = screen.getByTestId(`todo-title-${todo.id}`);
        expect(title.tagName).toBe('H3');
      });
    });
  });

  describe('Responsive Design', () => {
    it('applies responsive classes to todo list container', () => {
      render(<TodoList todos={mockTodos} onToggle={mockOnToggle} onDelete={mockOnDelete} />);
      
      const container = screen.getByTestId('todo-list-container');
      expect(container).toHaveClass('space-y-4', 'md:space-y-6');
    });

    it('applies responsive classes to todo items', () => {
      render(<TodoList todos={mockTodos} onToggle={mockOnToggle} onDelete={mockOnDelete} />);
      
      const todoItems = screen.getAllByTestId(/^todo-item-/);
      todoItems.forEach(item => {
        expect(item).toHaveClass('p-4', 'md:p-6');
      });
    });

    it('handles touch interactions on mobile devices', () => {
      render(<TodoList todos={mockTodos} onToggle={mockOnToggle} onDelete={mockOnDelete} />);
      
      const checkbox = screen.getByTestId('checkbox-018c2e65-4b7f-7000-8000-000000000001');
      
      // Simulate touch event
      fireEvent.touchStart(checkbox);
      fireEvent.touchEnd(checkbox);
      fireEvent.click(checkbox);
      
      expect(mockOnToggle).toHaveBeenCalledWith('018c2e65-4b7f-7000-8000-000000000001');
    });
  });

  describe('Performance Optimization', () => {
    it('renders efficiently with large number of todos', () => {
      const largeTodoList = Array.from({ length: 100 }, (_, index) => 
        createMockTodo({
          id: `018c2e65-4b7f-7000-8000-00000000${index.toString().padStart(4, '0')}`,
          title: `Todo ${index + 1}`,
          content: `Content for todo ${index + 1}`
        })
      );

      const { container } = render(
        <TodoList todos={largeTodoList} onToggle={mockOnToggle} onDelete={mockOnDelete} />
      );
      
      expect(container.querySelectorAll('[data-testid^="todo-item-"]')).toHaveLength(100);
    });

    it('maintains performance with complex markdown content', () => {
      const complexMarkdownTodos = Array.from({ length: 10 }, (_, index) => 
        createMockTodo({
          id: `018c2e65-4b7f-7000-8000-00000000${index.toString().padStart(4, '0')}`,
          title: `Complex Todo ${index + 1}`,
          content: `# Header ${index + 1}\n\n**Bold** and *italic* text\n\n\`\`\`javascript\nconst x = ${index};\nconsole.log(x);\n\`\`\`\n\n- Item 1\n- Item 2\n- Item 3`
        })
      );

      render(<TodoList todos={complexMarkdownTodos} onToggle={mockOnToggle} onDelete={mockOnDelete} />);
      
      // Should render all todos without performance issues
      expect(screen.getAllByTestId(/^todo-item-/)).toHaveLength(10);
    });
  });

  describe('Error Handling', () => {
    it('handles todos with missing or invalid data gracefully', () => {
      const invalidTodos = [
        createMockTodo({ title: '' }), // Empty title
        createMockTodo({ content: '' }), // Empty content
        createMockTodo({ id: 'invalid-id' }) // Invalid ID format
      ];

      render(<TodoList todos={invalidTodos} onToggle={mockOnToggle} onDelete={mockOnDelete} />);
      
      // Should still render without crashing
      expect(screen.getByTestId('todo-list-container')).toBeInTheDocument();
    });

    it('handles malformed markdown content gracefully', () => {
      const malformedTodo = createMockTodo({
        title: 'Malformed Markdown',
        content: '# Unclosed header\n\n**Unclosed bold\n\n[Unclosed link('
      });

      render(<TodoList todos={[malformedTodo]} onToggle={mockOnToggle} onDelete={mockOnDelete} />);
      
      expect(screen.getByText('Malformed Markdown')).toBeInTheDocument();
    });
  });
});