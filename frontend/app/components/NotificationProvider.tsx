import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { ErrorHandler, StateError, NetworkError } from '../lib/state-errors';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  description?: string;
  autoDismiss?: boolean;
  duration?: number;
  persistent?: boolean;
  retryable?: boolean;
  priority?: 'low' | 'medium' | 'high';
  ariaLive?: 'polite' | 'assertive';
  screenReaderAnnouncement?: boolean;
  dismissible?: boolean;
  onRetry?: () => void;
  onDismiss?: () => void;
  error?: Error;
  createdAt: number;
}

export interface NotificationOptions {
  autoDismiss?: boolean;
  duration?: number;
  persistent?: boolean;
  retryable?: boolean;
  priority?: 'low' | 'medium' | 'high';
  ariaLive?: 'polite' | 'assertive';
  screenReaderAnnouncement?: boolean;
  dismissible?: boolean;
  onRetry?: () => void;
  onDismiss?: () => void;
  error?: Error;
}

interface NotificationContextType {
  notifications: Notification[];
  showNotification: (message: string, type: Notification['type'], options?: NotificationOptions) => string;
  dismissNotification: (id: string) => void;
  dismissNotificationWithAnimation: (id: string) => void;
  clearNotifications: () => void;
  hasActiveNotifications: boolean;
  removingNotifications: Set<string>;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

interface NotificationProviderProps {
  children: React.ReactNode;
  maxNotifications?: number;
}

export function NotificationProvider({ 
  children, 
  maxNotifications = 5 
}: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [removingNotifications, setRemovingNotifications] = useState<Set<string>>(new Set());

  const generateId = useCallback(() => {
    return `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  const showNotification = useCallback((
    message: string, 
    type: Notification['type'], 
    options: NotificationOptions = {}
  ): string => {
    const id = generateId();
    const priority = options.priority || (type === 'error' ? 'high' : 'medium');
    
    const notification: Notification = {
      id,
      type,
      message,
      autoDismiss: options.autoDismiss ?? (type === 'success'),
      duration: options.duration ?? (type === 'success' ? 3000 : 5000),
      persistent: options.persistent ?? (type === 'error'),
      retryable: options.retryable ?? false,
      priority,
      ariaLive: options.ariaLive ?? (type === 'error' ? 'assertive' : 'polite'),
      screenReaderAnnouncement: options.screenReaderAnnouncement ?? true,
      dismissible: options.dismissible ?? true,
      onRetry: options.onRetry,
      onDismiss: options.onDismiss,
      error: options.error,
      createdAt: Date.now(),
    };

    setNotifications(prev => {
      // Remove oldest notifications if we exceed the limit
      let newNotifications = [...prev];
      if (newNotifications.length >= maxNotifications) {
        // Sort by priority and creation time, remove lowest priority oldest notifications
        newNotifications.sort((a, b) => {
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          if (priorityOrder[a.priority!] !== priorityOrder[b.priority!]) {
            return priorityOrder[a.priority!] - priorityOrder[b.priority!];
          }
          return a.createdAt - b.createdAt;
        });
        newNotifications = newNotifications.slice(-(maxNotifications - 1));
      }

      // Add new notification
      newNotifications.push(notification);

      // Sort by priority (high priority first)
      newNotifications.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        if (priorityOrder[a.priority!] !== priorityOrder[b.priority!]) {
          return priorityOrder[b.priority!] - priorityOrder[a.priority!];
        }
        return b.createdAt - a.createdAt;
      });

      return newNotifications;
    });

    return id;
  }, [generateId, maxNotifications]);

  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => {
      const notification = prev.find(n => n.id === id);
      if (notification?.onDismiss) {
        notification.onDismiss();
      }
      return prev.filter(n => n.id !== id);
    });
  }, []);

  const dismissNotificationWithAnimation = useCallback((id: string) => {
    // Add to removing set to trigger slide-out animation
    setRemovingNotifications(prev => new Set([...prev, id]));
    
    // After animation completes, actually dismiss the notification
    setTimeout(() => {
      dismissNotification(id);
      setRemovingNotifications(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }, 300); // Match the transition duration
  }, [dismissNotification]);

  const clearNotifications = useCallback(() => {
    setNotifications(prev => {
      prev.forEach(notification => {
        if (notification.onDismiss) {
          notification.onDismiss();
        }
      });
      return [];
    });
  }, []);

  // Auto-dismiss notifications
  useEffect(() => {
    const timers: Record<string, NodeJS.Timeout> = {};

    notifications.forEach(notification => {
      if (notification.autoDismiss && !notification.persistent && notification.duration) {
        timers[notification.id] = setTimeout(() => {
          dismissNotificationWithAnimation(notification.id);
        }, notification.duration);
      }
    });

    return () => {
      Object.values(timers).forEach(clearTimeout);
    };
  }, [notifications, dismissNotificationWithAnimation]);

  const hasActiveNotifications = notifications.length > 0;

  const contextValue: NotificationContextType = {
    notifications,
    showNotification,
    dismissNotification,
    dismissNotificationWithAnimation,
    clearNotifications,
    hasActiveNotifications,
    removingNotifications,
  };

  return (
    <NotificationContext.Provider value={contextValue} data-testid="notification-provider">
      {children}
    </NotificationContext.Provider>
  );
}

// Deletion feedback specific hook
export function useDeletionFeedback() {
  const { showNotification, clearNotifications, notifications, hasActiveNotifications } = useNotifications();

  const showSuccessNotification = useCallback((message: string, options: NotificationOptions = {}) => {
    return showNotification(message, 'success', {
      autoDismiss: true,
      duration: 3000,
      ariaLive: 'polite',
      screenReaderAnnouncement: true,
      ...options,
    });
  }, [showNotification]);

  const showErrorNotification = useCallback((message: string, options: NotificationOptions = {}) => {
    const errorDetails = options.error ? ErrorHandler.handleError(options.error) : null;
    
    return showNotification(message, 'error', {
      persistent: !errorDetails?.retryable,
      retryable: errorDetails?.retryable ?? false,
      ariaLive: 'assertive',
      screenReaderAnnouncement: true,
      priority: 'high',
      ...options,
    });
  }, [showNotification]);

  return {
    showSuccessNotification,
    showErrorNotification,
    clearNotifications,
    notifications: notifications.filter(n => n.type === 'success' || n.type === 'error'),
    hasActiveNotifications,
  };
}