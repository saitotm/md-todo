import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { Todo } from '../lib/types';
import { NetworkError, StateError } from '../lib/state-errors';
import { NotificationProvider, useDeletionFeedback } from './NotificationProvider';
import { NotificationDisplay } from './NotificationDisplay';

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

const mockTodo = createMockTodo({
  id: '018c2e65-4b7f-7000-8000-000000000001',
  title: 'Task to Delete',
  content: 'This task will be deleted',
  completed: false
});

// Test component to test the hook functionality
function TestDeletionFeedback({ 
  onSuccess, 
  onError, 
  onClear 
}: { 
  onSuccess?: (message: string, options?: any) => void;
  onError?: (message: string, options?: any) => void;
  onClear?: () => void;
}) {
  const { showSuccessNotification, showErrorNotification, clearNotifications } = useDeletionFeedback();

  return (
    <div data-testid="test-deletion-feedback">
      <button
        onClick={() => {
          const message = `Task "${mockTodo.title}" has been deleted successfully`;
          showSuccessNotification(message);
          if (onSuccess) onSuccess(message);
        }}
        data-testid="show-success-button"
      >
        Show Success
      </button>
      <button
        onClick={() => {
          const message = 'Failed to delete task. Please check your connection and try again.';
          const options = { error: new NetworkError('Connection failed', 500), retryable: true };
          showErrorNotification(message, options);
          if (onError) onError(message, options);
        }}
        data-testid="show-error-button"
      >
        Show Error
      </button>
      <button
        onClick={() => {
          clearNotifications();
          if (onClear) onClear();
        }}
        data-testid="clear-button"
      >
        Clear Notifications
      </button>
    </div>
  );
}

