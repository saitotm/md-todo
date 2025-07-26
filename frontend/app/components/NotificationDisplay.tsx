import React, { useRef, useEffect } from 'react';
import { useNotifications, Notification } from './NotificationProvider';

interface NotificationItemProps {
  notification: Notification;
  onDismiss: (id: string) => void;
}

function NotificationItem({ notification, onDismiss }: NotificationItemProps) {
  const { id, type, message, dismissible, retryable, onRetry } = notification;

  const getNotificationStyles = () => {
    const baseStyles = 'p-4 mb-3 rounded-lg shadow-lg flex items-start space-x-3 transition-all duration-300 ease-in-out';
    
    switch (type) {
      case 'success':
        return `${baseStyles} bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800`;
      case 'error':
        return `${baseStyles} bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800`;
      case 'warning':
        return `${baseStyles} bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800`;
      case 'info':
        return `${baseStyles} bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800`;
      default:
        return `${baseStyles} bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800`;
    }
  };

  const getIconStyles = () => {
    const baseStyles = 'w-5 h-5 flex-shrink-0 mt-0.5';
    
    switch (type) {
      case 'success':
        return `${baseStyles} text-green-600 dark:text-green-400`;
      case 'error':
        return `${baseStyles} text-red-600 dark:text-red-400`;
      case 'warning':
        return `${baseStyles} text-yellow-600 dark:text-yellow-400`;
      case 'info':
        return `${baseStyles} text-blue-600 dark:text-blue-400`;
      default:
        return `${baseStyles} text-gray-600 dark:text-gray-400`;
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <svg className={getIconStyles()} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'error':
        return (
          <svg className={getIconStyles()} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
      case 'warning':
        return (
          <svg className={getIconStyles()} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'info':
        return (
          <svg className={getIconStyles()} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getMessageTextStyles = () => {
    switch (type) {
      case 'success':
        return 'text-green-800 dark:text-green-200';
      case 'error':
        return 'text-red-800 dark:text-red-200';
      case 'warning':
        return 'text-yellow-800 dark:text-yellow-200';
      case 'info':
        return 'text-blue-800 dark:text-blue-200';
      default:
        return 'text-gray-800 dark:text-gray-200';
    }
  };

  const handleDismiss = () => {
    onDismiss(id);
  };

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent, action: () => void) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      action();
    }
  };

  return (
    <div 
      className={getNotificationStyles()}
      role="alert"
      aria-live={notification.ariaLive}
      data-testid={`notification-${type}`}
    >
      {getIcon()}
      
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${getMessageTextStyles()}`}>
          {message}
        </p>
        
        {retryable && onRetry && (
          <div className="mt-2">
            <button
              type="button"
              onClick={handleRetry}
              onKeyDown={(e) => handleKeyDown(e, handleRetry)}
              className={`text-xs font-medium underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-offset-2 rounded ${
                type === 'error' 
                  ? 'text-red-700 dark:text-red-300 focus:ring-red-500' 
                  : 'text-gray-700 dark:text-gray-300 focus:ring-gray-500'
              }`}
            >
              Try Again
            </button>
          </div>
        )}
      </div>

      {dismissible && (
        <button
          type="button"
          onClick={handleDismiss}
          onKeyDown={(e) => handleKeyDown(e, handleDismiss)}
          className={`flex-shrink-0 ml-3 p-1 rounded-md hover:bg-black hover:bg-opacity-10 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${
            type === 'error' 
              ? 'text-red-500 dark:text-red-400 focus:ring-red-500' 
              : 'text-gray-400 dark:text-gray-500 focus:ring-gray-500'
          }`}
          aria-label="Dismiss notification"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      )}
    </div>
  );
}

interface NotificationDisplayProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  className?: string;
}

export function NotificationDisplay({ 
  position = 'top-right', 
  className = '' 
}: NotificationDisplayProps) {
  const { notifications, dismissNotification } = useNotifications();
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle screen reader announcements
  useEffect(() => {
    notifications.forEach(notification => {
      if (notification.screenReaderAnnouncement) {
        // Create a temporary element for screen reader announcement
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', notification.ariaLive || 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = `${notification.type}: ${notification.message}`;
        
        document.body.appendChild(announcement);
        
        // Clean up after announcement
        setTimeout(() => {
          if (document.body.contains(announcement)) {
            document.body.removeChild(announcement);
          }
        }, 1000);
      }
    });
  }, [notifications]);

  const getPositionStyles = () => {
    const baseStyles = 'fixed z-50 pointer-events-none';
    
    switch (position) {
      case 'top-right':
        return `${baseStyles} top-4 right-4`;
      case 'top-left':
        return `${baseStyles} top-4 left-4`;
      case 'bottom-right':
        return `${baseStyles} bottom-4 right-4`;
      case 'bottom-left':
        return `${baseStyles} bottom-4 left-4`;
      case 'top-center':
        return `${baseStyles} top-4 left-1/2 transform -translate-x-1/2`;
      case 'bottom-center':
        return `${baseStyles} bottom-4 left-1/2 transform -translate-x-1/2`;
      default:
        return `${baseStyles} top-4 right-4`;
    }
  };

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div 
      ref={containerRef}
      className={`${getPositionStyles()} ${className}`}
      data-testid="notification-display"
    >
      <div className="w-80 max-w-sm pointer-events-auto">
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onDismiss={dismissNotification}
          />
        ))}
      </div>
    </div>
  );
}