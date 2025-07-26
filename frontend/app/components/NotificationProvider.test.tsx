import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NotificationProvider, useNotifications, useDeletionFeedback } from './NotificationProvider';

// Mock timer functions for testing auto-dismiss
vi.useFakeTimers();

// Test component to interact with the notification context
function TestNotificationComponent() {
  const { 
    notifications, 
    showNotification, 
    dismissNotification, 
    dismissNotificationWithAnimation,
    clearNotifications,
    hasActiveNotifications,
    removingNotifications
  } = useNotifications();

  return (
    <div>
      <div data-testid="notifications-count">{notifications.length}</div>
      <div data-testid="has-active-notifications">{hasActiveNotifications.toString()}</div>
      <div data-testid="removing-notifications-count">{removingNotifications.size}</div>
      
      <button 
        data-testid="show-success"
        onClick={() => showNotification('Success message', 'success')}
      >
        Show Success
      </button>
      
      <button 
        data-testid="show-error"
        onClick={() => showNotification('Error message', 'error')}
      >
        Show Error
      </button>
      
      <button 
        data-testid="show-warning"
        onClick={() => showNotification('Warning message', 'warning')}
      >
        Show Warning
      </button>
      
      <button 
        data-testid="show-info"
        onClick={() => showNotification('Info message', 'info')}
      >
        Show Info
      </button>
      
      <button 
        data-testid="show-persistent"
        onClick={() => showNotification('Persistent message', 'info', { 
          persistent: true, 
          autoDismiss: false 
        })}
      >
        Show Persistent
      </button>
      
      <button 
        data-testid="show-retryable"
        onClick={() => showNotification('Retryable message', 'error', { 
          retryable: true,
          onRetry: () => console.log('Retry clicked')
        })}
      >
        Show Retryable
      </button>
      
      <button 
        data-testid="dismiss-first"
        onClick={() => notifications.length > 0 && dismissNotification(notifications[0].id)}
      >
        Dismiss First
      </button>
      
      <button 
        data-testid="dismiss-first-animated"
        onClick={() => notifications.length > 0 && dismissNotificationWithAnimation(notifications[0].id)}
      >
        Dismiss First Animated
      </button>
      
      <button 
        data-testid="clear-all"
        onClick={() => clearNotifications()}
      >
        Clear All
      </button>
      
      {notifications.map((notification) => (
        <div 
          key={notification.id} 
          data-testid={`notification-${notification.type}`}
          data-notification-id={notification.id}
        >
          {notification.message}
        </div>
      ))}
    </div>
  );
}

// Test component for deletion feedback hook
function TestDeletionFeedbackComponent() {
  const { 
    showSuccessNotification, 
    showErrorNotification, 
    clearNotifications,
    notifications,
    hasActiveNotifications
  } = useDeletionFeedback();

  return (
    <div>
      <div data-testid="deletion-notifications-count">{notifications.length}</div>
      <div data-testid="deletion-has-active">{hasActiveNotifications.toString()}</div>
      
      <button 
        data-testid="deletion-success"
        onClick={() => showSuccessNotification('Task deleted successfully')}
      >
        Show Deletion Success
      </button>
      
      <button 
        data-testid="deletion-error"
        onClick={() => showErrorNotification('Failed to delete task', { 
          error: new Error('Network error') 
        })}
      >
        Show Deletion Error
      </button>
      
      <button 
        data-testid="deletion-clear"
        onClick={() => clearNotifications()}
      >
        Clear Deletion Notifications
      </button>
    </div>
  );
}

