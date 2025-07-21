import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createTodo, getTodos, updateTodo, deleteTodo, ApiError } from './api-client';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('API Client', () => {
  const mockApiUrl = 'http://localhost:8000/api';
  
  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe('getTodos', () => {
    it('should fetch todos successfully', async () => {
      const mockTodos = [
        {
          id: '018c2e65-4b7f-7000-8000-000000000001',
          title: 'Test Todo 1',
          content: '# Test Content',
          completed: false,
          created_at: '2025-01-17T10:00:00Z',
          updated_at: '2025-01-17T10:00:00Z'
        },
        {
          id: '018c2e65-4b7f-7000-8000-000000000002', 
          title: 'Test Todo 2',
          content: '## Another Test',
          completed: true,
          created_at: '2025-01-17T11:00:00Z',
          updated_at: '2025-01-17T12:00:00Z'
        }
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: mockTodos,
          error: null
        }),
      });

      const result = await getTodos();

      expect(mockFetch).toHaveBeenCalledWith(`${mockApiUrl}/todos`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      expect(result).toEqual(mockTodos);
    });

    it('should handle empty todos list', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: [],
          error: null
        }),
      });

      const result = await getTodos();

      expect(result).toEqual([]);
    });

    it('should throw ApiError when API returns error response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({
          success: false,
          data: null,
          error: 'Internal server error'
        }),
      });

      await expect(getTodos()).rejects.toThrow(ApiError);
      await expect(getTodos()).rejects.toThrow('Failed to fetch todos: Internal server error');
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(getTodos()).rejects.toThrow(ApiError);
      await expect(getTodos()).rejects.toThrow('Network error occurred while fetching todos');
    });
  });

  describe('createTodo', () => {
    const newTodo = {
      title: 'New Todo',
      content: '# New content',
    };

    it('should create a todo successfully', async () => {
      const createdTodo = {
        id: '018c2e65-4b7f-7000-8000-000000000003',
        title: 'New Todo',
        content: '# New content',
        completed: false,
        created_at: '2025-01-17T13:00:00Z',
        updated_at: '2025-01-17T13:00:00Z'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({
          success: true,
          data: createdTodo,
          error: null
        }),
      });

      const result = await createTodo(newTodo);

      expect(mockFetch).toHaveBeenCalledWith(`${mockApiUrl}/todos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTodo),
      });
      expect(result).toEqual(createdTodo);
    });

    it('should handle validation errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          success: false,
          data: null,
          error: 'Title is required'
        }),
      });

      await expect(createTodo({ title: '', content: 'test' })).rejects.toThrow(ApiError);
      await expect(createTodo({ title: '', content: 'test' })).rejects.toThrow('Failed to create todo: Title is required');
    });
  });

  describe('updateTodo', () => {
    const todoId = '018c2e65-4b7f-7000-8000-000000000001';
    const updates = {
      title: 'Updated Todo',
      completed: true,
    };

    it('should update a todo successfully', async () => {
      const updatedTodo = {
        id: todoId,
        title: 'Updated Todo',
        content: '# Original content',
        completed: true,
        created_at: '2025-01-17T10:00:00Z',
        updated_at: '2025-01-17T14:00:00Z'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: updatedTodo,
          error: null
        }),
      });

      const result = await updateTodo(todoId, updates);

      expect(mockFetch).toHaveBeenCalledWith(`${mockApiUrl}/todos/${todoId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      expect(result).toEqual(updatedTodo);
    });

    it('should handle todo not found error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({
          success: false,
          data: null,
          error: 'Todo not found'
        }),
      });

      await expect(updateTodo('nonexistent-id', updates)).rejects.toThrow(ApiError);
      await expect(updateTodo('nonexistent-id', updates)).rejects.toThrow('Failed to update todo: Todo not found');
    });
  });

  describe('deleteTodo', () => {
    const todoId = '018c2e65-4b7f-7000-8000-000000000001';

    it('should delete a todo successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: { message: 'Todo deleted successfully' },
          error: null
        }),
      });

      await deleteTodo(todoId);

      expect(mockFetch).toHaveBeenCalledWith(`${mockApiUrl}/todos/${todoId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });

    it('should handle todo not found error on delete', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({
          success: false,
          data: null,
          error: 'Todo not found'
        }),
      });

      await expect(deleteTodo('nonexistent-id')).rejects.toThrow(ApiError);
      await expect(deleteTodo('nonexistent-id')).rejects.toThrow('Failed to delete todo: Todo not found');
    });
  });

  describe('ApiError', () => {
    it('should create ApiError with message and status', () => {
      const error = new ApiError('Test error', 500);

      expect(error.message).toBe('Test error');
      expect(error.status).toBe(500);
      expect(error.name).toBe('ApiError');
      expect(error instanceof Error).toBe(true);
    });

    it('should create ApiError with only message', () => {
      const error = new ApiError('Test error');

      expect(error.message).toBe('Test error');
      expect(error.status).toBeUndefined();
      expect(error.name).toBe('ApiError');
    });
  });
});