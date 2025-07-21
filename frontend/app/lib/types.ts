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

export function validateTodo(todo: any): ValidationResult {
  const errors: string[] = [];

  // Required fields validation
  if (!todo.id) {
    errors.push('id is required');
  } else if (!UUID_V7_REGEX.test(todo.id)) {
    errors.push('Invalid UUID format');
  }

  if (!todo.title || typeof todo.title !== 'string') {
    errors.push('Title is required');
  } else if (todo.title.trim().length === 0) {
    errors.push('Title is required');
  } else if (todo.title.length > 255) {
    errors.push('Title must be 255 characters or less');
  }

  if (todo.content === undefined || todo.content === null || typeof todo.content !== 'string') {
    errors.push('Content is required');
  } else if (todo.content.length > 10000) {
    errors.push('Content must be 10000 characters or less');
  }

  if (typeof todo.completed !== 'boolean') {
    errors.push('completed must be a boolean');
  }

  if (!todo.created_at) {
    errors.push('created_at is required');
  } else if (!ISO_DATE_REGEX.test(todo.created_at)) {
    errors.push('created_at must be a valid ISO date');
  }

  if (!todo.updated_at) {
    errors.push('updated_at is required');
  } else if (!ISO_DATE_REGEX.test(todo.updated_at)) {
    errors.push('updated_at must be a valid ISO date');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateCreateData(data: any): ValidationResult {
  const errors: string[] = [];

  if (!data.title || typeof data.title !== 'string') {
    errors.push('Title is required');
  } else if (data.title.trim().length === 0) {
    errors.push('Title is required');
  } else if (data.title.length > 255) {
    errors.push('Title must be 255 characters or less');
  }

  if (data.content === undefined || data.content === null || typeof data.content !== 'string') {
    errors.push('Content is required');
  } else if (data.content.length > 10000) {
    errors.push('Content must be 10000 characters or less');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateUpdateData(data: any): ValidationResult {
  const errors: string[] = [];

  // For updates, fields are optional, but if provided they must be valid
  if (data.title !== undefined) {
    if (typeof data.title !== 'string') {
      errors.push('Title must be a string');
    } else if (data.title.trim().length === 0) {
      errors.push('Title cannot be empty');
    } else if (data.title.length > 255) {
      errors.push('Title must be 255 characters or less');
    }
  }

  if (data.content !== undefined) {
    if (typeof data.content !== 'string') {
      errors.push('Content must be a string');
    } else if (data.content.length > 10000) {
      errors.push('Content must be 10000 characters or less');
    }
  }

  if (data.completed !== undefined && typeof data.completed !== 'boolean') {
    errors.push('completed must be a boolean');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}