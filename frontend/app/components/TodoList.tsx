import { useMemo } from 'react';
import { Todo } from '../lib/types';
import { MarkdownParser } from '../lib/markdown-parser';

export type FilterType = 'all' | 'completed' | 'incomplete';
export type SortType = 'created_at_desc' | 'created_at_asc' | 'title_asc' | 'title_desc' | 'completed';

interface TodoListProps {
  todos: Todo[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  filter?: FilterType;
  sortBy?: SortType;
  onFilterChange?: (filter: FilterType) => void;
  onSortChange?: (sortBy: SortType) => void;
}

export function TodoList({ 
  todos, 
  onToggle, 
  onDelete, 
  filter = 'all',
  sortBy = 'created_at_desc',
  onFilterChange,
  onSortChange
}: TodoListProps) {
  const markdownParser = new MarkdownParser();

  // Filter and sort todos
  const processedTodos = useMemo(() => {
    // Apply filtering
    let filteredTodos = todos;
    if (filter === 'completed') {
      filteredTodos = todos.filter(todo => todo.completed);
    } else if (filter === 'incomplete') {
      filteredTodos = todos.filter(todo => !todo.completed);
    }
    // filter === 'all' shows all todos

    // Apply sorting
    const sortedTodos = [...filteredTodos].sort((a, b) => {
      switch (sortBy) {
        case 'created_at_desc':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'created_at_asc':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'title_asc':
          return a.title.localeCompare(b.title);
        case 'title_desc':
          return b.title.localeCompare(a.title);
        case 'completed':
          // Incomplete tasks first, then completed
          if (a.completed !== b.completed) {
            return a.completed ? 1 : -1;
          }
          // If same completion status, sort by creation date (oldest first)
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        default:
          return 0;
      }
    });

    return sortedTodos;
  }, [todos, filter, sortBy]);

  // Empty state for original todos
  if (todos.length === 0) {
    return (
      <div 
        data-testid="todo-list-container" 
        className="space-y-4 md:space-y-6 text-center py-12"
      >
        <div className="text-gray-500 dark:text-gray-400">
          <h3 className="text-lg font-medium mb-2">No todos yet</h3>
          <p>Create your first todo to get started!</p>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="todo-list-container" className="space-y-4 md:space-y-6">
      {/* Filter and Sort Controls - always show when todos exist */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        {/* Filter Control */}
        <div className="flex-1">
          <label htmlFor="filter-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Filter Tasks
          </label>
          <select
            id="filter-select"
            data-testid="filter-select"
            value={filter}
            onChange={(e) => onFilterChange?.(e.target.value as FilterType)}
            disabled={!onFilterChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm 
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="all">All</option>
            <option value="completed">Completed</option>
            <option value="incomplete">Incomplete</option>
          </select>
        </div>

        {/* Sort Control */}
        <div className="flex-1">
          <label htmlFor="sort-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Sort Tasks
          </label>
          <select
            id="sort-select"
            data-testid="sort-select"
            value={sortBy}
            onChange={(e) => onSortChange?.(e.target.value as SortType)}
            disabled={!onSortChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm 
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="created_at_desc">Newest First</option>
            <option value="created_at_asc">Oldest First</option>
            <option value="title_asc">Title A-Z</option>
            <option value="title_desc">Title Z-A</option>
            <option value="completed">By Status</option>
          </select>
        </div>
      </div>

      {/* Empty state for filtered todos */}
      {processedTodos.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 dark:text-gray-400">
            <h3 className="text-lg font-medium mb-2">No todos match your filter</h3>
            <p>Try adjusting your filter or sort options.</p>
          </div>
        </div>
      ) : (
        <ul aria-label="Todo items">
          {processedTodos.map((todo) => (
          <li 
            key={todo.id}
            data-testid={`todo-item-${todo.id}`}
            aria-labelledby={`todo-title-${todo.id}`}
            className={`
              border rounded-lg p-4 md:p-6 bg-white dark:bg-gray-800 
              border-gray-200 dark:border-gray-700 shadow-sm
              ${todo.completed ? 'opacity-75' : ''}
            `}
          >
            <div className="flex items-start gap-3">
              {/* Completion checkbox */}
              <div className="flex-shrink-0 mt-1">
                <input
                  type="checkbox"
                  data-testid={`checkbox-${todo.id}`}
                  checked={todo.completed}
                  onChange={() => onToggle(todo.id)}
                  aria-label={`Mark "${todo.title}" as ${todo.completed ? 'incomplete' : 'complete'}`}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded 
                           focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 
                           focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
              </div>

              {/* Todo content */}
              <div className="flex-grow min-w-0">
                {/* Title */}
                <h3 
                  id={`todo-title-${todo.id}`}
                  data-testid={`todo-title-${todo.id}`}
                  className={`
                    text-lg font-medium mb-2 text-gray-900 dark:text-gray-100
                    ${todo.completed ? 'line-through text-gray-500 dark:text-gray-400' : ''}
                  `}
                >
                  {todo.title}
                </h3>

                {/* Markdown content */}
                {todo.content && (
                  <div 
                    className="prose prose-sm max-w-none dark:prose-invert
                             prose-headings:text-gray-900 dark:prose-headings:text-gray-100
                             prose-p:text-gray-700 dark:prose-p:text-gray-300
                             prose-a:text-blue-600 dark:prose-a:text-blue-400"
                    dangerouslySetInnerHTML={{
                      __html: markdownParser.toHtml(todo.content)
                    }}
                  />
                )}

                {/* Timestamps */}
                <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                  <span>Created: {new Date(todo.created_at).toLocaleDateString()}</span>
                  {todo.updated_at !== todo.created_at && (
                    <span className="ml-4">
                      Updated: {new Date(todo.updated_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>

              {/* Delete button */}
              <div className="flex-shrink-0">
                <button
                  type="button"
                  data-testid={`delete-button-${todo.id}`}
                  onClick={() => onDelete(todo.id)}
                  aria-label={`Delete "${todo.title}"`}
                  className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 
                           transition-colors duration-200 rounded-md hover:bg-gray-100 
                           dark:hover:bg-gray-700 focus:outline-none focus:ring-2 
                           focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                >
                  <svg 
                    className="w-4 h-4" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth="2" 
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}