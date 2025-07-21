import { describe, it, expect, vi } from 'vitest';

// This test file tests form state management implementation
// The implementation doesn't exist yet - this follows TDD approach

describe('FormState Class', () => {
  describe('constructor', () => {
    it('should initialize with default values', () => {
      const formState = new FormState();

      expect(formState.values).toEqual({});
      expect(formState.errors).toEqual({});
      expect(formState.touched).toEqual({});
      expect(formState.isSubmitting).toBe(false);
      expect(formState.isDirty).toBe(false);
      expect(formState.isValid).toBe(true);
    });

    it('should initialize with provided initial values', () => {
      const initialValues = {
        title: 'Initial Title',
        content: 'Initial Content'
      };

      const formState = new FormState(initialValues);

      expect(formState.values).toEqual(initialValues);
      expect(formState.errors).toEqual({});
      expect(formState.touched).toEqual({});
      expect(formState.isSubmitting).toBe(false);
      expect(formState.isDirty).toBe(false);
      expect(formState.isValid).toBe(true);
    });
  });

  describe('setValue method', () => {
    it('should update field value and mark as dirty', () => {
      const formState = new FormState({ title: 'Original' });

      formState.setValue('title', 'Updated Title');

      expect(formState.values.title).toBe('Updated Title');
      expect(formState.isDirty).toBe(true);
    });

    it('should update field value and mark as touched', () => {
      const formState = new FormState();

      formState.setValue('title', 'New Title');

      expect(formState.values.title).toBe('New Title');
      expect(formState.touched.title).toBe(true);
    });

    it('should trigger validation after value change', () => {
      const validator = vi.fn(() => ({ isValid: true, errors: {} }));
      const formState = new FormState({}, validator);

      formState.setValue('title', 'New Title');

      expect(validator).toHaveBeenCalledWith(formState.values);
    });

    it('should not mark as dirty if value is same as initial', () => {
      const initialValues = { title: 'Same Title' };
      const formState = new FormState(initialValues);

      formState.setValue('title', 'Same Title');

      expect(formState.isDirty).toBe(false);
    });
  });

  describe('setValues method', () => {
    it('should update multiple values at once', () => {
      const formState = new FormState();

      formState.setValues({
        title: 'New Title',
        content: 'New Content'
      });

      expect(formState.values.title).toBe('New Title');
      expect(formState.values.content).toBe('New Content');
      expect(formState.isDirty).toBe(true);
    });

    it('should mark all updated fields as touched', () => {
      const formState = new FormState();

      formState.setValues({
        title: 'New Title',
        content: 'New Content'
      });

      expect(formState.touched.title).toBe(true);
      expect(formState.touched.content).toBe(true);
    });
  });

  describe('setError method', () => {
    it('should set field error', () => {
      const formState = new FormState();

      formState.setError('title', 'Title is required');

      expect(formState.errors.title).toBe('Title is required');
      expect(formState.isValid).toBe(false);
    });

    it('should clear field error when set to null', () => {
      const formState = new FormState();
      formState.setError('title', 'Title is required');

      formState.setError('title', null);

      expect(formState.errors.title).toBeNull();
      expect(formState.isValid).toBe(true);
    });
  });

  describe('setErrors method', () => {
    it('should set multiple errors at once', () => {
      const formState = new FormState();

      formState.setErrors({
        title: 'Title is required',
        content: 'Content is too long'
      });

      expect(formState.errors.title).toBe('Title is required');
      expect(formState.errors.content).toBe('Content is too long');
      expect(formState.isValid).toBe(false);
    });

    it('should clear all errors when empty object provided', () => {
      const formState = new FormState();
      formState.setErrors({
        title: 'Title is required',
        content: 'Content is too long'
      });

      formState.setErrors({});

      expect(formState.errors).toEqual({});
      expect(formState.isValid).toBe(true);
    });
  });

  describe('setTouched method', () => {
    it('should mark field as touched', () => {
      const formState = new FormState();

      formState.setTouched('title', true);

      expect(formState.touched.title).toBe(true);
    });

    it('should mark field as untouched', () => {
      const formState = new FormState();
      formState.setTouched('title', true);

      formState.setTouched('title', false);

      expect(formState.touched.title).toBe(false);
    });
  });

  describe('validate method', () => {
    it('should validate and update errors', () => {
      const validator = vi.fn(() => ({
        isValid: false,
        errors: { title: 'Title is required' }
      }));

      const formState = new FormState({}, validator);

      const isValid = formState.validate();

      expect(validator).toHaveBeenCalledWith(formState.values);
      expect(formState.errors.title).toBe('Title is required');
      expect(isValid).toBe(false);
      expect(formState.isValid).toBe(false);
    });

    it('should return true and clear errors for valid form', () => {
      const validator = vi.fn(() => ({
        isValid: true,
        errors: {}
      }));

      const formState = new FormState({}, validator);
      formState.setError('title', 'Previous error');

      const isValid = formState.validate();

      expect(formState.errors).toEqual({});
      expect(isValid).toBe(true);
      expect(formState.isValid).toBe(true);
    });
  });

  describe('reset method', () => {
    it('should reset form to initial state', () => {
      const initialValues = { title: 'Initial' };
      const formState = new FormState(initialValues);

      formState.setValue('title', 'Changed');
      formState.setError('title', 'Some error');
      formState.setTouched('title', true);

      formState.reset();

      expect(formState.values).toEqual(initialValues);
      expect(formState.errors).toEqual({});
      expect(formState.touched).toEqual({});
      expect(formState.isDirty).toBe(false);
      expect(formState.isValid).toBe(true);
    });

    it('should reset to new values when provided', () => {
      const formState = new FormState({ title: 'Initial' });
      const newValues = { title: 'New Initial', content: 'New Content' };

      formState.setValue('title', 'Changed');
      formState.reset(newValues);

      expect(formState.values).toEqual(newValues);
      expect(formState.isDirty).toBe(false);
    });
  });

  describe('submit method', () => {
    it('should validate before submitting', async () => {
      const validator = vi.fn(() => ({
        isValid: false,
        errors: { title: 'Title is required' }
      }));
      const submitHandler = vi.fn();

      const formState = new FormState({}, validator);

      const result = await formState.submit(submitHandler);

      expect(validator).toHaveBeenCalled();
      expect(submitHandler).not.toHaveBeenCalled();
      expect(result.success).toBe(false);
      expect(result.errors).toEqual({ title: 'Title is required' });
    });

    it('should call submit handler for valid form', async () => {
      const validator = vi.fn(() => ({ isValid: true, errors: {} }));
      const submitHandler = vi.fn().mockResolvedValue({ success: true });

      const formState = new FormState({ title: 'Valid Title' }, validator);

      formState.submit(submitHandler);

      expect(formState.isSubmitting).toBe(true);
      expect(submitHandler).toHaveBeenCalledWith(formState.values);
    });

    it('should handle submission errors', async () => {
      const validator = vi.fn(() => ({ isValid: true, errors: {} }));
      const submitHandler = vi.fn().mockRejectedValue(new Error('Network error'));

      const formState = new FormState({ title: 'Valid Title' }, validator);

      const result = await formState.submit(submitHandler);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
      expect(formState.isSubmitting).toBe(false);
    });

    it('should set isSubmitting state correctly', async () => {
      const validator = vi.fn(() => ({ isValid: true, errors: {} }));
      const submitHandler = vi.fn().mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({ success: true }), 100))
      );

      const formState = new FormState({ title: 'Valid Title' }, validator);

      const submitPromise = formState.submit(submitHandler);
      
      expect(formState.isSubmitting).toBe(true);

      await submitPromise;
      
      expect(formState.isSubmitting).toBe(false);
    });
  });

  describe('getFieldProps method', () => {
    it('should return field props for input binding', () => {
      const formState = new FormState({ title: 'Test' });
      formState.setError('title', 'Required field');
      formState.setTouched('title', true);

      const props = formState.getFieldProps('title');

      expect(props.value).toBe('Test');
      expect(props.error).toBe('Required field');
      expect(props.touched).toBe(true);
      expect(typeof props.onChange).toBe('function');
      expect(typeof props.onBlur).toBe('function');
    });

    it('should handle onChange and onBlur events', () => {
      const formState = new FormState();
      const props = formState.getFieldProps('title');

      props.onChange('New Value');
      expect(formState.values.title).toBe('New Value');

      props.onBlur();
      expect(formState.touched.title).toBe(true);
    });
  });
});

