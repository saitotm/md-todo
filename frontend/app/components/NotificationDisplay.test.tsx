import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NotificationDisplay } from './NotificationDisplay';
import { NotificationProvider, useNotifications } from './NotificationProvider';

// Mock timer functions
vi.useFakeTimers();

// Test component to create notifications for testing display
function TestNotificationCreator() {
  const { showNotification } = useNotifications();

  return (
    <div>
      <button 
        data-testid="create-success"
        onClick={() => showNotification('Success message', 'success')}
      >
        Create Success
      </button>
      
      <button 
        data-testid="create-error"
        onClick={() => showNotification('Error message', 'error')}
      >
        Create Error
      </button>
      
      <button 
        data-testid="create-warning"
        onClick={() => showNotification('Warning message', 'warning')}
      >
        Create Warning
      </button>
      
      <button 
        data-testid="create-info"
        onClick={() => showNotification('Info message', 'info')}
      >
        Create Info
      </button>
      
      <button 
        data-testid="create-retryable"
        onClick={() => showNotification('Retryable error', 'error', { 
          retryable: true,
          onRetry: () => console.log('Retry clicked')
        })}
      >
        Create Retryable
      </button>
      
      <button 
        data-testid="create-non-dismissible"
        onClick={() => showNotification('Non-dismissible message', 'info', { 
          dismissible: false 
        })}
      >
        Create Non-dismissible
      </button>
      
      <button 
        data-testid="create-custom-duration"
        onClick={() => showNotification('Custom duration', 'success', { 
          duration: 1000 
        })}
      >
        Create Custom Duration
      </button>
      
      <button 
        data-testid="create-assertive"
        onClick={() => showNotification('Assertive message', 'error', { 
          ariaLive: 'assertive' 
        })}
      >
        Create Assertive
      </button>
    </div>
  );
}

