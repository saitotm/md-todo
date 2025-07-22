export class Todo {
  id?: string;
  title: string;
  content: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: Partial<{
    id?: string;
    title: string;
    content: string;
    completed: boolean;
    createdAt: Date;
    updatedAt: Date;
  }> | undefined | null = {}) {
    // Handle null/undefined input
    const validData = data || {};

    this.id = validData.id;
    this.title = validData.title || '';
    this.content = validData.content || '';
    this.completed = validData.completed || false;
    this.createdAt = validData.createdAt || new Date();
    this.updatedAt = validData.updatedAt || new Date();
  }

  validate(): boolean {
    return this.getValidationErrors().length === 0;
  }

  getValidationErrors(): string[] {
    const errors: string[] = [];

    // Title validation
    if (!this.title || this.title.trim().length === 0) {
      errors.push('Title is required');
    } else if (this.title.length > 255) {
      errors.push('Title must be 255 characters or less');
    }

    // Content validation
    if (this.content && this.content.length > 10000) {
      errors.push('Content must be 10000 characters or less');
    }

    return errors;
  }

  toJSON(): {
    id?: string;
    title: string;
    content: string;
    completed: boolean;
  } {
    const result: {
      id?: string;
      title: string;
      content: string;
      completed: boolean;
    } = {
      title: this.title,
      content: this.content,
      completed: this.completed
    };

    if (this.id) {
      result.id = this.id;
    }

    return result;
  }

  toCreateData(): {
    title: string;
    content: string;
  } {
    return {
      title: this.title,
      content: this.content
    };
  }

  toUpdateData(fields?: string[]): {
    title?: string;
    content?: string;
    completed?: boolean;
  } {
    const result: {
      title?: string;
      content?: string;
      completed?: boolean;
    } = {};

    if (!fields || fields.includes('title')) {
      result.title = this.title;
    }
    if (!fields || fields.includes('content')) {
      result.content = this.content;
    }
    if (!fields || fields.includes('completed')) {
      result.completed = this.completed;
    }

    return result;
  }

  clone(): Todo {
    return new Todo({
      id: this.id,
      title: this.title,
      content: this.content,
      completed: this.completed,
      createdAt: new Date(this.createdAt.getTime()),
      updatedAt: new Date(this.updatedAt.getTime())
    });
  }

  equals(other: Todo): boolean {
    // Compare content, ignoring timestamps and potentially id
    return (
      this.title === other.title &&
      this.content === other.content &&
      this.completed === other.completed
    );
  }
}