import { describe, it, expect } from 'vitest';
import { StateError, ValidationError, NetworkError, ErrorHandler } from './state-errors';

// This test file tests error handling in state management

describe('StateError Class', () => {
  describe('constructor', () => {
    it('should create StateError with message', () => {
      const error = new StateError('Something went wrong');

      expect(error.message).toBe('Something went wrong');
      expect(error.name).toBe('StateError');
      expect(error.type).toBe('general');
      expect(error.field).toBeUndefined();
      expect(error.code).toBeUndefined();
    });

    it('should create StateError with type and field', () => {
      const error = new StateError('Validation failed', {
        type: 'validation',
        field: 'title'
      });

      expect(error.message).toBe('Validation failed');
      expect(error.type).toBe('validation');
      expect(error.field).toBe('title');
    });

    it('should create StateError with error code', () => {
      const error = new StateError('Network error', {
        type: 'network',
        code: 'NETWORK_TIMEOUT'
      });

      expect(error.message).toBe('Network error');
      expect(error.type).toBe('network');
      expect(error.code).toBe('NETWORK_TIMEOUT');
    });
  });

  describe('isValidationError method', () => {
    it('should return true for validation errors', () => {
      const error = new StateError('Validation failed', { type: 'validation' });

      expect(error.isValidationError()).toBe(true);
    });

    it('should return false for non-validation errors', () => {
      const error = new StateError('Network error', { type: 'network' });

      expect(error.isValidationError()).toBe(false);
    });
  });

  describe('isNetworkError method', () => {
    it('should return true for network errors', () => {
      const error = new StateError('Network error', { type: 'network' });

      expect(error.isNetworkError()).toBe(true);
    });

    it('should return false for non-network errors', () => {
      const error = new StateError('Validation failed', { type: 'validation' });

      expect(error.isNetworkError()).toBe(false);
    });
  });

  describe('toJSON method', () => {
    it('should serialize error to JSON', () => {
      const error = new StateError('Test error', {
        type: 'validation',
        field: 'title',
        code: 'REQUIRED'
      });

      const json = error.toJSON();

      expect(json).toEqual({
        name: 'StateError',
        message: 'Test error',
        type: 'validation',
        field: 'title',
        code: 'REQUIRED'
      });
    });
  });
});

describe('ValidationError Class', () => {
  describe('constructor', () => {
    it('should create ValidationError for specific field', () => {
      const error = new ValidationError('title', 'Title is required');

      expect(error.field).toBe('title');
      expect(error.message).toBe('Title is required');
      expect(error.type).toBe('validation');
      expect(error.name).toBe('ValidationError');
    });

    it('should create ValidationError with validation rule', () => {
      const error = new ValidationError('title', 'Title is required', 'required');

      expect(error.field).toBe('title');
      expect(error.message).toBe('Title is required');
      expect(error.rule).toBe('required');
    });
  });

  describe('static methods', () => {
    it('should create required field error', () => {
      const error = ValidationError.required('title');

      expect(error.field).toBe('title');
      expect(error.message).toContain('required');
      expect(error.rule).toBe('required');
    });

    it('should create minimum length error', () => {
      const error = ValidationError.minLength('title', 3);

      expect(error.field).toBe('title');
      expect(error.message).toContain('3 characters');
      expect(error.rule).toBe('minLength');
    });

    it('should create maximum length error', () => {
      const error = ValidationError.maxLength('title', 255);

      expect(error.field).toBe('title');
      expect(error.message).toContain('255 characters');
      expect(error.rule).toBe('maxLength');
    });

    it('should create pattern mismatch error', () => {
      const error = ValidationError.pattern('email', 'email');

      expect(error.field).toBe('email');
      expect(error.message).toContain('format');
      expect(error.rule).toBe('pattern');
    });
  });
});

