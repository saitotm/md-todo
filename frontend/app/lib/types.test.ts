import { describe, it, expect } from 'vitest';
import { Todo, TodoCreateData, TodoUpdateData, ApiResponse, validateTodo, validateCreateData, validateUpdateData } from './types';

describe('Todo Types and Validation', () => {
  describe('Todo interface', () => {
    it('should define correct Todo structure', () => {
      const validTodo: Todo = {
        id: '018c2e65-4b7f-7000-8000-000000000001',
        title: 'Test Todo',
        content: '# Test Content\n\nThis is markdown content.',
        completed: false,
        created_at: '2025-01-17T10:00:00Z',
        updated_at: '2025-01-17T10:00:00Z'
      };

      // Test that the structure is valid
      expect(validTodo.id).toBe('018c2e65-4b7f-7000-8000-000000000001');
      expect(validTodo.title).toBe('Test Todo');
      expect(validTodo.content).toBe('# Test Content\n\nThis is markdown content.');
      expect(validTodo.completed).toBe(false);
      expect(validTodo.created_at).toBe('2025-01-17T10:00:00Z');
      expect(validTodo.updated_at).toBe('2025-01-17T10:00:00Z');
    });
  });

  describe('TodoCreateData interface', () => {
    it('should define correct create data structure', () => {
      const createData: TodoCreateData = {
        title: 'New Todo',
        content: '# New content'
      };

      expect(createData.title).toBe('New Todo');
      expect(createData.content).toBe('# New content');
      // Should not have id, completed, or timestamp fields
      expect('id' in createData).toBe(false);
      expect('completed' in createData).toBe(false);
      expect('created_at' in createData).toBe(false);
    });
  });

  describe('TodoUpdateData interface', () => {
    it('should allow partial updates', () => {
      const updateData: TodoUpdateData = {
        title: 'Updated Title'
        // Other fields should be optional
      };

      expect(updateData.title).toBe('Updated Title');
      expect('content' in updateData).toBe(false);
      expect('completed' in updateData).toBe(false);
    });

    it('should allow completion toggle only', () => {
      const toggleData: TodoUpdateData = {
        completed: true
      };

      expect(toggleData.completed).toBe(true);
      expect('title' in toggleData).toBe(false);
      expect('content' in toggleData).toBe(false);
    });

    it('should allow multiple field updates', () => {
      const updateData: TodoUpdateData = {
        title: 'Updated Title',
        content: '# Updated content',
        completed: true
      };

      expect(updateData.title).toBe('Updated Title');
      expect(updateData.content).toBe('# Updated content');
      expect(updateData.completed).toBe(true);
    });
  });

  describe('ApiResponse interface', () => {
    it('should define success response structure', () => {
      const successResponse: ApiResponse<Todo> = {
        success: true,
        data: {
          id: '018c2e65-4b7f-7000-8000-000000000001',
          title: 'Test Todo',
          content: '# Test Content',
          completed: false,
          created_at: '2025-01-17T10:00:00Z',
          updated_at: '2025-01-17T10:00:00Z'
        },
        error: null
      };

      expect(successResponse.success).toBe(true);
      expect(successResponse.data).toBeDefined();
      expect(successResponse.error).toBe(null);
    });

    it('should define error response structure', () => {
      const errorResponse: ApiResponse<null> = {
        success: false,
        data: null,
        error: 'Something went wrong'
      };

      expect(errorResponse.success).toBe(false);
      expect(errorResponse.data).toBe(null);
      expect(errorResponse.error).toBe('Something went wrong');
    });
  });

  describe('validateTodo', () => {
    it('should validate a complete todo object', () => {
      const validTodo = {
        id: '018c2e65-4b7f-7000-8000-000000000001',
        title: 'Valid Todo',
        content: '# Valid content',
        completed: false,
        created_at: '2025-01-17T10:00:00Z',
        updated_at: '2025-01-17T10:00:00Z'
      };

      const result = validateTodo(validTodo);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should reject todo with missing required fields', () => {
      const incompleteTodo = {
        id: '018c2e65-4b7f-7000-8000-000000000001',
        title: '',
        content: '# Some content',
        completed: false
      };

      const result = validateTodo(incompleteTodo);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Title is required');
      expect(result.errors).toContain('created_at is required');
      expect(result.errors).toContain('updated_at is required');
    });

    it('should validate title length constraints', () => {
      const tooLongTitle = 'a'.repeat(256); // Assuming 255 character limit
      const todoWithLongTitle = {
        id: '018c2e65-4b7f-7000-8000-000000000001',
        title: tooLongTitle,
        content: '# Content',
        completed: false,
        created_at: '2025-01-17T10:00:00Z',
        updated_at: '2025-01-17T10:00:00Z'
      };

      const result = validateTodo(todoWithLongTitle);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Title must be 255 characters or less');
    });

    it('should validate content length constraints', () => {
      const tooLongContent = '#'.repeat(10001); // Assuming 10000 character limit
      const todoWithLongContent = {
        id: '018c2e65-4b7f-7000-8000-000000000001',
        title: 'Valid Title',
        content: tooLongContent,
        completed: false,
        created_at: '2025-01-17T10:00:00Z',
        updated_at: '2025-01-17T10:00:00Z'
      };

      const result = validateTodo(todoWithLongContent);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Content must be 10000 characters or less');
    });

    it('should validate UUID format', () => {
      const todoWithInvalidId = {
        id: 'invalid-uuid',
        title: 'Valid Title',
        content: '# Valid content',
        completed: false,
        created_at: '2025-01-17T10:00:00Z',
        updated_at: '2025-01-17T10:00:00Z'
      };

      const result = validateTodo(todoWithInvalidId);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid UUID format');
    });

    it('should validate ISO date format', () => {
      const todoWithInvalidDate = {
        id: '018c2e65-4b7f-7000-8000-000000000001',
        title: 'Valid Title',
        content: '# Valid content',
        completed: false,
        created_at: 'invalid-date',
        updated_at: '2025-01-17T10:00:00Z'
      };

      const result = validateTodo(todoWithInvalidDate);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('created_at must be a valid ISO date');
    });
  });

  describe('validateCreateData', () => {
    it('should validate creation data with valid input', () => {
      const createData = {
        title: 'New Todo',
        content: '# New content'
      };

      const result = validateCreateData(createData);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should reject empty title', () => {
      const createData = {
        title: '',
        content: '# Some content'
      };

      const result = validateCreateData(createData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Title is required');
    });

    it('should reject whitespace-only title', () => {
      const createData = {
        title: '   ',
        content: '# Some content'
      };

      const result = validateCreateData(createData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Title is required');
    });

    it('should allow empty content', () => {
      const createData = {
        title: 'Valid Title',
        content: ''
      };

      const result = validateCreateData(createData);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should validate title length', () => {
      const createData = {
        title: 'a'.repeat(256),
        content: '# Content'
      };

      const result = validateCreateData(createData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Title must be 255 characters or less');
    });

    it('should validate content length', () => {
      const createData = {
        title: 'Valid Title',
        content: '#'.repeat(10001)
      };

      const result = validateCreateData(createData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Content must be 10000 characters or less');
    });
  });

  describe('validateUpdateData', () => {
    it('should allow partial updates', () => {
      const updateData = {
        title: 'Updated Title'
      };

      const result = validateUpdateData(updateData);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should allow completion toggle only', () => {
      const updateData = {
        completed: true
      };

      const result = validateUpdateData(updateData);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should reject empty title in updates', () => {
      const updateData = {
        title: '',
        content: 'Some content'
      };

      const result = validateUpdateData(updateData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Title cannot be empty');
    });

    it('should allow empty content in updates', () => {
      const updateData = {
        content: ''
      };

      const result = validateUpdateData(updateData);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should validate title length in updates', () => {
      const updateData = {
        title: 'a'.repeat(256)
      };

      const result = validateUpdateData(updateData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Title must be 255 characters or less');
    });

    it('should validate content length in updates', () => {
      const updateData = {
        content: '#'.repeat(10001)
      };

      const result = validateUpdateData(updateData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Content must be 10000 characters or less');
    });

    it('should allow no fields to be provided', () => {
      const updateData = {};

      const result = validateUpdateData(updateData);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });
  });
});