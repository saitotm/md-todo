# Task Creation and Editing Components Documentation

This document provides comprehensive documentation for the task creation and editing functionality in the MD-Todo application, including form components, validation rules, Markdown preview features, and user guidelines.

## Table of Contents

1. [Form Components Overview](#form-components-overview)
2. [Form State Management](#form-state-management)
3. [Validation Rules and Error Handling](#validation-rules-and-error-handling)
4. [Markdown Preview Functionality](#markdown-preview-functionality)
5. [User Input Guidelines](#user-input-guidelines)
6. [Component API Reference](#component-api-reference)
7. [Best Practices](#best-practices)

## Form Components Overview

The MD-Todo application provides two main form components for task management:

### TaskCreateForm

Located at: `frontend/app/components/TaskCreateForm.tsx`

The `TaskCreateForm` component handles the creation of new tasks with the following features:

- **Title input field** with real-time validation
- **Content textarea** with Markdown support
- **Dual preview modes**: Tab-based and real-time side-by-side
- **Form validation** with user-friendly error messages
- **Unsaved changes confirmation** when canceling
- **Accessibility support** with proper ARIA attributes

**Key Features:**

- Auto-resetting form fields on successful submission
- Keyboard navigation support (Enter to submit, Shift+Enter for new lines)
- Real-time character count validation
- Cursor position preservation when switching between edit and preview

### TaskEditForm

Located at: `frontend/app/components/TaskEditForm.tsx`

The `TaskEditForm` component handles editing existing tasks with these capabilities:

- **Data loading** from API or props
- **Dirty state detection** to track unsaved changes
- **Partial update support** (only sends changed fields)
- **Loading state management** during data fetching
- **Error handling** for load failures
- **Same preview functionality** as create form

**Key Features:**

- Loads task data automatically when provided a `todoId`
- Tracks initial values to detect changes
- Optimized updates (only changed fields sent to API)
- Loading spinner during data fetch
- Confirmation dialogs for unsaved changes

## Form State Management

The application uses a sophisticated state management system built around two core classes:

### FormState Class

Located at: `frontend/app/lib/form-state.ts`

A generic form state management class that provides:

```typescript
export class FormState<
  T extends Record<string, unknown> = Record<string, unknown>
> {
  values: T; // Current form values
  errors: Record<string, string | null>; // Field-specific errors
  touched: Record<string, boolean>; // Touched state for each field
  isSubmitting: boolean; // Submission state
  isDirty: boolean; // Whether form has unsaved changes
  isValid: boolean; // Overall validation state
}
```

**Key Methods:**

- `setValue(field, value)` - Update a single field value
- `setValues(values)` - Update multiple field values
- `validate()` - Run validation rules
- `reset(newValues?)` - Reset form to initial state
- `submit(handler)` - Handle form submission with validation
- `getFieldProps(field)` - Get props for field components

### TodoFormState Class

A specialized form state class for Todo-specific validation and data transformation:

```typescript
export class TodoFormState extends FormState<{
  title: string;
  content: string;
}> {
  toCreateData(): TodoCreateData; // Transform to create payload
  toUpdateData(): TodoUpdateData; // Transform to update payload (changed fields only)
  loadFromTodo(todo: Todo): void; // Load existing todo data
}
```

**Built-in Validation Rules:**

- Title: Required, max 255 characters
- Content: Optional, max 10,000 characters

## Validation Rules and Error Handling

### Field Validation Rules

#### Title Field

- **Required**: Title cannot be empty or whitespace-only
- **Maximum Length**: 255 characters
- **Real-time Validation**: Validates on input change and blur
- **Error Messages**:
  - Empty: "Title is required"
  - Too long: "Title must be no more than 255 characters"

#### Content Field

- **Optional**: Content can be empty
- **Maximum Length**: 10,000 characters
- **Real-time Validation**: Validates on input change
- **Error Messages**:
  - Too long: "Content must be no more than 10000 characters"

### Error Handling System

The application uses a hierarchical error handling system:

#### StateError (Base Class)

```typescript
export class StateError extends Error {
  type: string; // Error category
  field?: string; // Associated field
  code?: string; // Error code for programmatic handling
}
```

#### ValidationError

```typescript
export class ValidationError extends StateError {
  field: string; // Field that failed validation
  rule?: string; // Validation rule that failed
}
```

**Static Factory Methods:**

- `ValidationError.required(field)` - Required field error
- `ValidationError.minLength(field, min)` - Minimum length error
- `ValidationError.maxLength(field, max)` - Maximum length error
- `ValidationError.pattern(field, patternName)` - Pattern validation error

#### NetworkError

```typescript
export class NetworkError extends StateError {
  status?: number; // HTTP status code
  url?: string; // Request URL
  method?: string; // HTTP method

  isRetryable(): boolean; // Whether error can be retried
}
```

#### ErrorHandler Utility

```typescript
export class ErrorHandler {
  static handleError(error: Error): {
    type: string;
    message: string;
    field?: string;
    displayMessage: string;
    retryable?: boolean;
  };

  static formatErrorsForForm(errors: Error[]): Record<string, string>;
  static shouldShowToUser(error: Error): boolean;
  static getRetryDelay(error: Error, attempt: number): number;
}
```

### Error Display Patterns

1. **Field-level Errors**: Displayed below input fields with red text and alert role
2. **Form-level Errors**: Displayed above action buttons for submission errors
3. **Loading Errors**: Displayed when task data fails to load
4. **Network Errors**: User-friendly messages with retry suggestions

## Markdown Preview Functionality

### Preview Modes

The application supports two distinct preview modes:

#### 1. Tab Mode (Default)

- **Edit Tab**: Shows the textarea for content input
- **Preview Tab**: Shows rendered Markdown output
- **Cursor Position Preservation**: Maintains cursor position when switching tabs
- **Keyboard Navigation**: Support for tab switching with keyboard

#### 2. Real-time Mode

- **Side-by-side Layout**: Edit textarea and preview panel shown simultaneously
- **Responsive Design**: Stacks vertically on smaller screens (< 1024px)
- **Live Updates**: Preview updates as you type
- **Automatic Scroll Sync**: Maintains relative scroll position

### Preview Toggle Controls

#### Real-time Preview Button

Located in the top-right corner of the content field:

```html
<button
  type="button"
  onClick={handleRealtimePreviewToggle}
  aria-label={isRealtimePreview ? "Disable real-time preview" : "Enable real-time preview"}
>
  {isRealtimePreview ? "Disable Real-time Preview" : "Enable Real-time Preview"}
</button>
```

#### Tab Controls

Shown when real-time mode is disabled:

```html
<div className="flex space-x-2" role="tablist">
  <button role="tab" aria-selected="{!isPreviewMode}">Edit</button>
  <button role="tab" aria-selected="{isPreviewMode}">Preview</button>
</div>
```

### MarkdownPreview Component

Located at: `frontend/app/components/MarkdownPreview.tsx`

A simple wrapper component that:

- Handles empty content gracefully
- Delegates rendering to `MarkdownRenderer`
- Provides consistent styling

### Markdown Rendering Features

The preview supports:

- **Standard Markdown**: Headers, bold, italic, links, lists
- **Code Blocks**: Syntax highlighting for multiple languages
- **Security**: XSS protection through sanitization
- **Custom Styling**: Tailwind CSS classes for consistent theming

## Component API Reference

### TaskCreateForm Props

```typescript
export interface TaskCreateFormProps {
  onSubmit: (data: TodoCreateData) => void | Promise<void>;
  onCancel: () => void;
  onStateChange?: (state: TodoFormState) => void;
}
```

- `onSubmit`: Called when form is successfully submitted
- `onCancel`: Called when user clicks cancel button
- `onStateChange`: Optional callback for form state changes

### TaskEditForm Props

```typescript
export interface TaskEditFormProps {
  todoId?: string; // ID to load task data
  todo?: Todo; // Pre-loaded task data
  onSubmit: (data: TodoUpdateData) => void | Promise<void>;
  onCancel: () => void;
  onLoadError?: (error: string) => void;
  onStateChange?: (state: TodoFormState) => void;
}
```

- `todoId`: Auto-loads task data from API
- `todo`: Use pre-loaded task data instead of fetching
- `onSubmit`: Called with only changed fields
- `onCancel`: Called when user cancels editing
- `onLoadError`: Called if task loading fails
- `onStateChange`: Optional callback for form state changes

### Data Types

#### TodoCreateData

```typescript
interface TodoCreateData {
  title: string;
  content: string;
}
```

#### TodoUpdateData

```typescript
interface TodoUpdateData {
  title?: string; // Only included if changed
  content?: string; // Only included if changed
}
```

#### Todo

```typescript
interface Todo {
  id: string;
  title: string;
  content: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
}
```
