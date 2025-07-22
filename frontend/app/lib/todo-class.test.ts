import { describe, it, expect } from 'vitest';
import { Todo } from './todo-class';

// This test file tests the advanced Todo class implementation

describe('Todo Class', () => {
  describe('constructor', () => {
    it('should create Todo with all properties provided', () => {
      const data = {
        id: '018c2e65-4b7f-7000-8000-000000000001',
        title: 'Test Todo',
        content: '# Test Content\n\nThis is markdown content.',
        completed: false,
        createdAt: new Date('2025-01-17T10:00:00Z'),
        updatedAt: new Date('2025-01-17T10:00:00Z')
      };

      const todo = new Todo(data);

      expect(todo.id).toBe(data.id);
      expect(todo.title).toBe(data.title);
      expect(todo.content).toBe(data.content);
      expect(todo.completed).toBe(data.completed);
      expect(todo.createdAt).toEqual(data.createdAt);
      expect(todo.updatedAt).toEqual(data.updatedAt);
    });

    it('should create Todo with partial data and defaults', () => {
      const data = {
        title: 'Test Todo',
        content: '# Test Content'
      };

      const todo = new Todo(data);

      expect(todo.id).toBeUndefined();
      expect(todo.title).toBe(data.title);
      expect(todo.content).toBe(data.content);
      expect(todo.completed).toBe(false);
      expect(todo.createdAt).toBeInstanceOf(Date);
      expect(todo.updatedAt).toBeInstanceOf(Date);
    });

    it('should create Todo with empty data and apply all defaults', () => {
      const todo = new Todo({});

      expect(todo.id).toBeUndefined();
      expect(todo.title).toBe('');
      expect(todo.content).toBe('');
      expect(todo.completed).toBe(false);
      expect(todo.createdAt).toBeInstanceOf(Date);
      expect(todo.updatedAt).toBeInstanceOf(Date);
    });

    it('should handle undefined/null input gracefully', () => {
      const todoWithUndefined = new Todo(undefined);
      const todoWithNull = new Todo(null);

      [todoWithUndefined, todoWithNull].forEach(todo => {
        expect(todo.title).toBe('');
        expect(todo.content).toBe('');
        expect(todo.completed).toBe(false);
        expect(todo.createdAt).toBeInstanceOf(Date);
        expect(todo.updatedAt).toBeInstanceOf(Date);
      });
    });
  });

  describe('validate method', () => {
    it('should return true for valid Todo with required title', () => {
      const todo = new Todo({
        title: 'Valid Todo',
        content: '# Some content'
      });

      expect(todo.validate()).toBe(true);
    });

    it('should return false for Todo with empty title', () => {
      const todo = new Todo({
        title: '',
        content: '# Some content'
      });

      expect(todo.validate()).toBe(false);
    });

    it('should return false for Todo with whitespace-only title', () => {
      const todo = new Todo({
        title: '   ',
        content: '# Some content'
      });

      expect(todo.validate()).toBe(false);
    });

    it('should return false for Todo with title longer than 255 characters', () => {
      const longTitle = 'a'.repeat(256);
      const todo = new Todo({
        title: longTitle,
        content: '# Some content'
      });

      expect(todo.validate()).toBe(false);
    });

    it('should return true for Todo with empty content', () => {
      const todo = new Todo({
        title: 'Valid Title',
        content: ''
      });

      expect(todo.validate()).toBe(true);
    });

    it('should return false for Todo with content longer than 10000 characters', () => {
      const longContent = 'a'.repeat(10001);
      const todo = new Todo({
        title: 'Valid Title',
        content: longContent
      });

      expect(todo.validate()).toBe(false);
    });
  });

  describe('getValidationErrors method', () => {
    it('should return empty array for valid Todo', () => {
      const todo = new Todo({
        title: 'Valid Todo',
        content: '# Valid content'
      });

      expect(todo.getValidationErrors()).toEqual([]);
    });

    it('should return appropriate errors for empty title', () => {
      const todo = new Todo({
        title: '',
        content: '# Some content'
      });

      const errors = todo.getValidationErrors();
      expect(errors).toContain('Title is required');
    });

    it('should return appropriate errors for long title', () => {
      const longTitle = 'a'.repeat(256);
      const todo = new Todo({
        title: longTitle,
        content: '# Some content'
      });

      const errors = todo.getValidationErrors();
      expect(errors).toContain('Title must be 255 characters or less');
    });

    it('should return appropriate errors for long content', () => {
      const longContent = 'a'.repeat(10001);
      const todo = new Todo({
        title: 'Valid Title',
        content: longContent
      });

      const errors = todo.getValidationErrors();
      expect(errors).toContain('Content must be 10000 characters or less');
    });

    it('should return multiple errors when multiple validations fail', () => {
      const longTitle = 'a'.repeat(256);
      const longContent = 'a'.repeat(10001);
      const todo = new Todo({
        title: longTitle,
        content: longContent
      });

      const errors = todo.getValidationErrors();
      expect(errors.length).toBeGreaterThan(1);
      expect(errors).toContain('Title must be 255 characters or less');
      expect(errors).toContain('Content must be 10000 characters or less');
    });
  });

  describe('toJSON method', () => {
    it('should serialize Todo to JSON without timestamps', () => {
      const todo = new Todo({
        id: '018c2e65-4b7f-7000-8000-000000000001',
        title: 'Test Todo',
        content: '# Test Content',
        completed: true,
        createdAt: new Date('2025-01-17T10:00:00Z'),
        updatedAt: new Date('2025-01-17T10:00:00Z')
      });

      const json = todo.toJSON();

      expect(json).toEqual({
        id: '018c2e65-4b7f-7000-8000-000000000001',
        title: 'Test Todo',
        content: '# Test Content',
        completed: true
      });

      // Ensure timestamps are not included
      expect('createdAt' in json).toBe(false);
      expect('updatedAt' in json).toBe(false);
    });

    it('should serialize Todo without id when id is undefined', () => {
      const todo = new Todo({
        title: 'Test Todo',
        content: '# Test Content',
        completed: false
      });

      const json = todo.toJSON();

      expect(json).toEqual({
        id: undefined,
        title: 'Test Todo',
        content: '# Test Content',
        completed: false
      });
    });
  });

  describe('toCreateData method', () => {
    it('should convert Todo to create data format', () => {
      const todo = new Todo({
        id: '018c2e65-4b7f-7000-8000-000000000001',
        title: 'Test Todo',
        content: '# Test Content',
        completed: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const createData = todo.toCreateData();

      expect(createData).toEqual({
        title: 'Test Todo',
        content: '# Test Content'
      });

      // Ensure other fields are not included
      expect('id' in createData).toBe(false);
      expect('completed' in createData).toBe(false);
      expect('createdAt' in createData).toBe(false);
      expect('updatedAt' in createData).toBe(false);
    });
  });

  describe('toUpdateData method', () => {
    it('should convert Todo to update data format with all fields', () => {
      const todo = new Todo({
        title: 'Updated Todo',
        content: '# Updated Content',
        completed: true
      });

      const updateData = todo.toUpdateData();

      expect(updateData).toEqual({
        title: 'Updated Todo',
        content: '# Updated Content',
        completed: true
      });
    });

    it('should include only changed fields when specified', () => {
      const todo = new Todo({
        title: 'Updated Todo',
        content: '# Original Content',
        completed: false
      });

      const updateData = todo.toUpdateData(['title', 'completed']);

      expect(updateData).toEqual({
        title: 'Updated Todo',
        completed: false
      });

      expect('content' in updateData).toBe(false);
    });
  });

  describe('clone method', () => {
    it('should create a deep copy of the Todo', () => {
      const original = new Todo({
        id: '018c2e65-4b7f-7000-8000-000000000001',
        title: 'Original Todo',
        content: '# Original Content',
        completed: false,
        createdAt: new Date('2025-01-17T10:00:00Z'),
        updatedAt: new Date('2025-01-17T10:00:00Z')
      });

      const cloned = original.clone();

      // Should have the same values
      expect(cloned.id).toBe(original.id);
      expect(cloned.title).toBe(original.title);
      expect(cloned.content).toBe(original.content);
      expect(cloned.completed).toBe(original.completed);
      expect(cloned.createdAt.getTime()).toBe(original.createdAt.getTime());
      expect(cloned.updatedAt.getTime()).toBe(original.updatedAt.getTime());

      // But should be different instances
      expect(cloned).not.toBe(original);
      expect(cloned.createdAt).not.toBe(original.createdAt);
      expect(cloned.updatedAt).not.toBe(original.updatedAt);
    });

    it('should allow modifications without affecting original', () => {
      const original = new Todo({
        title: 'Original Todo',
        content: '# Original Content'
      });

      const cloned = original.clone();
      cloned.title = 'Modified Title';
      cloned.content = '# Modified Content';

      expect(original.title).toBe('Original Todo');
      expect(original.content).toBe('# Original Content');
      expect(cloned.title).toBe('Modified Title');
      expect(cloned.content).toBe('# Modified Content');
    });
  });

  describe('equals method', () => {
    it('should return true for Todos with same content', () => {
      const todo1 = new Todo({
        id: '018c2e65-4b7f-7000-8000-000000000001',
        title: 'Same Todo',
        content: '# Same Content',
        completed: false
      });

      const todo2 = new Todo({
        id: '018c2e65-4b7f-7000-8000-000000000001',
        title: 'Same Todo',
        content: '# Same Content',
        completed: false
      });

      expect(todo1.equals(todo2)).toBe(true);
    });

    it('should return false for Todos with different content', () => {
      const todo1 = new Todo({
        id: '018c2e65-4b7f-7000-8000-000000000001',
        title: 'Different Todo',
        content: '# Different Content',
        completed: false
      });

      const todo2 = new Todo({
        id: '018c2e65-4b7f-7000-8000-000000000001',
        title: 'Same Todo',
        content: '# Same Content',
        completed: false
      });

      expect(todo1.equals(todo2)).toBe(false);
    });

    it('should ignore timestamps when comparing', () => {
      const todo1 = new Todo({
        id: '018c2e65-4b7f-7000-8000-000000000001',
        title: 'Same Todo',
        content: '# Same Content',
        completed: false,
        createdAt: new Date('2025-01-17T10:00:00Z'),
        updatedAt: new Date('2025-01-17T11:00:00Z')
      });

      const todo2 = new Todo({
        id: '018c2e65-4b7f-7000-8000-000000000001',
        title: 'Same Todo',
        content: '# Same Content',
        completed: false,
        createdAt: new Date('2025-01-17T09:00:00Z'),
        updatedAt: new Date('2025-01-17T12:00:00Z')
      });

      expect(todo1.equals(todo2)).toBe(true);
    });
  });
});

