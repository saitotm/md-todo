import { Todo } from '../lib/types';
import { MarkdownParser } from '../lib/markdown-parser';

interface TodoListProps {
  todos: Todo[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export function TodoList({ todos, onToggle, onDelete }: TodoListProps) {
  const markdownParser = new MarkdownParser();

  // Empty state
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
      <ul aria-label="Todo items">
        {todos.map((todo) => (
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
    </div>
  );
}