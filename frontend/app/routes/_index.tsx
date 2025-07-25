import type { MetaFunction, ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { useLoaderData, useActionData, Form } from "@remix-run/react";
import { useState, useEffect } from "react";
import { TodoList, FilterType, SortType } from "../components/TodoList";
import { TaskCreateForm } from "../components/TaskCreateForm";
import { DeleteConfirmationDialog } from "../components/DeleteConfirmationDialog";
import { NotificationProvider, useDeletionFeedback } from "../components/NotificationProvider";
import { NotificationDisplay } from "../components/NotificationDisplay";
import {
  getTodos,
  updateTodo,
  deleteTodo,
  createTodo,
} from "../lib/api-client";
import { Todo, TodoCreateData, TodoUpdateData } from "../lib/types";
import { StateError } from "../lib/state-errors";

export const meta: MetaFunction = () => {
  return [
    { title: "MD-Todo - Markdown Todo Manager" },
    { name: "description", content: "Manage your todos with markdown support" },
  ];
};

// Loader function to fetch todos from the API
export async function loader() {
  try {
    const todos = await getTodos();
    return Response.json({ todos, error: null });
  } catch (error) {
    console.error("Failed to load todos:", error);
    // Return empty array with error for graceful degradation
    return Response.json({
      todos: [],
      error: error instanceof Error ? error.message : "Failed to load todos",
    });
  }
}

// Action function to handle todo operations
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  try {
    switch (intent) {
      case "create": {
        const title = formData.get("title");
        const content = formData.get("content");

        if (!title || typeof title !== "string") {
          return Response.json({ error: "Title is required" }, { status: 400 });
        }
        if (typeof content !== "string") {
          return Response.json({ error: "Invalid content" }, { status: 400 });
        }

        const todoData: TodoCreateData = { title, content };
        await createTodo(todoData);
        return redirect("/"); // Refresh the page to show updated data
      }

      case "toggle": {
        const todoId = formData.get("todoId");
        if (!todoId || typeof todoId !== "string") {
          return Response.json({ error: "Invalid todo ID" }, { status: 400 });
        }

        const completed = formData.get("completed") === "true";
        await updateTodo(todoId, { completed: !completed });
        return redirect("/"); // Refresh the page to show updated data
      }

      case "delete": {
        const todoId = formData.get("todoId");
        if (!todoId || typeof todoId !== "string") {
          return Response.json({ error: "Invalid todo ID" }, { status: 400 });
        }

        await deleteTodo(todoId);
        return redirect("/"); // Refresh the page to show updated data
      }

      case "edit": {
        const todoId = formData.get("todoId");
        if (!todoId || typeof todoId !== "string") {
          return Response.json({ error: "Invalid todo ID" }, { status: 400 });
        }

        const title = formData.get("title");
        const content = formData.get("content");

        const updateData: TodoUpdateData = {};
        if (title && typeof title === "string") {
          updateData.title = title;
        }
        if (content && typeof content === "string") {
          updateData.content = content;
        }

        await updateTodo(todoId, updateData);
        return redirect("/"); // Refresh the page to show updated data
      }

      default:
        return Response.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Action failed:", error);
    return Response.json(
      {
        error: error instanceof Error ? error.message : "Action failed",
      },
      { status: 500 }
    );
  }
}

function TodoApp() {
  const { todos, error: loadError } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const { showSuccessNotification, showErrorNotification, clearNotifications } = useDeletionFeedback();
  const [pendingToggle, setPendingToggle] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [pendingCreate, setPendingCreate] = useState<TodoCreateData | null>(
    null
  );
  const [pendingEdit, setPendingEdit] = useState<{
    id: string;
    data: TodoUpdateData;
  } | null>(null);
  const [filter, setFilter] = useState<FilterType>("all");
  const [sortBy, setSortBy] = useState<SortType>("created_at_desc");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [todoToDelete, setTodoToDelete] = useState<Todo | null>(null);
  const [lastDeletedTodo, setLastDeletedTodo] = useState<Todo | null>(null);

  const handleToggle = (id: string) => {
    setPendingToggle(id);
    // Form submission will trigger the action
  };

  const handleDelete = (id: string) => {
    const todo = todos?.find((t: Todo) => t.id === id);
    if (todo) {
      setTodoToDelete(todo);
    }
  };

  const handleDeleteConfirm = async (id: string) => {
    const todoToDeleteData = todos?.find((t: Todo) => t.id === id);
    if (!todoToDeleteData) {
      showErrorNotification("Task not found");
      setTodoToDelete(null);
      return;
    }

    try {
      setLastDeletedTodo(todoToDeleteData);
      setPendingDelete(id);
      // Form submission will trigger the action
      setTodoToDelete(null);
    } catch (error) {
      console.error("Failed to delete todo:", error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      showErrorNotification(
        `Failed to delete task "${todoToDeleteData.title}". ${errorMessage}`,
        { 
          error: error instanceof Error ? error : new Error(errorMessage),
          retryable: true,
          onRetry: () => handleDeleteConfirm(id)
        }
      );
      setTodoToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setTodoToDelete(null);
    clearNotifications();
  };

  const handleCreateSubmit = (data: TodoCreateData) => {
    setPendingCreate(data);
    // Form submission will trigger the action
  };

  // Handle action results for feedback
  useEffect(() => {
    if (actionData?.error && pendingDelete) {
      // Error occurred during deletion
      const errorMessage = actionData.error;
      const todoTitle = lastDeletedTodo?.title || 'Unknown task';
      
      showErrorNotification(
        `Failed to delete task "${todoTitle}". ${errorMessage}`,
        { 
          error: new StateError(errorMessage, { type: 'server' }),
          retryable: false
        }
      );
      setPendingDelete(null);
      setLastDeletedTodo(null);
    } else if (!actionData?.error && lastDeletedTodo && !pendingDelete) {
      // Successful deletion (no error and we had a pending delete that completed)
      const todoTitle = lastDeletedTodo.title || 'Task';
      showSuccessNotification(
        `Task "${todoTitle}" has been deleted successfully`
      );
      setLastDeletedTodo(null);
    }
  }, [actionData, pendingDelete, lastDeletedTodo, showSuccessNotification, showErrorNotification]);

  const handleCreateCancel = () => {
    setShowCreateForm(false);
  };

  const handleEdit = (todo: Todo, data: TodoUpdateData) => {
    setPendingEdit({ id: todo.id, data });
    // Form submission will trigger the action
  };


  return (
    <div className="py-6">
      <NotificationDisplay position="top-right" />
      {/* Statistics Bar */}
      <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <span className="font-medium">Total: {todos?.length || 0}</span>
            </div>
            <div className="text-sm text-green-700 dark:text-green-300">
              <span className="font-medium">
                Completed:{" "}
                {todos?.filter((todo: Todo) => todo.completed).length || 0}
              </span>
            </div>
            <div className="text-sm text-orange-700 dark:text-orange-300">
              <span className="font-medium">
                Pending:{" "}
                {todos?.filter((todo: Todo) => !todo.completed).length || 0}
              </span>
            </div>
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            {(todos?.length || 0) === 0
              ? "No todos yet"
              : `${Math.round(
                  ((todos?.filter((todo: Todo) => todo.completed).length || 0) /
                    (todos?.length || 1)) *
                    100
                )}% complete`}
          </div>
        </div>
      </div>
      {/* Error Display */}
      {(loadError || actionData?.error) && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800">
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-red-600 dark:text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-red-800 dark:text-red-200">
              {loadError || actionData?.error}
            </p>
          </div>
        </div>
      )}

      {/* Todo List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Your Todos
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {(todos?.length || 0) === 0
              ? "No todos yet. Create your first todo to get started!"
              : "Click on checkboxes to mark todos as complete, or use the delete button to remove them."}
          </p>
        </div>

        <TodoList
          todos={todos || []}
          onToggle={handleToggle}
          onDelete={handleDelete}
          onEdit={handleEdit}
          filter={filter}
          sortBy={sortBy}
          onFilterChange={setFilter}
          onSortChange={setSortBy}
        />
      </div>

      {/* Hidden forms for actions */}
      {pendingCreate && (
        <Form method="post" className="hidden">
          <input type="hidden" name="intent" value="create" />
          <input type="hidden" name="title" value={pendingCreate.title} />
          <input type="hidden" name="content" value={pendingCreate.content} />
          <button
            type="submit"
            ref={(button) => {
              if (button) {
                button.click();
                setPendingCreate(null);
                setShowCreateForm(false);
              }
            }}
          />
        </Form>
      )}

      {pendingToggle && (
        <Form method="post" className="hidden">
          <input type="hidden" name="intent" value="toggle" />
          <input type="hidden" name="todoId" value={pendingToggle} />
          <input
            type="hidden"
            name="completed"
            value={todos?.find((todo: Todo) => todo?.id === pendingToggle)?.completed ? "true" : "false"}
          />
          <button
            type="submit"
            ref={(button) => {
              if (button) {
                button.click();
                setPendingToggle(null);
              }
            }}
          />
        </Form>
      )}

      {pendingDelete && (
        <Form method="post" className="hidden">
          <input type="hidden" name="intent" value="delete" />
          <input type="hidden" name="todoId" value={pendingDelete} />
          <button
            type="submit"
            ref={(button) => {
              if (button) {
                button.click();
                setPendingDelete(null);
              }
            }}
          />
        </Form>
      )}

      {pendingEdit && (
        <Form method="post" className="hidden">
          <input type="hidden" name="intent" value="edit" />
          <input type="hidden" name="todoId" value={pendingEdit.id} />
          <input
            type="hidden"
            name="title"
            value={pendingEdit.data.title || ""}
          />
          <input
            type="hidden"
            name="content"
            value={pendingEdit.data.content || ""}
          />
          <button
            type="submit"
            ref={(button) => {
              if (button) {
                button.click();
                setPendingEdit(null);
              }
            }}
          />
        </Form>
      )}

      {/* Create Todo Section */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Create New Todo
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Add a new todo with markdown support for rich content formatting.
              Use the Preview tab to see how your markdown will be rendered.
            </p>
          </div>

          {!showCreateForm ? (
            <button
              onClick={() => setShowCreateForm(true)}
              className="w-full p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
            >
              <div className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                <span className="font-medium">Add New Todo</span>
              </div>
            </button>
          ) : (
            <TaskCreateForm
              onSubmit={handleCreateSubmit}
              onCancel={handleCreateCancel}
            />
          )}
        </div>

        {/* Delete Confirmation Dialog */}
        <DeleteConfirmationDialog
          isOpen={todoToDelete !== null}
          todo={todoToDelete}
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
        />
    </div>
  );
}

export default function Index() {
  return (
    <NotificationProvider>
      <TodoApp />
    </NotificationProvider>
  );
}
