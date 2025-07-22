export class StateError extends Error {
  type: string;
  field?: string;
  code?: string;

  constructor(message: string, options: {
    type?: string;
    field?: string;
    code?: string;
  } = {}) {
    super(message);
    this.name = 'StateError';
    this.type = options.type || 'general';
    this.field = options.field;
    this.code = options.code;

    // Set the prototype explicitly for proper instanceof checks
    Object.setPrototypeOf(this, StateError.prototype);
  }

  isValidationError(): boolean {
    return this.type === 'validation';
  }

  isNetworkError(): boolean {
    return this.type === 'network';
  }

  toJSON(): Record<string, any> {
    return {
      name: this.name,
      message: this.message,
      type: this.type,
      field: this.field,
      code: this.code
    };
  }
}

export class ValidationError extends StateError {
  field: string;
  rule?: string;

  constructor(field: string, message: string, rule?: string) {
    super(message, { type: 'validation', field });
    this.name = 'ValidationError';
    this.field = field;
    this.rule = rule;

    Object.setPrototypeOf(this, ValidationError.prototype);
  }

  static required(field: string): ValidationError {
    return new ValidationError(field, `${field} is required`, 'required');
  }

  static minLength(field: string, min: number): ValidationError {
    return new ValidationError(
      field, 
      `${field} must be at least ${min} characters long`, 
      'minLength'
    );
  }

  static maxLength(field: string, max: number): ValidationError {
    return new ValidationError(
      field,
      `${field} must be no more than ${max} characters long`,
      'maxLength'
    );
  }

  static pattern(field: string, patternName: string): ValidationError {
    return new ValidationError(
      field,
      `${field} has invalid ${patternName} format`,
      'pattern'
    );
  }
}

export class NetworkError extends StateError {
  status?: number;
  url?: string;
  method?: string;

  constructor(message: string, status?: number, details?: {
    url?: string;
    method?: string;
  }) {
    super(message, { type: 'network' });
    this.name = 'NetworkError';
    this.status = status;
    this.url = details?.url;
    this.method = details?.method;

    Object.setPrototypeOf(this, NetworkError.prototype);
  }

  static timeout(): NetworkError {
    const error = new NetworkError('Request timeout occurred');
    error.code = 'TIMEOUT';
    return error;
  }

  static connectionFailed(): NetworkError {
    const error = new NetworkError('connection failed');
    error.code = 'CONNECTION_FAILED';
    return error;
  }

  static serverError(status: number): NetworkError {
    const error = new NetworkError(`server error occurred`, status);
    error.code = 'SERVER_ERROR';
    return error;
  }

  static notFound(url?: string): NetworkError {
    const error = new NetworkError('Resource not found', 404, { url });
    return error;
  }

  isRetryable(): boolean {
    // Retry for 5xx errors, timeout, and connection issues
    if (this.code === 'TIMEOUT' || this.code === 'CONNECTION_FAILED') {
      return true;
    }
    if (this.status && this.status >= 500) {
      return true;
    }
    return false;
  }
}

export class ErrorHandler {
  static handleError(error: Error): {
    type: string;
    message: string;
    field?: string;
    displayMessage: string;
    retryable?: boolean;
  } {
    if (error instanceof ValidationError) {
      return {
        type: 'validation',
        message: error.message,
        field: error.field,
        displayMessage: error.message,
      };
    }

    if (error instanceof NetworkError) {
      return {
        type: 'network',
        message: error.message,
        displayMessage: this.formatNetworkErrorMessage(error),
        retryable: error.isRetryable(),
      };
    }

    if (error instanceof StateError) {
      return {
        type: error.type,
        message: error.message,
        field: error.field,
        displayMessage: error.message,
      };
    }

    // Generic error handling
    return {
      type: 'unknown',
      message: error.message,
      displayMessage: 'An unexpected error occurred. Please try again.',
    };
  }

  private static formatNetworkErrorMessage(error: NetworkError): string {
    if (error.code === 'TIMEOUT') {
      return 'Request timed out. Please check your connection and try again.';
    }
    if (error.code === 'CONNECTION_FAILED') {
      return 'Unable to connect to the server. Please check your network connection.';
    }
    if (error.status === 404) {
      return 'The requested resource was not found.';
    }
    if (error.status && error.status >= 500) {
      return 'A server error occurred. Please try again later.';
    }
    return error.message;
  }

  static formatErrorsForForm(errors: Error[]): Record<string, string> {
    const formattedErrors: Record<string, string> = {};

    for (const error of errors) {
      if (error instanceof ValidationError) {
        formattedErrors[error.field] = error.message;
      } else if (error instanceof StateError && error.field) {
        formattedErrors[error.field] = error.message;
      } else {
        // Non-field specific errors go to a general key
        formattedErrors._general = error.message;
      }
    }

    return formattedErrors;
  }

  static shouldShowToUser(error: Error): boolean {
    if (error instanceof StateError && error.type === 'internal') {
      return false;
    }
    return true;
  }

  static getRetryDelay(error: Error, attempt: number): number {
    if (!(error instanceof NetworkError) || !error.isRetryable()) {
      return 0;
    }

    // Exponential backoff: 1s, 2s, 4s, 8s, 16s, 30s (capped)
    const baseDelay = 1000;
    const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), 30000);
    
    return delay;
  }
}