describe('NotificationProvider', () => {
  beforeEach(() => {
    vi.clearAllTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    vi.useFakeTimers();
  });

  describe('Context Provider Setup', () => {
    it('provides notification context to children', () => {
      render(
        <NotificationProvider>
          <TestNotificationComponent />
        </NotificationProvider>
      );

      expect(screen.getByTestId('notifications-count')).toHaveTextContent('0');
      expect(screen.getByTestId('has-active-notifications')).toHaveTextContent('false');
      expect(screen.getByTestId('removing-notifications-count')).toHaveTextContent('0');
    });

    it('throws error when useNotifications is used outside provider', () => {
      // Capture console.error to avoid test noise
      const originalError = console.error;
      console.error = vi.fn();

      expect(() => {
        render(<TestNotificationComponent />);
      }).toThrow('useNotifications must be used within a NotificationProvider');

      console.error = originalError;
    });

    it('renders with testid for notification provider', () => {
      render(
        <NotificationProvider>
          <div>Test content</div>
        </NotificationProvider>
      );

      expect(screen.getByTestId('notification-provider')).toBeInTheDocument();
    });
  });

  describe('Notification Creation', () => {
    it('creates success notification with correct properties', () => {
      render(
        <NotificationProvider>
          <TestNotificationComponent />
        </NotificationProvider>
      );

      fireEvent.click(screen.getByTestId('show-success'));

      expect(screen.getByTestId('notifications-count')).toHaveTextContent('1');
      expect(screen.getByTestId('has-active-notifications')).toHaveTextContent('true');
      expect(screen.getByTestId('notification-success')).toHaveTextContent('Success message');
    });

    it('creates error notification with correct properties', () => {
      render(
        <NotificationProvider>
          <TestNotificationComponent />
        </NotificationProvider>
      );

      fireEvent.click(screen.getByTestId('show-error'));

      expect(screen.getByTestId('notifications-count')).toHaveTextContent('1');
      expect(screen.getByTestId('notification-error')).toHaveTextContent('Error message');
    });

    it('creates warning notification with correct properties', () => {
      render(
        <NotificationProvider>
          <TestNotificationComponent />
        </NotificationProvider>
      );

      fireEvent.click(screen.getByTestId('show-warning'));

      expect(screen.getByTestId('notifications-count')).toHaveTextContent('1');
      expect(screen.getByTestId('notification-warning')).toHaveTextContent('Warning message');
    });

    it('creates info notification with correct properties', () => {
      render(
        <NotificationProvider>
          <TestNotificationComponent />
        </NotificationProvider>
      );

      fireEvent.click(screen.getByTestId('show-info'));

      expect(screen.getByTestId('notifications-count')).toHaveTextContent('1');
      expect(screen.getByTestId('notification-info')).toHaveTextContent('Info message');
    });

    it('returns unique notification ID when creating notification', () => {
      const TestComponent = () => {
        const { showNotification } = useNotifications();
        const [notificationId, setNotificationId] = React.useState<string>('');

        const handleClick = () => {
          const id = showNotification('Test message', 'info');
          setNotificationId(id);
        };

        return (
          <div>
            <button data-testid="create-notification" onClick={handleClick}>
              Create Notification
            </button>
            <div data-testid="notification-id">{notificationId}</div>
          </div>
        );
      };

      render(
        <NotificationProvider>
          <TestComponent />
        </NotificationProvider>
      );

      fireEvent.click(screen.getByTestId('create-notification'));

      const notificationId = screen.getByTestId('notification-id').textContent;
      expect(notificationId).toBeTruthy();
      expect(notificationId).toMatch(/^notification-\d+-[a-z0-9]+$/);
    });
  });

  describe('Notification Options and Configuration', () => {
    it('creates persistent notification that does not auto-dismiss', () => {
      render(
        <NotificationProvider>
          <TestNotificationComponent />
        </NotificationProvider>
      );

      fireEvent.click(screen.getByTestId('show-persistent'));
      expect(screen.getByTestId('notifications-count')).toHaveTextContent('1');

      // Fast forward time - persistent notifications should not dismiss
      act(() => {
        vi.advanceTimersByTime(10000);
      });

      expect(screen.getByTestId('notifications-count')).toHaveTextContent('1');
    });

    it('creates retryable notification with retry functionality', () => {
      render(
        <NotificationProvider>
          <TestNotificationComponent />
        </NotificationProvider>
      );

      fireEvent.click(screen.getByTestId('show-retryable'));
      expect(screen.getByTestId('notifications-count')).toHaveTextContent('1');
      expect(screen.getByTestId('notification-error')).toHaveTextContent('Retryable message');
    });

    it('respects maxNotifications limit', () => {
      render(
        <NotificationProvider maxNotifications={2}>
          <TestNotificationComponent />
        </NotificationProvider>
      );

      // Create 3 notifications
      fireEvent.click(screen.getByTestId('show-success'));
      fireEvent.click(screen.getByTestId('show-error'));
      fireEvent.click(screen.getByTestId('show-warning'));

      // Should only have 2 notifications due to limit
      expect(screen.getByTestId('notifications-count')).toHaveTextContent('2');
    });
  });

  describe('Notification Dismissal', () => {
    it('dismisses notification immediately', () => {
      render(
        <NotificationProvider>
          <TestNotificationComponent />
        </NotificationProvider>
      );

      fireEvent.click(screen.getByTestId('show-success'));
      expect(screen.getByTestId('notifications-count')).toHaveTextContent('1');

      fireEvent.click(screen.getByTestId('dismiss-first'));
      expect(screen.getByTestId('notifications-count')).toHaveTextContent('0');
      expect(screen.getByTestId('has-active-notifications')).toHaveTextContent('false');
    });

    it('dismisses notification with animation delay', async () => {
      render(
        <NotificationProvider>
          <TestNotificationComponent />
        </NotificationProvider>
      );

      fireEvent.click(screen.getByTestId('show-success'));
      expect(screen.getByTestId('notifications-count')).toHaveTextContent('1');

      fireEvent.click(screen.getByTestId('dismiss-first-animated'));
      
      // Should be in removing state initially
      expect(screen.getByTestId('removing-notifications-count')).toHaveTextContent('1');
      expect(screen.getByTestId('notifications-count')).toHaveTextContent('1');

      // After animation delay, should be dismissed
      act(() => {
        vi.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(screen.getByTestId('notifications-count')).toHaveTextContent('0');
        expect(screen.getByTestId('removing-notifications-count')).toHaveTextContent('0');
      });
    });

    it('clears all notifications at once', () => {
      render(
        <NotificationProvider>
          <TestNotificationComponent />
        </NotificationProvider>
      );

      // Create multiple notifications
      fireEvent.click(screen.getByTestId('show-success'));
      fireEvent.click(screen.getByTestId('show-error'));
      fireEvent.click(screen.getByTestId('show-warning'));

      expect(screen.getByTestId('notifications-count')).toHaveTextContent('3');

      fireEvent.click(screen.getByTestId('clear-all'));
      expect(screen.getByTestId('notifications-count')).toHaveTextContent('0');
      expect(screen.getByTestId('has-active-notifications')).toHaveTextContent('false');
    });
  });

  describe('Auto-dismiss Functionality', () => {
    it('auto-dismisses success notifications after 3 seconds', async () => {
      render(
        <NotificationProvider>
          <TestNotificationComponent />
        </NotificationProvider>
      );

      fireEvent.click(screen.getByTestId('show-success'));
      expect(screen.getByTestId('notifications-count')).toHaveTextContent('1');

      // Fast forward 3 seconds
      act(() => {
        vi.advanceTimersByTime(3000);
      });

      // Should trigger animation delay
      expect(screen.getByTestId('removing-notifications-count')).toHaveTextContent('1');

      // Fast forward animation delay
      act(() => {
        vi.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(screen.getByTestId('notifications-count')).toHaveTextContent('0');
      });
    });

    it('auto-dismisses error notifications after 8 seconds', async () => {
      render(
        <NotificationProvider>
          <TestNotificationComponent />
        </NotificationProvider>
      );

      fireEvent.click(screen.getByTestId('show-error'));
      expect(screen.getByTestId('notifications-count')).toHaveTextContent('1');

      // Fast forward 7 seconds - should still be there
      act(() => {
        vi.advanceTimersByTime(7000);
      });
      expect(screen.getByTestId('notifications-count')).toHaveTextContent('1');

      // Fast forward to 8 seconds - should start dismiss animation
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      expect(screen.getByTestId('removing-notifications-count')).toHaveTextContent('1');

      // Complete animation
      act(() => {
        vi.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(screen.getByTestId('notifications-count')).toHaveTextContent('0');
      });
    });

    it('auto-dismisses info notifications after 5 seconds', async () => {
      render(
        <NotificationProvider>
          <TestNotificationComponent />
        </NotificationProvider>
      );

      fireEvent.click(screen.getByTestId('show-info'));
      expect(screen.getByTestId('notifications-count')).toHaveTextContent('1');

      // Fast forward 5 seconds
      act(() => {
        vi.advanceTimersByTime(5000);
      });

      expect(screen.getByTestId('removing-notifications-count')).toHaveTextContent('1');

      // Complete animation
      act(() => {
        vi.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(screen.getByTestId('notifications-count')).toHaveTextContent('0');
      });
    });
  });

  describe('Notification Priority and Sorting', () => {
    it('sorts notifications by priority (high first)', () => {
      const TestPriorityComponent = () => {
        const { notifications, showNotification } = useNotifications();

        return (
          <div>
            <button 
              data-testid="add-low-priority"
              onClick={() => showNotification('Low priority', 'info', { priority: 'low' })}
            >
              Low Priority
            </button>
            <button 
              data-testid="add-high-priority"
              onClick={() => showNotification('High priority', 'error', { priority: 'high' })}
            >
              High Priority
            </button>
            <button 
              data-testid="add-medium-priority"
              onClick={() => showNotification('Medium priority', 'warning', { priority: 'medium' })}
            >
              Medium Priority
            </button>
            <div data-testid="notification-order">
              {notifications.map((n, index) => (
                <div key={n.id} data-testid={`notification-${index}`}>
                  {n.message} - {n.priority}
                </div>
              ))}
            </div>
          </div>
        );
      };

      render(
        <NotificationProvider>
          <TestPriorityComponent />
        </NotificationProvider>
      );

      // Add notifications in low, high, medium order
      fireEvent.click(screen.getByTestId('add-low-priority'));
      fireEvent.click(screen.getByTestId('add-high-priority'));
      fireEvent.click(screen.getByTestId('add-medium-priority'));

      // Should be sorted high, medium, low
      expect(screen.getByTestId('notification-0')).toHaveTextContent('High priority - high');
      expect(screen.getByTestId('notification-1')).toHaveTextContent('Medium priority - medium');
      expect(screen.getByTestId('notification-2')).toHaveTextContent('Low priority - low');
    });
  });
});