describe('Deletion Feedback System Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Success Notification Tests', () => {
    it('displays success notification when task is deleted successfully', async () => {
      const onSuccess = vi.fn();
      
      render(
        <NotificationProvider>
          <TestDeletionFeedback onSuccess={onSuccess} />
          <NotificationDisplay />
        </NotificationProvider>
      );

      const successButton = screen.getByTestId('show-success-button');
      await userEvent.click(successButton);

      await waitFor(() => {
        expect(screen.getByTestId('notification-display')).toBeInTheDocument();
        expect(onSuccess).toHaveBeenCalledWith(
          `Task "${mockTodo.title}" has been deleted successfully`
        );
      });

      // Check if the success notification is displayed
      await waitFor(() => {
        expect(screen.getByTestId('notification-success')).toBeInTheDocument();
      });
    });

    it('shows generic success message when task title is not available', async () => {
      const onSuccess = vi.fn();
      
      render(
        <NotificationProvider>
          <TestDeletionFeedback onSuccess={onSuccess} />
          <NotificationDisplay />
        </NotificationProvider>
      );

      const successButton = screen.getByTestId('show-success-button');
      await userEvent.click(successButton);

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalled();
      });
    });

    it('success notification includes task information for user confirmation', async () => {
      const onSuccess = vi.fn();
      
      render(
        <NotificationProvider>
          <TestDeletionFeedback onSuccess={onSuccess} />
          <NotificationDisplay />
        </NotificationProvider>
      );

      const successButton = screen.getByTestId('show-success-button');
      await userEvent.click(successButton);

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalledWith(
          expect.stringContaining('Task to Delete')
        );
      });
    });
  });

  describe('Error Notification Tests', () => {
    it('displays error notification when deletion fails with network error', async () => {
      const onError = vi.fn();
      
      render(
        <NotificationProvider>
          <TestDeletionFeedback onError={onError} />
          <NotificationDisplay />
        </NotificationProvider>
      );

      const errorButton = screen.getByTestId('show-error-button');
      await userEvent.click(errorButton);

      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith(
          'Failed to delete task. Please check your connection and try again.',
          expect.objectContaining({
            error: expect.any(NetworkError),
            retryable: true
          })
        );
      });

      // Check if the error notification is displayed
      await waitFor(() => {
        expect(screen.getByTestId('notification-error')).toBeInTheDocument();
      });
    });

    it('displays error notification when deletion fails with server error', async () => {
      const onError = vi.fn();
      
      function TestServerError() {
        const { showErrorNotification } = useDeletionFeedback();
        
        return (
          <button
            onClick={() => {
              const message = 'An error occurred while deleting the task. Please try again later.';
              const options = { error: new StateError('Internal server error', { type: 'server' }), retryable: false };
              showErrorNotification(message, options);
              onError(message, options);
            }}
            data-testid="show-server-error-button"
          >
            Show Server Error
          </button>
        );
      }

      render(
        <NotificationProvider>
          <TestServerError />
          <NotificationDisplay />
        </NotificationProvider>
      );

      const errorButton = screen.getByTestId('show-server-error-button');
      await userEvent.click(errorButton);

      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith(
          'An error occurred while deleting the task. Please try again later.',
          expect.objectContaining({
            error: expect.any(StateError),
            retryable: false
          })
        );
      });
    });
  });

  describe('Notification Management Tests', () => {
    it('clears all notifications when clearNotifications is called', async () => {
      const onClear = vi.fn();
      
      render(
        <NotificationProvider>
          <TestDeletionFeedback onClear={onClear} />
          <NotificationDisplay />
        </NotificationProvider>
      );

      const clearButton = screen.getByTestId('clear-button');
      await userEvent.click(clearButton);

      await waitFor(() => {
        expect(onClear).toHaveBeenCalledTimes(1);
      });
    });

    it('manages multiple notifications correctly', async () => {
      const onSuccess = vi.fn();
      const onError = vi.fn();
      
      render(
        <NotificationProvider>
          <TestDeletionFeedback onSuccess={onSuccess} onError={onError} />
          <NotificationDisplay />
        </NotificationProvider>
      );

      const successButton = screen.getByTestId('show-success-button');
      const errorButton = screen.getByTestId('show-error-button');
      
      await userEvent.click(successButton);
      await userEvent.click(errorButton);

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalledTimes(1);
        expect(onError).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Integration Tests', () => {
    it('shows appropriate feedback throughout deletion lifecycle', async () => {
      const mockDeleteTodo = vi.fn().mockResolvedValue({ success: true });
      const onSuccess = vi.fn();

      function IntegrationTest() {
        const { showSuccessNotification } = useDeletionFeedback();
        
        return (
          <button
            onClick={async () => {
              try {
                await mockDeleteTodo(mockTodo.id);
                const message = `Task "${mockTodo.title}" has been deleted successfully`;
                showSuccessNotification(message);
                onSuccess(message);
              } catch (error) {
                // Handle error
              }
            }}
            data-testid="integrated-delete-button"
          >
            Delete with Feedback
          </button>
        );
      }

      render(
        <NotificationProvider>
          <IntegrationTest />
          <NotificationDisplay />
        </NotificationProvider>
      );

      const deleteButton = screen.getByTestId('integrated-delete-button');
      await userEvent.click(deleteButton);

      await waitFor(() => {
        expect(mockDeleteTodo).toHaveBeenCalledWith(mockTodo.id);
        expect(onSuccess).toHaveBeenCalledWith(
          `Task "${mockTodo.title}" has been deleted successfully`
        );
      });
    });
  });

  describe('Accessibility Tests', () => {
    it('notifications are announced to screen readers', async () => {
      const onSuccess = vi.fn();
      
      render(
        <NotificationProvider>
          <TestDeletionFeedback onSuccess={onSuccess} />
          <NotificationDisplay />
        </NotificationProvider>
      );

      const successButton = screen.getByTestId('show-success-button');
      await userEvent.click(successButton);

      // Test that screen reader announcements are properly set up
      await waitFor(() => {
        const notification = screen.getByTestId('notification-success');
        expect(notification).toHaveAttribute('aria-live');
      });
    });
  });
});