describe('TodoFormState Class', () => {
  describe('constructor', () => {
    it('should initialize with empty Todo values', () => {
      const todoFormState = new TodoFormState();

      expect(todoFormState.values.title).toBe('');
      expect(todoFormState.values.content).toBe('');
      expect(todoFormState.isValid).toBe(false); // Empty title should be invalid
    });

    it('should initialize with provided Todo', () => {
      const todo = {
        id: '018c2e65-4b7f-7000-8000-000000000001',
        title: 'Test Todo',
        content: '# Test Content',
        completed: false,
        created_at: '2025-01-17T10:00:00Z',
        updated_at: '2025-01-17T10:00:00Z'
      };

      const todoFormState = new TodoFormState(todo);

      expect(todoFormState.values.title).toBe('Test Todo');
      expect(todoFormState.values.content).toBe('# Test Content');
      expect(todoFormState.isValid).toBe(true);
    });
  });

  describe('validation', () => {
    it('should validate title is required', () => {
      const todoFormState = new TodoFormState();

      todoFormState.setValue('title', '');
      
      expect(todoFormState.isValid).toBe(false);
      expect(todoFormState.errors.title).toContain('required');
    });

    it('should validate title length', () => {
      const todoFormState = new TodoFormState();
      const longTitle = 'a'.repeat(256);

      todoFormState.setValue('title', longTitle);

      expect(todoFormState.isValid).toBe(false);
      expect(todoFormState.errors.title).toContain('255 characters');
    });

    it('should validate content length', () => {
      const todoFormState = new TodoFormState();
      const longContent = 'a'.repeat(10001);

      todoFormState.setValue('title', 'Valid Title');
      todoFormState.setValue('content', longContent);

      expect(todoFormState.isValid).toBe(false);
      expect(todoFormState.errors.content).toContain('10000 characters');
    });

    it('should be valid with proper title and content', () => {
      const todoFormState = new TodoFormState();

      todoFormState.setValue('title', 'Valid Title');
      todoFormState.setValue('content', '# Valid Content');

      expect(todoFormState.isValid).toBe(true);
      expect(todoFormState.errors).toEqual({});
    });
  });

  describe('toCreateData method', () => {
    it('should convert form values to create data format', () => {
      const todoFormState = new TodoFormState();
      
      todoFormState.setValue('title', 'New Todo');
      todoFormState.setValue('content', '# New Content');

      const createData = todoFormState.toCreateData();

      expect(createData).toEqual({
        title: 'New Todo',
        content: '# New Content'
      });
    });
  });

  describe('toUpdateData method', () => {
    it('should convert form values to update data format', () => {
      const original = {
        title: 'Original Title',
        content: '# Original Content'
      };

      const todoFormState = new TodoFormState(original);
      
      todoFormState.setValue('title', 'Updated Title');
      // content remains unchanged

      const updateData = todoFormState.toUpdateData();

      expect(updateData).toEqual({
        title: 'Updated Title'
        // content should not be included since it didn't change
      });
    });

    it('should include all changed fields', () => {
      const original = {
        title: 'Original Title',
        content: '# Original Content'
      };

      const todoFormState = new TodoFormState(original);
      
      todoFormState.setValue('title', 'Updated Title');
      todoFormState.setValue('content', '# Updated Content');

      const updateData = todoFormState.toUpdateData();

      expect(updateData).toEqual({
        title: 'Updated Title',
        content: '# Updated Content'
      });
    });
  });

  describe('loadFromTodo method', () => {
    it('should load values from Todo object', () => {
      const todoFormState = new TodoFormState();
      const todo = {
        id: '018c2e65-4b7f-7000-8000-000000000001',
        title: 'Loaded Todo',
        content: '# Loaded Content',
        completed: true,
        created_at: '2025-01-17T10:00:00Z',
        updated_at: '2025-01-17T10:00:00Z'
      };

      todoFormState.loadFromTodo(todo);

      expect(todoFormState.values.title).toBe('Loaded Todo');
      expect(todoFormState.values.content).toBe('# Loaded Content');
      expect(todoFormState.isDirty).toBe(false); // Should not be dirty after loading
      expect(todoFormState.touched).toEqual({}); // Should reset touched state
    });
  });
});

// Type declarations for the classes that will be implemented
declare class FormState<T = Record<string, any>> {
  values: T;
  errors: Record<string, string | null>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isDirty: boolean;
  isValid: boolean;

  constructor(
    initialValues?: T,
    validator?: (values: T) => { isValid: boolean; errors: Record<string, string> }
  );

  setValue(field: keyof T, value: any): void;
  setValues(values: Partial<T>): void;
  setError(field: keyof T, error: string | null): void;
  setErrors(errors: Record<string, string>): void;
  setTouched(field: keyof T, touched: boolean): void;
  validate(): boolean;
  reset(newValues?: T): void;
  submit(handler: (values: T) => Promise<any>): Promise<{ success: boolean; error?: string; errors?: Record<string, string> }>;
  getFieldProps(field: keyof T): {
    value: any;
    error: string | null;
    touched: boolean;
    onChange: (value: any) => void;
    onBlur: () => void;
  };
}

declare class TodoFormState extends FormState<{
  title: string;
  content: string;
}> {
  constructor(todo?: any);
  toCreateData(): { title: string; content: string };
  toUpdateData(): { title?: string; content?: string };
  loadFromTodo(todo: any): void;
}