import type { MetaFunction, LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { useLoaderData, useActionData, Form } from "@remix-run/react";
import { useState } from "react";
import { TodoList } from "../components/TodoList";
import { getTodos, updateTodo, deleteTodo } from "../lib/api-client";
import { Todo } from "../lib/types";

export const meta: MetaFunction = () => {
  return [
    { title: "MD-Todo - Markdown Todo Manager" },
    { name: "description", content: "Manage your todos with markdown support" },
  ];
};

// Loader function to fetch todos from the API
export async function loader(_args: LoaderFunctionArgs) {
  try {
    const todos = await getTodos();
    return Response.json({ todos, error: null });
  } catch (error) {
    console.error('Failed to load todos:', error);
    // Return empty array with error for graceful degradation
    return Response.json({ 
      todos: [], 
      error: error instanceof Error ? error.message : 'Failed to load todos' 
    });
  }
}

// Action function to handle todo operations
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");
  const todoId = formData.get("todoId");

  if (!todoId || typeof todoId !== "string") {
    return Response.json({ error: "Invalid todo ID" }, { status: 400 });
  }

  try {
    switch (intent) {
      case "toggle": {
        const completed = formData.get("completed") === "true";
        await updateTodo(todoId, { completed: !completed });
        return redirect("/"); // Refresh the page to show updated data
      }
      
      case "delete": {
        await deleteTodo(todoId);
        return redirect("/"); // Refresh the page to show updated data
      }
      
      default:
        return Response.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error('Action failed:', error);
    return Response.json({ 
      error: error instanceof Error ? error.message : 'Action failed' 
    }, { status: 500 });
  }
}

export default function Index() {
  const { todos, error: loadError } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [pendingToggle, setPendingToggle] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  const handleToggle = (id: string) => {
    setPendingToggle(id);
    // Form submission will trigger the action
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this todo?")) {
      setPendingDelete(id);
      // Form submission will trigger the action
    }
  };

  const currentTodo = (id: string): Todo | undefined => 
    todos?.find((todo: Todo) => todo?.id === id);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                MD-Todo
              </h1>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Markdown Todo Manager
              </span>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {todos?.length || 0} {(todos?.length || 0) === 1 ? 'todo' : 'todos'}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Display */}
        {(loadError || actionData?.error) && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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
                : "Click on checkboxes to mark todos as complete, or use the delete button to remove them."
              }
            </p>
          </div>

          <TodoList
            todos={todos || []}
            onToggle={handleToggle}
            onDelete={handleDelete}
          />
        </div>

        {/* Hidden forms for actions */}
        {pendingToggle && (
          <Form method="post" className="hidden">
            <input type="hidden" name="intent" value="toggle" />
            <input type="hidden" name="todoId" value={pendingToggle} />
            <input 
              type="hidden" 
              name="completed" 
              value={currentTodo(pendingToggle)?.completed ? "true" : "false"} 
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

        {/* Create Todo Section - Placeholder for future implementation */}
        <div className="mt-8 bg-gray-50 dark:bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 p-8 text-center">
          <div className="text-gray-500 dark:text-gray-400">
            <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <h3 className="text-lg font-medium mb-2">Create New Todo</h3>
            <p className="text-sm">
              Todo creation form will be implemented in the next phase.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}