describe('useDeletionFeedback Hook', () => {
  beforeEach(() => {
    vi.clearAllTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    vi.useFakeTimers();
  });

  describe('Deletion Success Notifications', () => {
    it('shows success notification for task deletion', () => {
      render(
        <NotificationProvider>
          <TestDeletionFeedbackComponent />
        </NotificationProvider>
      );

      fireEvent.click(screen.getByTestId('deletion-success'));

      expect(screen.getByTestId('deletion-notifications-count')).toHaveTextContent('1');
      expect(screen.getByTestId('deletion-has-active')).toHaveTextContent('true');
    });

    it('auto-dismisses success notifications', async () => {
      render(
        <NotificationProvider>
          <TestDeletionFeedbackComponent />
        </NotificationProvider>
      );

      fireEvent.click(screen.getByTestId('deletion-success'));
      expect(screen.getByTestId('deletion-notifications-count')).toHaveTextContent('1');

      // Fast forward 3 seconds + animation
      act(() => {
        vi.advanceTimersByTime(3300);
      });

      await waitFor(() => {
        expect(screen.getByTestId('deletion-notifications-count')).toHaveTextContent('0');
      });
    });
  });

  describe('Deletion Error Notifications', () => {
    it('shows error notification for failed deletion', () => {
      render(
        <NotificationProvider>
          <TestDeletionFeedbackComponent />
        </NotificationProvider>
      );

      fireEvent.click(screen.getByTestId('deletion-error'));

      expect(screen.getByTestId('deletion-notifications-count')).toHaveTextContent('1');
      expect(screen.getByTestId('deletion-has-active')).toHaveTextContent('true');
    });

    it('shows high priority for error notifications', () => {
      const TestErrorPriorityComponent = () => {
        const { showErrorNotification, notifications } = useDeletionFeedback();

        return (
          <div>
            <button 
              data-testid="show-error"
              onClick={() => showErrorNotification('Delete failed')}
            >
              Show Error
            </button>
            <div data-testid="error-priority">
              {notifications.length > 0 && notifications[0].priority}
            </div>
          </div>
        );
      };

      render(
        <NotificationProvider>
          <TestErrorPriorityComponent />
        </NotificationProvider>
      );

      fireEvent.click(screen.getByTestId('show-error'));
      expect(screen.getByTestId('error-priority')).toHaveTextContent('high');
    });
  });

  describe('Deletion Feedback Filtering', () => {
    it('only returns success and error notifications', () => {
      const TestFilterComponent = () => {
        const { showNotification } = useNotifications();
        const { notifications: deletionNotifications } = useDeletionFeedback();

        return (
          <div>
            <button 
              data-testid="add-success"
              onClick={() => showNotification('Success', 'success')}
            >
              Add Success
            </button>
            <button 
              data-testid="add-warning"
              onClick={() => showNotification('Warning', 'warning')}
            >
              Add Warning
            </button>
            <button 
              data-testid="add-info"
              onClick={() => showNotification('Info', 'info')}
            >
              Add Info
            </button>
            <div data-testid="deletion-filtered-count">
              {deletionNotifications.length}
            </div>
          </div>
        );
      };

      render(
        <NotificationProvider>
          <TestFilterComponent />
        </NotificationProvider>
      );

      fireEvent.click(screen.getByTestId('add-success'));
      fireEvent.click(screen.getByTestId('add-warning'));
      fireEvent.click(screen.getByTestId('add-info'));

      // Only success notifications should be in deletion feedback
      expect(screen.getByTestId('deletion-filtered-count')).toHaveTextContent('1');
    });
  });

  describe('Clear Functionality', () => {
    it('clears all deletion-related notifications', () => {
      render(
        <NotificationProvider>
          <TestDeletionFeedbackComponent />
        </NotificationProvider>
      );

      fireEvent.click(screen.getByTestId('deletion-success'));
      fireEvent.click(screen.getByTestId('deletion-error'));
      expect(screen.getByTestId('deletion-notifications-count')).toHaveTextContent('2');

      fireEvent.click(screen.getByTestId('deletion-clear'));
      expect(screen.getByTestId('deletion-notifications-count')).toHaveTextContent('0');
      expect(screen.getByTestId('deletion-has-active')).toHaveTextContent('false');
    });
  });
});