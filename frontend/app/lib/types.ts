export interface Todo {
  id: string;
  title: string;
  content: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface TodoCreateData {
  title: string;
  content: string;
}

export interface TodoUpdateData {
  title?: string;
  content?: string;
  completed?: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error: string | null;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// UUID v7 validation regex
const UUID_V7_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// ISO 8601 date validation regex
const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/;

export function validateTodo(todo: unknown): ValidationResult {
  const errors: string[] = [];

  // Type guard to ensure todo is an object
  if (typeof todo !== 'object' || todo === null) {
    errors.push('Todo must be an object');
    return {
      isValid: false,
      errors,
    };
  }

  const todoObj = todo as Record<string, unknown>;

  // Required fields validation
  if (!todoObj.id) {
    errors.push('id is required');
  } else if (typeof todoObj.id !== 'string' || !UUID_V7_REGEX.test(todoObj.id)) {
    errors.push('Invalid UUID format');
  }

  if (!todoObj.title || typeof todoObj.title !== 'string') {
    errors.push('Title is required');
  } else if (todoObj.title.trim().length === 0) {
    errors.push('Title is required');
  } else if (todoObj.title.length > 255) {
    errors.push('Title must be 255 characters or less');
  }

  if (todoObj.content === undefined || todoObj.content === null || typeof todoObj.content !== 'string') {
    errors.push('Content is required');
  } else if (todoObj.content.length > 10000) {
    errors.push('Content must be 10000 characters or less');
  }

  if (typeof todoObj.completed !== 'boolean') {
    errors.push('completed must be a boolean');
  }

  if (!todoObj.created_at) {
    errors.push('created_at is required');
  } else if (typeof todoObj.created_at !== 'string' || !ISO_DATE_REGEX.test(todoObj.created_at)) {
    errors.push('created_at must be a valid ISO date');
  }

  if (!todoObj.updated_at) {
    errors.push('updated_at is required');
  } else if (typeof todoObj.updated_at !== 'string' || !ISO_DATE_REGEX.test(todoObj.updated_at)) {
    errors.push('updated_at must be a valid ISO date');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateCreateData(data: unknown): ValidationResult {
  const errors: string[] = [];

  // Type guard to ensure data is an object
  if (typeof data !== 'object' || data === null) {
    errors.push('Data must be an object');
    return {
      isValid: false,
      errors,
    };
  }

  const dataObj = data as Record<string, unknown>;

  if (!dataObj.title || typeof dataObj.title !== 'string') {
    errors.push('Title is required');
  } else if (dataObj.title.trim().length === 0) {
    errors.push('Title is required');
  } else if (dataObj.title.length > 255) {
    errors.push('Title must be 255 characters or less');
  }

  if (dataObj.content === undefined || dataObj.content === null || typeof dataObj.content !== 'string') {
    errors.push('Content is required');
  } else if (dataObj.content.length > 10000) {
    errors.push('Content must be 10000 characters or less');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateUpdateData(data: unknown): ValidationResult {
  const errors: string[] = [];

  // Type guard to ensure data is an object
  if (typeof data !== 'object' || data === null) {
    errors.push('Data must be an object');
    return {
      isValid: false,
      errors,
    };
  }

  const dataObj = data as Record<string, unknown>;

  // For updates, fields are optional, but if provided they must be valid
  if (dataObj.title !== undefined) {
    if (typeof dataObj.title !== 'string') {
      errors.push('Title must be a string');
    } else if (dataObj.title.trim().length === 0) {
      errors.push('Title cannot be empty');
    } else if (dataObj.title.length > 255) {
      errors.push('Title must be 255 characters or less');
    }
  }

  if (dataObj.content !== undefined) {
    if (typeof dataObj.content !== 'string') {
      errors.push('Content must be a string');
    } else if (dataObj.content.length > 10000) {
      errors.push('Content must be 10000 characters or less');
    }
  }

  if (dataObj.completed !== undefined && typeof dataObj.completed !== 'boolean') {
    errors.push('completed must be a boolean');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}