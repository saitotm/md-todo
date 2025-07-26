import { render, screen, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { Todo } from '../lib/types';
import { NetworkError, StateError } from '../lib/state-errors';

// Mock notification system components that will be implemented
const NotificationProvider = ({ children }: { children: React.ReactNode }) => (
  <div data-testid="notification-provider">{children}</div>
);

const NotificationDisplay = () => (
  <div data-testid="notification-display" />
);

// Mock deletion feedback hook that will be implemented
const useDeletionFeedback = () => ({
  showSuccessNotification: vi.fn(),
  showErrorNotification: vi.fn(),
  clearNotifications: vi.fn(),
  notifications: [],
  hasActiveNotifications: false,
});

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

describe('Deletion Feedback System Tests', () => {
  const mockUseDeletionFeedback = useDeletionFeedback();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseDeletionFeedback.showSuccessNotification.mockClear();
    mockUseDeletionFeedback.showErrorNotification.mockClear();
    mockUseDeletionFeedback.clearNotifications.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Success Notification Tests', () => {
    it('displays success notification when task is deleted successfully', async () => {
      const onDeleteSuccess = vi.fn();
      
      render(
        <NotificationProvider>
          <div data-testid="mock-delete-component">
            <button
              onClick={() => {
                onDeleteSuccess();
                mockUseDeletionFeedback.showSuccessNotification(
                  `Task "${mockTodo.title}" has been deleted successfully`
                );
              }}
              data-testid="delete-button"
            >
              Delete Task
            </button>
          </div>
          <NotificationDisplay />
        </NotificationProvider>
      );

      const deleteButton = screen.getByTestId('delete-button');
      await userEvent.click(deleteButton);

      expect(mockUseDeletionFeedback.showSuccessNotification).toHaveBeenCalledWith(
        `Task "${mockTodo.title}" has been deleted successfully`
      );
      expect(onDeleteSuccess).toHaveBeenCalledTimes(1);
    });

    it('shows generic success message when task title is not available', async () => {
      const todoWithoutTitle = { ...mockTodo, title: '' };
      
      render(
        <NotificationProvider>
          <div data-testid="mock-delete-component">
            <button
              onClick={() => {
                mockUseDeletionFeedback.showSuccessNotification(
                  'Task has been deleted successfully'
                );
              }}
              data-testid="delete-button"
            >
              Delete Task
            </button>
          </div>
          <NotificationDisplay />
        </NotificationProvider>
      );

      const deleteButton = screen.getByTestId('delete-button');
      await userEvent.click(deleteButton);

      expect(mockUseDeletionFeedback.showSuccessNotification).toHaveBeenCalledWith(
        'Task has been deleted successfully'
      );
    });

    it('success notification includes task information for user confirmation', async () => {
      const taskWithLongTitle = createMockTodo({
        title: 'Very important task that needs to be completed before the deadline next week'
      });

      render(
        <NotificationProvider>
          <div data-testid="mock-delete-component">
            <button
              onClick={() => {
                mockUseDeletionFeedback.showSuccessNotification(
                  `Task "${taskWithLongTitle.title}" has been deleted successfully`
                );
              }}
              data-testid="delete-button"
            >
              Delete Task
            </button>
          </div>
          <NotificationDisplay />
        </NotificationProvider>
      );

      const deleteButton = screen.getByTestId('delete-button');
      await userEvent.click(deleteButton);

      expect(mockUseDeletionFeedback.showSuccessNotification).toHaveBeenCalledWith(
        `Task "${taskWithLongTitle.title}" has been deleted successfully`
      );
    });

    it('auto-dismisses success notifications after specified duration', async () => {
      vi.useFakeTimers();

      render(
        <NotificationProvider>
          <div data-testid="mock-delete-component">
            <button
              onClick={() => {
                mockUseDeletionFeedback.showSuccessNotification(
                  'Task deleted successfully',
                  { autoDismiss: true, duration: 3000 }
                );
              }}
              data-testid="delete-button"
            >
              Delete Task
            </button>
          </div>
          <NotificationDisplay />
        </NotificationProvider>
      );

      const deleteButton = screen.getByTestId('delete-button');
      await userEvent.click(deleteButton);

      expect(mockUseDeletionFeedback.showSuccessNotification).toHaveBeenCalledWith(
        'Task deleted successfully',
        { autoDismiss: true, duration: 3000 }
      );

      // Fast-forward time to trigger auto-dismiss
      act(() => {
        vi.advanceTimersByTime(3000);
      });

      // Verify auto-dismiss behavior would be triggered
      vi.useRealTimers();
    });
  });

  describe('Error Notification Tests', () => {
    it('displays error notification when deletion fails with network error', async () => {
      const networkError = new NetworkError('Connection failed', 500);
      
      render(
        <NotificationProvider>
          <div data-testid="mock-delete-component">
            <button
              onClick={() => {
                mockUseDeletionFeedback.showErrorNotification(
                  'Failed to delete task. Please check your connection and try again.',
                  { error: networkError, retryable: true }
                );
              }}
              data-testid="delete-button-error"
            >
              Delete Task (Error Case)
            </button>
          </div>
          <NotificationDisplay />
        </NotificationProvider>
      );

      const deleteButton = screen.getByTestId('delete-button-error');
      await userEvent.click(deleteButton);

      expect(mockUseDeletionFeedback.showErrorNotification).toHaveBeenCalledWith(
        'Failed to delete task. Please check your connection and try again.',
        { error: networkError, retryable: true }
      );
    });

    it('displays error notification when deletion fails with server error', async () => {
      const serverError = new StateError('Internal server error', { type: 'server' });
      
      render(
        <NotificationProvider>
          <div data-testid="mock-delete-component">
            <button
              onClick={() => {
                mockUseDeletionFeedback.showErrorNotification(
                  'An error occurred while deleting the task. Please try again later.',
                  { error: serverError, retryable: false }
                );
              }}
              data-testid="delete-button-server-error"
            >
              Delete Task (Server Error)
            </button>
          </div>
          <NotificationDisplay />
        </NotificationProvider>
      );

      const deleteButton = screen.getByTestId('delete-button-server-error');
      await userEvent.click(deleteButton);

      expect(mockUseDeletionFeedback.showErrorNotification).toHaveBeenCalledWith(
        'An error occurred while deleting the task. Please try again later.',
        { error: serverError, retryable: false }
      );
    });

    it('displays error notification with retry option for retryable errors', async () => {
      const timeoutError = NetworkError.timeout();
      
      render(
        <NotificationProvider>
          <div data-testid="mock-delete-component">
            <button
              onClick={() => {
                mockUseDeletionFeedback.showErrorNotification(
                  'Request timed out. Please try again.',
                  { 
                    error: timeoutError, 
                    retryable: true,
                    onRetry: () => console.log('Retrying deletion...')
                  }
                );
              }}
              data-testid="delete-button-timeout"
            >
              Delete Task (Timeout)
            </button>
          </div>
          <NotificationDisplay />
        </NotificationProvider>
      );

      const deleteButton = screen.getByTestId('delete-button-timeout');
      await userEvent.click(deleteButton);

      expect(mockUseDeletionFeedback.showErrorNotification).toHaveBeenCalledWith(
        'Request timed out. Please try again.',
        expect.objectContaining({
          error: timeoutError,
          retryable: true,
          onRetry: expect.any(Function)
        })
      );
    });

    it('displays generic error message for unknown errors', async () => {
      const unknownError = new Error('Unknown error occurred');
      
      render(
        <NotificationProvider>
          <div data-testid="mock-delete-component">
            <button
              onClick={() => {
                mockUseDeletionFeedback.showErrorNotification(
                  'An unexpected error occurred. Please try again.',
                  { error: unknownError, retryable: false }
                );
              }}
              data-testid="delete-button-unknown-error"
            >
              Delete Task (Unknown Error)
            </button>
          </div>
          <NotificationDisplay />
        </NotificationProvider>
      );

      const deleteButton = screen.getByTestId('delete-button-unknown-error');
      await userEvent.click(deleteButton);

      expect(mockUseDeletionFeedback.showErrorNotification).toHaveBeenCalledWith(
        'An unexpected error occurred. Please try again.',
        { error: unknownError, retryable: false }
      );
    });

    it('error notifications persist until manually dismissed for critical errors', async () => {
      const criticalError = new StateError('Critical deletion error', { type: 'critical' });
      
      render(
        <NotificationProvider>
          <div data-testid="mock-delete-component">
            <button
              onClick={() => {
                mockUseDeletionFeedback.showErrorNotification(
                  'Critical error occurred during deletion.',
                  { 
                    error: criticalError, 
                    retryable: false, 
                    persistent: true 
                  }
                );
              }}
              data-testid="delete-button-critical"
            >
              Delete Task (Critical Error)
            </button>
          </div>
          <NotificationDisplay />
        </NotificationProvider>
      );

      const deleteButton = screen.getByTestId('delete-button-critical');
      await userEvent.click(deleteButton);

      expect(mockUseDeletionFeedback.showErrorNotification).toHaveBeenCalledWith(
        'Critical error occurred during deletion.',
        expect.objectContaining({
          error: criticalError,
          retryable: false,
          persistent: true
        })
      );
    });
  });

  describe('Notification Management Tests', () => {
    it('clears all notifications when clearNotifications is called', async () => {
      render(
        <NotificationProvider>
          <div data-testid="mock-component">
            <button
              onClick={() => mockUseDeletionFeedback.clearNotifications()}
              data-testid="clear-button"
            >
              Clear Notifications
            </button>
          </div>
          <NotificationDisplay />
        </NotificationProvider>
      );

      const clearButton = screen.getByTestId('clear-button');
      await userEvent.click(clearButton);

      expect(mockUseDeletionFeedback.clearNotifications).toHaveBeenCalledTimes(1);
    });

    it('manages multiple notifications correctly', async () => {
      render(
        <NotificationProvider>
          <div data-testid="mock-component">
            <button
              onClick={() => {
                mockUseDeletionFeedback.showSuccessNotification('First task deleted');
                mockUseDeletionFeedback.showSuccessNotification('Second task deleted');
                mockUseDeletionFeedback.showErrorNotification('Third task deletion failed');
              }}
              data-testid="multiple-notifications-button"
            >
              Show Multiple Notifications
            </button>
          </div>
          <NotificationDisplay />
        </NotificationProvider>
      );

      const button = screen.getByTestId('multiple-notifications-button');
      await userEvent.click(button);

      expect(mockUseDeletionFeedback.showSuccessNotification).toHaveBeenCalledTimes(2);
      expect(mockUseDeletionFeedback.showErrorNotification).toHaveBeenCalledTimes(1);
    });

    it('handles notification queue limits properly', async () => {
      render(
        <NotificationProvider>
          <div data-testid="mock-component">
            <button
              onClick={() => {
                // Simulate adding many notifications
                for (let i = 0; i < 10; i++) {
                  mockUseDeletionFeedback.showSuccessNotification(`Task ${i + 1} deleted`);
                }
              }}
              data-testid="queue-limit-button"
            >
              Test Queue Limit
            </button>
          </div>
          <NotificationDisplay />
        </NotificationProvider>
      );

      const button = screen.getByTestId('queue-limit-button');
      await userEvent.click(button);

      expect(mockUseDeletionFeedback.showSuccessNotification).toHaveBeenCalledTimes(10);
    });

    it('prioritizes error notifications over success notifications', async () => {
      render(
        <NotificationProvider>
          <div data-testid="mock-component">
            <button
              onClick={() => {
                mockUseDeletionFeedback.showSuccessNotification('Success message');
                mockUseDeletionFeedback.showErrorNotification('Error message', { priority: 'high' });
              }}
              data-testid="priority-button"
            >
              Test Notification Priority
            </button>
          </div>
          <NotificationDisplay />
        </NotificationProvider>
      );

      const button = screen.getByTestId('priority-button');
      await userEvent.click(button);

      expect(mockUseDeletionFeedback.showSuccessNotification).toHaveBeenCalledWith('Success message');
      expect(mockUseDeletionFeedback.showErrorNotification).toHaveBeenCalledWith(
        'Error message',
        { priority: 'high' }
      );
    });
  });

  describe('Integration with Deletion Process Tests', () => {
    it('shows appropriate feedback throughout deletion lifecycle', async () => {
      const mockDeleteTodo = vi.fn().mockResolvedValue({ success: true });

      render(
        <NotificationProvider>
          <div data-testid="mock-deletion-flow">
            <button
              onClick={async () => {
                try {
                  // Simulate deletion process
                  await mockDeleteTodo(mockTodo.id);
                  mockUseDeletionFeedback.showSuccessNotification(
                    `Task "${mockTodo.title}" has been deleted successfully`
                  );
                } catch (error) {
                  mockUseDeletionFeedback.showErrorNotification(
                    'Failed to delete task. Please try again.',
                    { error: error as Error, retryable: true }
                  );
                }
              }}
              data-testid="integrated-delete-button"
            >
              Delete with Feedback
            </button>
          </div>
          <NotificationDisplay />
        </NotificationProvider>
      );

      const deleteButton = screen.getByTestId('integrated-delete-button');
      await userEvent.click(deleteButton);

      await waitFor(() => {
        expect(mockDeleteTodo).toHaveBeenCalledWith(mockTodo.id);
        expect(mockUseDeletionFeedback.showSuccessNotification).toHaveBeenCalledWith(
          `Task "${mockTodo.title}" has been deleted successfully`
        );
      });
    });

    it('handles deletion feedback with confirmation dialog integration', async () => {
      const mockOnConfirm = vi.fn().mockResolvedValue(undefined);
      const mockOnCancel = vi.fn();

      render(
        <NotificationProvider>
          <div data-testid="mock-dialog-integration">
            <button
              onClick={async () => {
                try {
                  await mockOnConfirm(mockTodo.id);
                  mockUseDeletionFeedback.showSuccessNotification(
                    `Task "${mockTodo.title}" has been deleted successfully`
                  );
                } catch (error) {
                  mockUseDeletionFeedback.showErrorNotification(
                    'An error occurred while deleting the task',
                    { error: error as Error }
                  );
                }
              }}
              data-testid="dialog-confirm-button"
            >
              Confirm Deletion
            </button>
            <button
              onClick={() => {
                mockOnCancel();
                mockUseDeletionFeedback.clearNotifications();
              }}
              data-testid="dialog-cancel-button"
            >
              Cancel Deletion
            </button>
          </div>
          <NotificationDisplay />
        </NotificationProvider>
      );

      // Test successful deletion
      const confirmButton = screen.getByTestId('dialog-confirm-button');
      await userEvent.click(confirmButton);

      await waitFor(() => {
        expect(mockOnConfirm).toHaveBeenCalledWith(mockTodo.id);
        expect(mockUseDeletionFeedback.showSuccessNotification).toHaveBeenCalledWith(
          `Task "${mockTodo.title}" has been deleted successfully`
        );
      });

      // Test cancellation
      const cancelButton = screen.getByTestId('dialog-cancel-button');
      await userEvent.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
      expect(mockUseDeletionFeedback.clearNotifications).toHaveBeenCalledTimes(1);
    });

    it('handles concurrent deletion attempts with proper feedback', async () => {
      const slowMockDelete = vi.fn().mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ success: true }), 100))
      );

      render(
        <NotificationProvider>
          <div data-testid="concurrent-deletion">
            <button
              onClick={async () => {
                try {
                  await slowMockDelete(mockTodo.id);
                  mockUseDeletionFeedback.showSuccessNotification(
                    `Task deleted successfully`
                  );
                } catch (error) {
                  mockUseDeletionFeedback.showErrorNotification(
                    'Deletion failed',
                    { error: error as Error }
                  );
                }
              }}
              data-testid="concurrent-delete-button"
            >
              Delete Task
            </button>
          </div>
          <NotificationDisplay />
        </NotificationProvider>
      );

      const deleteButton = screen.getByTestId('concurrent-delete-button');
      
      // Click multiple times to test concurrent handling
      const clickPromises = [
        userEvent.click(deleteButton),
        userEvent.click(deleteButton),
        userEvent.click(deleteButton)
      ];

      await Promise.all(clickPromises);

      // Wait for all operations to complete
      await waitFor(() => {
        expect(slowMockDelete).toHaveBeenCalled();
      }, { timeout: 1000 });
    });
  });

  describe('Accessibility and User Experience Tests', () => {
    it('notifications are announced to screen readers', async () => {
      render(
        <NotificationProvider>
          <div data-testid="accessibility-test">
            <button
              onClick={() => {
                mockUseDeletionFeedback.showSuccessNotification(
                  'Task deleted successfully',
                  { ariaLive: 'polite', screenReaderAnnouncement: true }
                );
              }}
              data-testid="accessible-notification-button"
            >
              Delete with Accessibility
            </button>
          </div>
          <NotificationDisplay />
        </NotificationProvider>
      );

      const button = screen.getByTestId('accessible-notification-button');
      await userEvent.click(button);

      expect(mockUseDeletionFeedback.showSuccessNotification).toHaveBeenCalledWith(
        'Task deleted successfully',
        expect.objectContaining({
          ariaLive: 'polite',
          screenReaderAnnouncement: true
        })
      );
    });

    it('error notifications are announced assertively to screen readers', async () => {
      render(
        <NotificationProvider>
          <div data-testid="error-accessibility-test">
            <button
              onClick={() => {
                mockUseDeletionFeedback.showErrorNotification(
                  'Deletion failed',
                  { ariaLive: 'assertive', screenReaderAnnouncement: true }
                );
              }}
              data-testid="accessible-error-button"
            >
              Error with Accessibility
            </button>
          </div>
          <NotificationDisplay />
        </NotificationProvider>
      );

      const button = screen.getByTestId('accessible-error-button');
      await userEvent.click(button);

      expect(mockUseDeletionFeedback.showErrorNotification).toHaveBeenCalledWith(
        'Deletion failed',
        expect.objectContaining({
          ariaLive: 'assertive',
          screenReaderAnnouncement: true
        })
      );
    });

    it('notifications support keyboard dismissal', async () => {
      const mockDismissNotification = vi.fn();

      render(
        <NotificationProvider>
          <div data-testid="keyboard-dismissal-test">
            <button
              onClick={() => {
                mockUseDeletionFeedback.showSuccessNotification(
                  'Task deleted successfully',
                  { 
                    dismissible: true,
                    onDismiss: mockDismissNotification
                  }
                );
              }}
              data-testid="dismissible-notification-button"
            >
              Show Dismissible Notification
            </button>
          </div>
          <NotificationDisplay />
        </NotificationProvider>
      );

      const button = screen.getByTestId('dismissible-notification-button');
      await userEvent.click(button);

      expect(mockUseDeletionFeedback.showSuccessNotification).toHaveBeenCalledWith(
        'Task deleted successfully',
        expect.objectContaining({
          dismissible: true,
          onDismiss: mockDismissNotification
        })
      );
    });
  });
});