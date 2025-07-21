import { Todo, TodoCreateData, TodoUpdateData, ApiResponse } from './types';

// Environment variable for API URL, defaulting to localhost for development
const API_BASE_URL = process.env.API_URL || 'http://localhost:8000';
const API_URL = `${API_BASE_URL}/api`;

export class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'ApiError';
  }
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const config = { ...defaultOptions, ...options };

  try {
    const response = await fetch(url, config);
    
    let data: ApiResponse<T>;
    try {
      data = await response.json();
    } catch (jsonError) {
      const status = response?.status || 500;
      const statusText = response?.statusText || 'Unknown Error';
      throw new ApiError(`HTTP ${status}: ${statusText}`, status);
    }

    if (!response.ok || !data.success) {
      const errorMessage = data.error || `HTTP ${response.status}: ${response.statusText || 'Unknown Error'}`;
      throw new ApiError(errorMessage, response.status);
    }

    return data.data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Handle network errors or other fetch failures
    if (error instanceof Error) {
      throw new ApiError(error.message, 0);
    }
    
    throw new ApiError(
      `Network error occurred while making request to ${endpoint}`,
      0
    );
  }
}

export async function getTodos(): Promise<Todo[]> {
  try {
    return await apiRequest<Todo[]>('/todos', {
      method: 'GET',
    });
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.message.includes('Network error')) {
        throw new ApiError('Network error occurred while fetching todos');
      }
      throw new ApiError(`Failed to fetch todos: ${error.message}`, error.status);
    }
    throw new ApiError('Network error occurred while fetching todos');
  }
}

export async function createTodo(data: TodoCreateData): Promise<Todo> {
  try {
    return await apiRequest<Todo>('/todos', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.message.includes('Network error')) {
        throw new ApiError('Network error occurred while creating todo');
      }
      throw new ApiError(`Failed to create todo: ${error.message}`, error.status);
    }
    throw new ApiError('Network error occurred while creating todo');
  }
}

export async function updateTodo(id: string, data: TodoUpdateData): Promise<Todo> {
  try {
    return await apiRequest<Todo>(`/todos/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.message.includes('Network error')) {
        throw new ApiError('Network error occurred while updating todo');
      }
      throw new ApiError(`Failed to update todo: ${error.message}`, error.status);
    }
    throw new ApiError('Network error occurred while updating todo');
  }
}

export async function deleteTodo(id: string): Promise<void> {
  try {
    await apiRequest<{ message: string }>(`/todos/${id}`, {
      method: 'DELETE',
    });
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.message.includes('Network error')) {
        throw new ApiError('Network error occurred while deleting todo');
      }
      throw new ApiError(`Failed to delete todo: ${error.message}`, error.status);
    }
    throw new ApiError('Network error occurred while deleting todo');
  }
}