describe('NotificationDisplay', () => {
  beforeEach(() => {
    vi.clearAllTimers();
    vi.clearAllMocks();
    
    // Mock console.log to avoid test noise
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    vi.useFakeTimers();
    vi.restoreAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders nothing when no notifications exist', () => {
      render(
        <NotificationProvider>
          <NotificationDisplay />
        </NotificationProvider>
      );

      expect(screen.queryByTestId('notification-display')).not.toBeInTheDocument();
    });

    it('renders notification display container when notifications exist', () => {
      render(
        <NotificationProvider>
          <TestNotificationCreator />
          <NotificationDisplay />
        </NotificationProvider>
      );

      fireEvent.click(screen.getByTestId('create-success'));

      expect(screen.getByTestId('notification-display')).toBeInTheDocument();
    });

    it('renders with default top-right position', () => {
      render(
        <NotificationProvider>
          <TestNotificationCreator />
          <NotificationDisplay />
        </NotificationProvider>
      );

      fireEvent.click(screen.getByTestId('create-success'));

      const displayContainer = screen.getByTestId('notification-display');
      expect(displayContainer).toHaveClass('top-4', 'right-4');
    });

    it('applies custom className when provided', () => {
      render(
        <NotificationProvider>
          <TestNotificationCreator />
          <NotificationDisplay className="custom-class" />
        </NotificationProvider>
      );

      fireEvent.click(screen.getByTestId('create-success'));

      const displayContainer = screen.getByTestId('notification-display');
      expect(displayContainer).toHaveClass('custom-class');
    });
  });

  describe('Position Variants', () => {
    it('renders in top-left position', () => {
      render(
        <NotificationProvider>
          <TestNotificationCreator />
          <NotificationDisplay position="top-left" />
        </NotificationProvider>
      );

      fireEvent.click(screen.getByTestId('create-success'));

      const displayContainer = screen.getByTestId('notification-display');
      expect(displayContainer).toHaveClass('top-4', 'left-4');
    });

    it('renders in bottom-right position', () => {
      render(
        <NotificationProvider>
          <TestNotificationCreator />
          <NotificationDisplay position="bottom-right" />
        </NotificationProvider>
      );

      fireEvent.click(screen.getByTestId('create-success'));

      const displayContainer = screen.getByTestId('notification-display');
      expect(displayContainer).toHaveClass('bottom-4', 'right-4');
    });

    it('renders in bottom-left position', () => {
      render(
        <NotificationProvider>
          <TestNotificationCreator />
          <NotificationDisplay position="bottom-left" />
        </NotificationProvider>
      );

      fireEvent.click(screen.getByTestId('create-success'));

      const displayContainer = screen.getByTestId('notification-display');
      expect(displayContainer).toHaveClass('bottom-4', 'left-4');
    });

    it('renders in top-center position', () => {
      render(
        <NotificationProvider>
          <TestNotificationCreator />
          <NotificationDisplay position="top-center" />
        </NotificationProvider>
      );

      fireEvent.click(screen.getByTestId('create-success'));

      const displayContainer = screen.getByTestId('notification-display');
      expect(displayContainer).toHaveClass('top-4', 'left-1/2', '-translate-x-1/2');
    });

    it('renders in bottom-center position', () => {
      render(
        <NotificationProvider>
          <TestNotificationCreator />
          <NotificationDisplay position="bottom-center" />
        </NotificationProvider>
      );

      fireEvent.click(screen.getByTestId('create-success'));

      const displayContainer = screen.getByTestId('notification-display');
      expect(displayContainer).toHaveClass('bottom-4', 'left-1/2', '-translate-x-1/2');
    });
  });

  describe('Notification Types and Styling', () => {
    it('renders success notification with correct styling', () => {
      render(
        <NotificationProvider>
          <TestNotificationCreator />
          <NotificationDisplay />
        </NotificationProvider>
      );

      fireEvent.click(screen.getByTestId('create-success'));

      const notification = screen.getByTestId('notification-success');
      expect(notification).toBeInTheDocument();
      expect(notification).toHaveTextContent('Success message');
      expect(notification).toHaveClass('bg-green-50', 'dark:bg-green-900/20', 'border-green-200', 'dark:border-green-800');
    });

    it('renders error notification with correct styling', () => {
      render(
        <NotificationProvider>
          <TestNotificationCreator />
          <NotificationDisplay />
        </NotificationProvider>
      );

      fireEvent.click(screen.getByTestId('create-error'));

      const notification = screen.getByTestId('notification-error');
      expect(notification).toBeInTheDocument();
      expect(notification).toHaveTextContent('Error message');
      expect(notification).toHaveClass('bg-red-50', 'dark:bg-red-900/20', 'border-red-200', 'dark:border-red-800');
    });

    it('renders warning notification with correct styling', () => {
      render(
        <NotificationProvider>
          <TestNotificationCreator />
          <NotificationDisplay />
        </NotificationProvider>
      );

      fireEvent.click(screen.getByTestId('create-warning'));

      const notification = screen.getByTestId('notification-warning');
      expect(notification).toBeInTheDocument();
      expect(notification).toHaveTextContent('Warning message');
      expect(notification).toHaveClass('bg-yellow-50', 'dark:bg-yellow-900/20', 'border-yellow-200', 'dark:border-yellow-800');
    });

    it('renders info notification with correct styling', () => {
      render(
        <NotificationProvider>
          <TestNotificationCreator />
          <NotificationDisplay />
        </NotificationProvider>
      );

      fireEvent.click(screen.getByTestId('create-info'));

      const notification = screen.getByTestId('notification-info');
      expect(notification).toBeInTheDocument();
      expect(notification).toHaveTextContent('Info message');
      expect(notification).toHaveClass('bg-blue-50', 'dark:bg-blue-900/20', 'border-blue-200', 'dark:border-blue-800');
    });
  });

  describe('Notification Icons', () => {
    it('displays correct icon for success notifications', () => {
      render(
        <NotificationProvider>
          <TestNotificationCreator />
          <NotificationDisplay />
        </NotificationProvider>
      );

      fireEvent.click(screen.getByTestId('create-success'));

      const notification = screen.getByTestId('notification-success');
      const icon = notification.querySelector('svg');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveClass('text-green-600', 'dark:text-green-400');
    });

    it('displays correct icon for error notifications', () => {
      render(
        <NotificationProvider>
          <TestNotificationCreator />
          <NotificationDisplay />
        </NotificationProvider>
      );

      fireEvent.click(screen.getByTestId('create-error'));

      const notification = screen.getByTestId('notification-error');
      const icon = notification.querySelector('svg');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveClass('text-red-600', 'dark:text-red-400');
    });

    it('displays correct icon for warning notifications', () => {
      render(
        <NotificationProvider>
          <TestNotificationCreator />
          <NotificationDisplay />
        </NotificationProvider>
      );

      fireEvent.click(screen.getByTestId('create-warning'));

      const notification = screen.getByTestId('notification-warning');
      const icon = notification.querySelector('svg');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveClass('text-yellow-600', 'dark:text-yellow-400');
    });

    it('displays correct icon for info notifications', () => {
      render(
        <NotificationProvider>
          <TestNotificationCreator />
          <NotificationDisplay />
        </NotificationProvider>
      );

      fireEvent.click(screen.getByTestId('create-info'));

      const notification = screen.getByTestId('notification-info');
      const icon = notification.querySelector('svg');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveClass('text-blue-600', 'dark:text-blue-400');
    });
  });

  describe('Dismissal Functionality', () => {
    it('shows dismiss button for dismissible notifications', () => {
      render(
        <NotificationProvider>
          <TestNotificationCreator />
          <NotificationDisplay />
        </NotificationProvider>
      );

      fireEvent.click(screen.getByTestId('create-success'));

      const dismissButton = screen.getByLabelText('Dismiss notification');
      expect(dismissButton).toBeInTheDocument();
    });

    it('hides dismiss button for non-dismissible notifications', () => {
      render(
        <NotificationProvider>
          <TestNotificationCreator />
          <NotificationDisplay />
        </NotificationProvider>
      );

      fireEvent.click(screen.getByTestId('create-non-dismissible'));

      const dismissButton = screen.queryByLabelText('Dismiss notification');
      expect(dismissButton).not.toBeInTheDocument();
    });

    it('dismisses notification when dismiss button is clicked', () => {
      render(
        <NotificationProvider>
          <TestNotificationCreator />
          <NotificationDisplay />
        </NotificationProvider>
      );

      fireEvent.click(screen.getByTestId('create-success'));
      expect(screen.getByTestId('notification-success')).toBeInTheDocument();

      const dismissButton = screen.getByLabelText('Dismiss notification');
      fireEvent.click(dismissButton);

      // Should start slide-out animation
      expect(screen.getByTestId('notification-success')).toHaveClass('translate-x-full', 'opacity-0');
    });

    it('supports keyboard navigation for dismiss button', () => {
      render(
        <NotificationProvider>
          <TestNotificationCreator />
          <NotificationDisplay />
        </NotificationProvider>
      );

      fireEvent.click(screen.getByTestId('create-success'));

      const dismissButton = screen.getByLabelText('Dismiss notification');
      
      // Test Enter key
      fireEvent.keyDown(dismissButton, { key: 'Enter' });
      expect(screen.getByTestId('notification-success')).toHaveClass('translate-x-full', 'opacity-0');
    });

    it('supports space key for dismiss button', () => {
      render(
        <NotificationProvider>
          <TestNotificationCreator />
          <NotificationDisplay />
        </NotificationProvider>
      );

      fireEvent.click(screen.getByTestId('create-info'));

      const dismissButton = screen.getByLabelText('Dismiss notification');
      
      // Test Space key
      fireEvent.keyDown(dismissButton, { key: ' ' });
      expect(screen.getByTestId('notification-info')).toHaveClass('translate-x-full', 'opacity-0');
    });
  });

  describe('Retry Functionality', () => {
    it('shows retry button for retryable notifications', () => {
      render(
        <NotificationProvider>
          <TestNotificationCreator />
          <NotificationDisplay />
        </NotificationProvider>
      );

      fireEvent.click(screen.getByTestId('create-retryable'));

      const retryButton = screen.getByText('Try Again');
      expect(retryButton).toBeInTheDocument();
    });

    it('calls onRetry callback when retry button is clicked', () => {
      const consoleSpy = vi.spyOn(console, 'log');
      
      render(
        <NotificationProvider>
          <TestNotificationCreator />
          <NotificationDisplay />
        </NotificationProvider>
      );

      fireEvent.click(screen.getByTestId('create-retryable'));

      const retryButton = screen.getByText('Try Again');
      fireEvent.click(retryButton);

      expect(consoleSpy).toHaveBeenCalledWith('Retry clicked');
    });

    it('supports keyboard navigation for retry button', () => {
      const consoleSpy = vi.spyOn(console, 'log');
      
      render(
        <NotificationProvider>
          <TestNotificationCreator />
          <NotificationDisplay />
        </NotificationProvider>
      );

      fireEvent.click(screen.getByTestId('create-retryable'));

      const retryButton = screen.getByText('Try Again');
      
      // Test Enter key
      fireEvent.keyDown(retryButton, { key: 'Enter' });
      expect(consoleSpy).toHaveBeenCalledWith('Retry clicked');
      
      // Test Space key
      fireEvent.keyDown(retryButton, { key: ' ' });
      expect(consoleSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('Accessibility Features', () => {
    it('includes proper ARIA role and live region', () => {
      render(
        <NotificationProvider>
          <TestNotificationCreator />
          <NotificationDisplay />
        </NotificationProvider>
      );

      fireEvent.click(screen.getByTestId('create-success'));

      const notification = screen.getByTestId('notification-success');
      expect(notification).toHaveAttribute('role', 'alert');
      expect(notification).toHaveAttribute('aria-live', 'polite');
    });

    it('uses assertive aria-live for error notifications', () => {
      render(
        <NotificationProvider>
          <TestNotificationCreator />
          <NotificationDisplay />
        </NotificationProvider>
      );

      fireEvent.click(screen.getByTestId('create-assertive'));

      const notification = screen.getByTestId('notification-error');
      expect(notification).toHaveAttribute('aria-live', 'assertive');
    });

    it('provides screen reader announcements', () => {
      // Mock document.body.appendChild to capture screen reader announcements
      const appendChildSpy = vi.spyOn(document.body, 'appendChild');

      render(
        <NotificationProvider>
          <TestNotificationCreator />
          <NotificationDisplay />
        </NotificationProvider>
      );

      act(() => {
        fireEvent.click(screen.getByTestId('create-success'));
      });

      // Should create temporary element for screen reader announcement
      expect(appendChildSpy).toHaveBeenCalled();
      
      const appendCalls = appendChildSpy.mock.calls.filter(call => {
        const element = call[0] as HTMLElement;
        return element.textContent?.includes('success: Success message');
      });
      
      expect(appendCalls.length).toBeGreaterThan(0);
      const announcementElement = appendCalls[0][0] as HTMLElement;
      expect(announcementElement.textContent).toBe('success: Success message');
      expect(announcementElement).toHaveAttribute('aria-live', 'polite');
      expect(announcementElement).toHaveAttribute('aria-atomic', 'true');
      expect(announcementElement).toHaveClass('sr-only');
    });

    it('cleans up screen reader announcements after timeout', () => {
      const removeChildSpy = vi.spyOn(document.body, 'removeChild');

      render(
        <NotificationProvider>
          <TestNotificationCreator />
          <NotificationDisplay />
        </NotificationProvider>
      );

      act(() => {
        fireEvent.click(screen.getByTestId('create-success'));
      });

      // Fast forward past cleanup timeout
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(removeChildSpy).toHaveBeenCalled();
    });
  });

  describe('Animation and Transitions', () => {
    it('applies slide-out animation when notification is being removed', () => {
      render(
        <NotificationProvider>
          <TestNotificationCreator />
          <NotificationDisplay />
        </NotificationProvider>
      );

      fireEvent.click(screen.getByTestId('create-success'));
      
      const notification = screen.getByTestId('notification-success');
      expect(notification).toHaveClass('translate-x-0', 'opacity-100');

      const dismissButton = screen.getByLabelText('Dismiss notification');
      fireEvent.click(dismissButton);

      expect(notification).toHaveClass('translate-x-full', 'opacity-0');
    });

    it('includes transition classes for smooth animations', () => {
      render(
        <NotificationProvider>
          <TestNotificationCreator />
          <NotificationDisplay />
        </NotificationProvider>
      );

      fireEvent.click(screen.getByTestId('create-success'));

      const notification = screen.getByTestId('notification-success');
      expect(notification).toHaveClass('transition-all', 'duration-300', 'ease-in-out', 'transform');
    });
  });

  describe('Multiple Notifications', () => {
    it('displays multiple notifications simultaneously', () => {
      render(
        <NotificationProvider>
          <TestNotificationCreator />
          <NotificationDisplay />
        </NotificationProvider>
      );

      fireEvent.click(screen.getByTestId('create-success'));
      fireEvent.click(screen.getByTestId('create-error'));
      fireEvent.click(screen.getByTestId('create-warning'));

      expect(screen.getByTestId('notification-success')).toBeInTheDocument();
      expect(screen.getByTestId('notification-error')).toBeInTheDocument();
      expect(screen.getByTestId('notification-warning')).toBeInTheDocument();
    });

    it('applies correct stacking order for multiple notifications', () => {
      render(
        <NotificationProvider>
          <TestNotificationCreator />
          <NotificationDisplay />
        </NotificationProvider>
      );

      fireEvent.click(screen.getByTestId('create-success'));
      fireEvent.click(screen.getByTestId('create-error'));

      const displayContainer = screen.getByTestId('notification-display');
      const notifications = displayContainer.querySelectorAll('[data-testid^="notification-"]');
      
      expect(notifications).toHaveLength(2);
    });
  });

  describe('Auto-dismiss Integration', () => {
    it('auto-dismisses notifications after specified duration', () => {
      render(
        <NotificationProvider>
          <TestNotificationCreator />
          <NotificationDisplay />
        </NotificationProvider>
      );

      act(() => {
        fireEvent.click(screen.getByTestId('create-custom-duration'));
      });
      expect(screen.getByTestId('notification-success')).toBeInTheDocument();

      // Fast forward 1 second (custom duration) to trigger removal
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      // Should be in removing state or completely removed after auto-dismiss + animation
      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(screen.queryByTestId('notification-success')).not.toBeInTheDocument();
    });
  });
});