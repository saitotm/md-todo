import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createRemixStub } from '@remix-run/testing';
import { json } from '@remix-run/node';
import { getTodosLoader, createTodoAction, updateTodoAction, deleteTodoAction } from './remix-api';
import * as apiClient from './api-client';

// Mock the API client
vi.mock('./api-client', () => ({
  getTodos: vi.fn(),
  createTodo: vi.fn(),
  updateTodo: vi.fn(),
  deleteTodo: vi.fn(),
  ApiError: class extends Error {
    constructor(message: string, public status?: number) {
      super(message);
      this.name = 'ApiError';
    }
  }
}));

describe('Remix API Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getTodosLoader', () => {
    it('should load todos successfully', async () => {
      const mockTodos = [
        {
          id: '018c2e65-4b7f-7000-8000-000000000001',
          title: 'Test Todo',
          content: '# Test Content',
          completed: false,
          created_at: '2025-01-17T10:00:00Z',
          updated_at: '2025-01-17T10:00:00Z'
        }
      ];

      vi.mocked(apiClient.getTodos).mockResolvedValue(mockTodos);

      const request = new Request('http://localhost:3000/');
      const result = await getTodosLoader({ request, params: {}, context: {} });

      expect(result).toEqual(json({ todos: mockTodos }));
      expect(apiClient.getTodos).toHaveBeenCalledTimes(1);
    });

    it('should handle API errors and return error response', async () => {
      const apiError = new apiClient.ApiError('Failed to fetch todos', 500);
      vi.mocked(apiClient.getTodos).mockRejectedValue(apiError);

      const request = new Request('http://localhost:3000/');
      const result = await getTodosLoader({ request, params: {}, context: {} });

      expect(result).toEqual(json({ 
        todos: [], 
        error: 'Failed to load todos. Please try again.' 
      }, { status: 500 }));
      expect(apiClient.getTodos).toHaveBeenCalledTimes(1);
    });

    it('should handle network errors', async () => {
      const networkError = new Error('Network error');
      vi.mocked(apiClient.getTodos).mockRejectedValue(networkError);

      const request = new Request('http://localhost:3000/');
      const result = await getTodosLoader({ request, params: {}, context: {} });

      expect(result).toEqual(json({ 
        todos: [], 
        error: 'Failed to load todos. Please check your connection.' 
      }, { status: 500 }));
      expect(apiClient.getTodos).toHaveBeenCalledTimes(1);
    });
  });

  describe('createTodoAction', () => {
    it('should create todo successfully', async () => {
      const newTodo = {
        id: '018c2e65-4b7f-7000-8000-000000000002',
        title: 'New Todo',
        content: '# New Content',
        completed: false,
        created_at: '2025-01-17T11:00:00Z',
        updated_at: '2025-01-17T11:00:00Z'
      };

      vi.mocked(apiClient.createTodo).mockResolvedValue(newTodo);

      const formData = new FormData();
      formData.append('title', 'New Todo');
      formData.append('content', '# New Content');
      formData.append('_action', 'create');

      const request = new Request('http://localhost:3000/', {
        method: 'POST',
        body: formData
      });

      const result = await createTodoAction({ request, params: {}, context: {} });

      expect(result).toEqual(json({ 
        success: true, 
        todo: newTodo,
        message: 'Todo created successfully!'
      }));
      expect(apiClient.createTodo).toHaveBeenCalledWith({
        title: 'New Todo',
        content: '# New Content'
      });
    });

    it('should validate form data and return validation errors', async () => {
      const formData = new FormData();
      formData.append('title', ''); // Empty title
      formData.append('content', 'Some content');
      formData.append('_action', 'create');

      const request = new Request('http://localhost:3000/', {
        method: 'POST',
        body: formData
      });

      const result = await createTodoAction({ request, params: {}, context: {} });

      expect(result).toEqual(json({ 
        success: false,
        errors: { title: 'Title is required' }
      }, { status: 400 }));
      expect(apiClient.createTodo).not.toHaveBeenCalled();
    });

    it('should handle API validation errors', async () => {
      const apiError = new apiClient.ApiError('Title must be between 1 and 255 characters', 400);
      vi.mocked(apiClient.createTodo).mockRejectedValue(apiError);

      const formData = new FormData();
      formData.append('title', 'Valid Title');
      formData.append('content', '# Valid Content');
      formData.append('_action', 'create');

      const request = new Request('http://localhost:3000/', {
        method: 'POST',
        body: formData
      });

      const result = await createTodoAction({ request, params: {}, context: {} });

      expect(result).toEqual(json({ 
        success: false,
        error: 'Title must be between 1 and 255 characters'
      }, { status: 400 }));
    });

    it('should handle server errors during creation', async () => {
      const serverError = new apiClient.ApiError('Internal server error', 500);
      vi.mocked(apiClient.createTodo).mockRejectedValue(serverError);

      const formData = new FormData();
      formData.append('title', 'Valid Title');
      formData.append('content', '# Valid Content');
      formData.append('_action', 'create');

      const request = new Request('http://localhost:3000/', {
        method: 'POST',
        body: formData
      });

      const result = await createTodoAction({ request, params: {}, context: {} });

      expect(result).toEqual(json({ 
        success: false,
        error: 'Failed to create todo. Please try again.'
      }, { status: 500 }));
    });
  });

  describe('updateTodoAction', () => {
    const todoId = '018c2e65-4b7f-7000-8000-000000000001';

    it('should update todo successfully', async () => {
      const updatedTodo = {
        id: todoId,
        title: 'Updated Todo',
        content: '# Updated Content',
        completed: true,
        created_at: '2025-01-17T10:00:00Z',
        updated_at: '2025-01-17T12:00:00Z'
      };

      vi.mocked(apiClient.updateTodo).mockResolvedValue(updatedTodo);

      const formData = new FormData();
      formData.append('title', 'Updated Todo');
      formData.append('content', '# Updated Content');
      formData.append('completed', 'true');
      formData.append('_action', 'update');

      const request = new Request('http://localhost:3000/', {
        method: 'POST',
        body: formData
      });

      const result = await updateTodoAction({ request, params: { id: todoId }, context: {} });

      expect(result).toEqual(json({ 
        success: true, 
        todo: updatedTodo,
        message: 'Todo updated successfully!'
      }));
      expect(apiClient.updateTodo).toHaveBeenCalledWith(todoId, {
        title: 'Updated Todo',
        content: '# Updated Content',
        completed: true
      });
    });

    it('should handle todo not found error', async () => {
      const notFoundError = new apiClient.ApiError('Todo not found', 404);
      vi.mocked(apiClient.updateTodo).mockRejectedValue(notFoundError);

      const formData = new FormData();
      formData.append('title', 'Updated Todo');
      formData.append('_action', 'update');

      const request = new Request('http://localhost:3000/', {
        method: 'POST',
        body: formData
      });

      const result = await updateTodoAction({ request, params: { id: 'nonexistent-id' }, context: {} });

      expect(result).toEqual(json({ 
        success: false,
        error: 'Todo not found'
      }, { status: 404 }));
    });

    it('should toggle completion status only', async () => {
      const toggledTodo = {
        id: todoId,
        title: 'Existing Todo',
        content: '# Existing Content',
        completed: true,
        created_at: '2025-01-17T10:00:00Z',
        updated_at: '2025-01-17T12:30:00Z'
      };

      vi.mocked(apiClient.updateTodo).mockResolvedValue(toggledTodo);

      const formData = new FormData();
      formData.append('completed', 'true');
      formData.append('_action', 'toggle');

      const request = new Request('http://localhost:3000/', {
        method: 'POST',
        body: formData
      });

      const result = await updateTodoAction({ request, params: { id: todoId }, context: {} });

      expect(result).toEqual(json({ 
        success: true, 
        todo: toggledTodo
      }));
      expect(apiClient.updateTodo).toHaveBeenCalledWith(todoId, {
        completed: true
      });
    });
  });

  describe('deleteTodoAction', () => {
    const todoId = '018c2e65-4b7f-7000-8000-000000000001';

    it('should delete todo successfully', async () => {
      vi.mocked(apiClient.deleteTodo).mockResolvedValue(undefined);

      const formData = new FormData();
      formData.append('_action', 'delete');

      const request = new Request('http://localhost:3000/', {
        method: 'POST',
        body: formData
      });

      const result = await deleteTodoAction({ request, params: { id: todoId }, context: {} });

      expect(result).toEqual(json({ 
        success: true,
        message: 'Todo deleted successfully!'
      }));
      expect(apiClient.deleteTodo).toHaveBeenCalledWith(todoId);
    });

    it('should handle todo not found error on delete', async () => {
      const notFoundError = new apiClient.ApiError('Todo not found', 404);
      vi.mocked(apiClient.deleteTodo).mockRejectedValue(notFoundError);

      const formData = new FormData();
      formData.append('_action', 'delete');

      const request = new Request('http://localhost:3000/', {
        method: 'POST',
        body: formData
      });

      const result = await deleteTodoAction({ request, params: { id: 'nonexistent-id' }, context: {} });

      expect(result).toEqual(json({ 
        success: false,
        error: 'Todo not found'
      }, { status: 404 }));
    });

    it('should handle server errors during deletion', async () => {
      const serverError = new apiClient.ApiError('Internal server error', 500);
      vi.mocked(apiClient.deleteTodo).mockRejectedValue(serverError);

      const formData = new FormData();
      formData.append('_action', 'delete');

      const request = new Request('http://localhost:3000/', {
        method: 'POST',
        body: formData
      });

      const result = await deleteTodoAction({ request, params: { id: todoId }, context: {} });

      expect(result).toEqual(json({ 
        success: false,
        error: 'Failed to delete todo. Please try again.'
      }, { status: 500 }));
    });
  });
});