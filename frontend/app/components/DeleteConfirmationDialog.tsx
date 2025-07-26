import { useState, useRef, useEffect } from "react";
import { Modal } from "./Modal";
import { Todo } from "../lib/types";

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  todo: Todo | null;
  onConfirm: (id: string) => Promise<void> | void;
  onCancel: () => void;
}

export function DeleteConfirmationDialog({
  isOpen,
  todo,
  onConfirm,
  onCancel,
}: DeleteConfirmationDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  // Focus the cancel button when modal opens (after Modal's initial focus)
  useEffect(() => {
    if (isOpen && cancelButtonRef.current) {
      // Use multiple timing strategies to ensure focus is set
      const focusButton = () => {
        if (cancelButtonRef.current) {
          cancelButtonRef.current.focus();
        }
      };

      // Immediate focus
      focusButton();

      // Use requestAnimationFrame to run after render
      const rafId = requestAnimationFrame(() => {
        focusButton();
        // And another one for good measure
        requestAnimationFrame(focusButton);
      });

      // Also use setTimeout as backup
      const timerId = setTimeout(focusButton, 10);
      const timerId2 = setTimeout(focusButton, 50);

      return () => {
        cancelAnimationFrame(rafId);
        clearTimeout(timerId);
        clearTimeout(timerId2);
      };
    }
  }, [isOpen]);

  // Handle keyboard events
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter' && event.target instanceof HTMLButtonElement) {
        // Let the button handle its own Enter key - don't prevent default
        return;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setIsDeleting(false);
      setError(null);
    }
  }, [isOpen]);

  const handleConfirm = async () => {
    if (!todo || isDeleting) return;

    setIsDeleting(true);
    setError(null);

    try {
      await onConfirm(todo.id);
      // Reset loading state after successful deletion
      setIsDeleting(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while deleting the task');
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    if (isDeleting) return;
    onCancel();
  };


  if (!isOpen) {
    return null;
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      title="Delete Task"
      className="max-w-md"
    >
      <div className="space-y-4">
        {/* Warning message */}
        <div className="text-sm text-gray-600 dark:text-gray-300">
          <p className="mb-2">
            Are you sure you want to delete this task?
          </p>
          {todo && (
            <p className="font-medium text-gray-900 dark:text-gray-100 mb-2">
              {todo.title}
            </p>
          )}
          <p className="text-red-600 dark:text-red-400 font-medium">
            This action cannot be undone.
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
            <p className="text-sm text-red-700 dark:text-red-300">
              Error occurred: {error}
            </p>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex justify-end space-x-3 pt-4">
          <button
            ref={cancelButtonRef}
            type="button"
            onClick={handleCancel}
            disabled={isDeleting}
            data-action="cancel"
            aria-label="Cancel deletion"
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 
                     bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 
                     focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 
                     dark:focus:ring-offset-gray-800 rounded-md transition-colors duration-200
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isDeleting}
            data-action="delete"
            aria-label={`Delete task "${todo?.title || 'Unknown task'}"`}
            className="px-4 py-2 text-sm font-medium text-white 
                     bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 
                     focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 
                     rounded-md transition-colors duration-200
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </Modal>
  );
}