describe('NetworkError Class', () => {
  describe('constructor', () => {
    it('should create NetworkError with message', () => {
      const error = new NetworkError('Connection timeout');

      expect(error.message).toBe('Connection timeout');
      expect(error.type).toBe('network');
      expect(error.name).toBe('NetworkError');
      expect(error.status).toBeUndefined();
    });

    it('should create NetworkError with status code', () => {
      const error = new NetworkError('Not found', 404);

      expect(error.message).toBe('Not found');
      expect(error.status).toBe(404);
    });

    it('should create NetworkError with response details', () => {
      const error = new NetworkError('Server error', 500, {
        url: '/api/todos',
        method: 'POST'
      });

      expect(error.message).toBe('Server error');
      expect(error.status).toBe(500);
      expect(error.url).toBe('/api/todos');
      expect(error.method).toBe('POST');
    });
  });

  describe('static methods', () => {
    it('should create timeout error', () => {
      const error = NetworkError.timeout();

      expect(error.message).toContain('timeout');
      expect(error.code).toBe('TIMEOUT');
    });

    it('should create connection error', () => {
      const error = NetworkError.connectionFailed();

      expect(error.message).toContain('connection');
      expect(error.code).toBe('CONNECTION_FAILED');
    });

    it('should create server error', () => {
      const error = NetworkError.serverError(500);

      expect(error.message).toContain('server');
      expect(error.status).toBe(500);
      expect(error.code).toBe('SERVER_ERROR');
    });

    it('should create not found error', () => {
      const error = NetworkError.notFound('/api/todos/123');

      expect(error.message).toContain('not found');
      expect(error.status).toBe(404);
      expect(error.url).toBe('/api/todos/123');
    });
  });

  describe('isRetryable method', () => {
    it('should return true for retryable errors', () => {
      const timeoutError = NetworkError.timeout();
      const serverError = NetworkError.serverError(500);

      expect(timeoutError.isRetryable()).toBe(true);
      expect(serverError.isRetryable()).toBe(true);
    });

    it('should return false for non-retryable errors', () => {
      const notFoundError = NetworkError.notFound('/api/todos/123');
      const badRequestError = new NetworkError('Bad request', 400);

      expect(notFoundError.isRetryable()).toBe(false);
      expect(badRequestError.isRetryable()).toBe(false);
    });
  });
});

describe('ErrorHandler Class', () => {
  describe('handleError method', () => {
    it('should format validation errors for display', () => {
      const validationError = new ValidationError('title', 'Title is required');

      const formatted = ErrorHandler.handleError(validationError);

      expect(formatted.type).toBe('validation');
      expect(formatted.message).toContain('Title is required');
      expect(formatted.field).toBe('title');
      expect(formatted.displayMessage).toBeDefined();
    });

    it('should format network errors for display', () => {
      const networkError = NetworkError.timeout();

      const formatted = ErrorHandler.handleError(networkError);

      expect(formatted.type).toBe('network');
      expect(formatted.message).toContain('timeout');
      expect(formatted.displayMessage).toBeDefined();
      expect(formatted.retryable).toBe(true);
    });

    it('should handle generic errors', () => {
      const genericError = new Error('Something unexpected happened');

      const formatted = ErrorHandler.handleError(genericError);

      expect(formatted.type).toBe('unknown');
      expect(formatted.message).toBe('Something unexpected happened');
      expect(formatted.displayMessage).toBeDefined();
    });
  });

  describe('formatErrorsForForm method', () => {
    it('should format array of validation errors for form display', () => {
      const errors = [
        new ValidationError('title', 'Title is required'),
        new ValidationError('content', 'Content is too long')
      ];

      const formattedErrors = ErrorHandler.formatErrorsForForm(errors);

      expect(formattedErrors).toEqual({
        title: 'Title is required',
        content: 'Content is too long'
      });
    });

    it('should handle mixed error types', () => {
      const errors = [
        new ValidationError('title', 'Title is required'),
        new NetworkError('Connection failed')
      ];

      const formattedErrors = ErrorHandler.formatErrorsForForm(errors);

      expect(formattedErrors.title).toBe('Title is required');
      expect(formattedErrors._general).toContain('Connection failed');
    });
  });

  describe('shouldShowToUser method', () => {
    it('should return true for user-facing errors', () => {
      const validationError = new ValidationError('title', 'Title is required');
      const notFoundError = NetworkError.notFound('/api/todos/123');

      expect(ErrorHandler.shouldShowToUser(validationError)).toBe(true);
      expect(ErrorHandler.shouldShowToUser(notFoundError)).toBe(true);
    });

    it('should return false for internal errors', () => {
      const internalError = new StateError('Internal state corruption', { type: 'internal' });

      expect(ErrorHandler.shouldShowToUser(internalError)).toBe(false);
    });
  });

  describe('getRetryDelay method', () => {
    it('should calculate retry delay for retryable errors', () => {
      const timeoutError = NetworkError.timeout();

      const delay1 = ErrorHandler.getRetryDelay(timeoutError, 1);
      const delay2 = ErrorHandler.getRetryDelay(timeoutError, 2);
      const delay3 = ErrorHandler.getRetryDelay(timeoutError, 3);

      expect(delay1).toBeGreaterThan(0);
      expect(delay2).toBeGreaterThan(delay1);
      expect(delay3).toBeGreaterThan(delay2);
    });

    it('should return 0 for non-retryable errors', () => {
      const validationError = new ValidationError('title', 'Title is required');

      const delay = ErrorHandler.getRetryDelay(validationError, 1);

      expect(delay).toBe(0);
    });

    it('should cap retry delay at maximum', () => {
      const serverError = NetworkError.serverError(500);

      const maxDelay = ErrorHandler.getRetryDelay(serverError, 10);

      expect(maxDelay).toBeLessThanOrEqual(30000); // 30 seconds max
    });
  });
});

