import type { Todo, TodoCreateData, TodoUpdateData } from './types';

export class FormState<T extends Record<string, unknown> = Record<string, unknown>> {
  values: T;
  errors: Record<string, string | null>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isDirty: boolean;
  isValid: boolean;
  
  protected initialValues: T;
  private validator?: (values: T) => { isValid: boolean; errors: Record<string, string> };

  constructor(
    initialValues: T = {} as T,
    validator?: (values: T) => { isValid: boolean; errors: Record<string, string> }
  ) {
    this.values = { ...initialValues };
    this.initialValues = { ...initialValues };
    this.errors = {};
    this.touched = {};
    this.isSubmitting = false;
    this.isDirty = false;
    this.isValid = true;
    this.validator = validator;

    if (validator) {
      this.validate();
    }
  }

  setValue(field: keyof T, value: unknown): void {
    this.values = { ...this.values, [field]: value };
    this.touched = { ...this.touched, [field]: true };
    
    // Check if the form is dirty
    this.updateDirtyState();
    
    // Trigger validation if validator is provided
    if (this.validator) {
      this.validate();
    }
  }

  setValues(values: Partial<T>): void {
    this.values = { ...this.values, ...values };
    
    // Mark all updated fields as touched
    const updatedTouched = { ...this.touched };
    for (const field of Object.keys(values)) {
      updatedTouched[field] = true;
    }
    this.touched = updatedTouched;
    
    this.updateDirtyState();
    
    if (this.validator) {
      this.validate();
    }
  }

  setError(field: keyof T, error: string | null): void {
    this.errors = { ...this.errors, [field]: error };
    this.updateValidState();
  }

  setErrors(errors: Record<string, string>): void {
    this.errors = { ...errors };
    this.updateValidState();
  }

  setTouched(field: keyof T, touched: boolean): void {
    this.touched = { ...this.touched, [field]: touched };
  }

  validate(): boolean {
    if (!this.validator) {
      return true;
    }

    const result = this.validator(this.values);
    this.errors = { ...result.errors };
    this.isValid = result.isValid;
    
    return result.isValid;
  }

  reset(newValues?: T): void {
    const valuesToUse = newValues || this.initialValues;
    this.values = { ...valuesToUse };
    this.initialValues = { ...valuesToUse };
    this.errors = {};
    this.touched = {};
    this.isDirty = false;
    this.isValid = true;
    this.isSubmitting = false;

    if (this.validator) {
      this.validate();
    }
  }

  async submit(handler: (values: T) => Promise<unknown>): Promise<{ 
    success: boolean; 
    error?: string; 
    errors?: Record<string, string> 
  }> {
    // Validate before submitting
    const isValid = this.validate();
    
    if (!isValid) {
      return {
        success: false,
        errors: this.errors as Record<string, string>
      };
    }

    this.isSubmitting = true;

    try {
      const result = await handler(this.values);
      this.isSubmitting = false;
      return { success: true, ...(typeof result === 'object' && result !== null ? result as Record<string, unknown> : {}) };
    } catch (error) {
      this.isSubmitting = false;
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred'
      };
    }
  }

  getFieldProps(field: keyof T): {
    value: unknown;
    error: string | null;
    touched: boolean;
    onChange: (value: unknown) => void;
    onBlur: () => void;
  } {
    return {
      value: this.values[field],
      error: this.errors[field as string] || null,
      touched: this.touched[field as string] || false,
      onChange: (value: unknown) => this.setValue(field, value),
      onBlur: () => this.setTouched(field, true),
    };
  }

  private updateDirtyState(): void {
    this.isDirty = this.isFormDirty();
  }

  private isFormDirty(): boolean {
    const initialKeys = Object.keys(this.initialValues as Record<string, unknown>);
    const currentKeys = Object.keys(this.values as Record<string, unknown>);
    
    // Check if different number of keys
    if (initialKeys.length !== currentKeys.length) {
      return true;
    }

    // Check if any value is different
    for (const key of initialKeys) {
      if (this.initialValues[key as keyof T] !== this.values[key as keyof T]) {
        return true;
      }
    }

    return false;
  }

  private updateValidState(): void {
    const hasErrors = Object.values(this.errors).some(error => error !== null && error !== undefined);
    this.isValid = !hasErrors;
  }
}

export class TodoFormState extends FormState<{
  title: string;
  content: string;
}> {
  constructor(todo?: Todo | Partial<Pick<Todo, 'title' | 'content'>>) {
    const initialValues = {
      title: todo?.title || '',
      content: todo?.content || ''
    };

    const validator = (values: { title: string; content: string }) => {
      const errors: Record<string, string> = {};

      // Title validation
      if (!values.title || values.title.trim().length === 0) {
        errors.title = 'Title is required';
      } else if (values.title.length > 255) {
        errors.title = 'Title must be no more than 255 characters long';
      }

      // Content validation
      if (values.content && values.content.length > 10000) {
        errors.content = 'Content must be no more than 10000 characters long';
      }

      return {
        isValid: Object.keys(errors).length === 0,
        errors
      };
    };

    super(initialValues, validator);
  }

  toCreateData(): TodoCreateData {
    return {
      title: this.values.title,
      content: this.values.content
    };
  }

  toUpdateData(): TodoUpdateData {
    const updateData: TodoUpdateData = {};
    
    // Only include fields that have changed
    if (this.values.title !== this.initialValues.title) {
      updateData.title = this.values.title;
    }
    
    if (this.values.content !== this.initialValues.content) {
      updateData.content = this.values.content;
    }

    return updateData;
  }

  loadFromTodo(todo: Todo): void {
    this.reset({
      title: todo.title,
      content: todo.content
    });
  }
}