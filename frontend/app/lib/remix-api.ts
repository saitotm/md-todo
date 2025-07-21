import { json } from '@remix-run/node';
import type { LoaderFunctionArgs, ActionFunctionArgs } from '@remix-run/node';
import { getTodos, createTodo, updateTodo, deleteTodo, ApiError } from './api-client';
import { validateCreateData, validateUpdateData } from './types';

export async function getTodosLoader({ request }: LoaderFunctionArgs) {
  try {
    const todos = await getTodos();
    return json({ todos });
  } catch (error) {
    console.error('Error loading todos:', error);
    
    if (error instanceof ApiError) {
      return json(
        { 
          todos: [], 
          error: 'Failed to load todos. Please try again.' 
        },
        { status: error.status || 500 }
      );
    }
    
    return json(
      { 
        todos: [], 
        error: 'Failed to load todos. Please check your connection.' 
      },
      { status: 500 }
    );
  }
}

export async function createTodoAction({ request }: ActionFunctionArgs) {
  try {
    const formData = await request.formData();
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;

    // Client-side validation
    const validation = validateCreateData({ title, content });
    if (!validation.isValid) {
      const errors: Record<string, string> = {};
      validation.errors.forEach((error) => {
        if (error.includes('Title')) {
          errors.title = error;
        } else if (error.includes('Content')) {
          errors.content = error;
        }
      });
      
      return json(
        { 
          success: false, 
          errors 
        },
        { status: 400 }
      );
    }

    const newTodo = await createTodo({ title, content });
    
    return json({
      success: true,
      todo: newTodo,
      message: 'Todo created successfully!'
    });
  } catch (error) {
    console.error('Error creating todo:', error);
    
    if (error instanceof ApiError) {
      if (error.status === 400) {
        return json(
          { 
            success: false, 
            error: error.message 
          },
          { status: 400 }
        );
      }
      
      return json(
        { 
          success: false, 
          error: 'Failed to create todo. Please try again.' 
        },
        { status: error.status || 500 }
      );
    }
    
    return json(
      { 
        success: false, 
        error: 'Failed to create todo. Please check your connection.' 
      },
      { status: 500 }
    );
  }
}

export async function updateTodoAction({ request, params }: ActionFunctionArgs) {
  try {
    const { id } = params;
    if (!id) {
      return json(
        { 
          success: false, 
          error: 'Todo ID is required' 
        },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const action = formData.get('_action') as string;
    
    let updateData: any = {};
    
    if (action === 'toggle') {
      // Only update completion status
      const completed = formData.get('completed') === 'true';
      updateData = { completed };
    } else {
      // Full update
      const title = formData.get('title') as string;
      const content = formData.get('content') as string;
      const completed = formData.get('completed') === 'true';
      
      if (title !== null) updateData.title = title;
      if (content !== null) updateData.content = content;
      if (formData.has('completed')) updateData.completed = completed;
    }

    // Client-side validation
    const validation = validateUpdateData(updateData);
    if (!validation.isValid) {
      const errors: Record<string, string> = {};
      validation.errors.forEach((error) => {
        if (error.includes('Title')) {
          errors.title = error;
        } else if (error.includes('Content')) {
          errors.content = error;
        }
      });
      
      return json(
        { 
          success: false, 
          errors 
        },
        { status: 400 }
      );
    }

    const updatedTodo = await updateTodo(id, updateData);
    
    return json({
      success: true,
      todo: updatedTodo,
      ...(action !== 'toggle' && { message: 'Todo updated successfully!' })
    });
  } catch (error) {
    console.error('Error updating todo:', error);
    
    if (error instanceof ApiError) {
      return json(
        { 
          success: false, 
          error: error.message 
        },
        { status: error.status || 500 }
      );
    }
    
    return json(
      { 
        success: false, 
        error: 'Failed to update todo. Please try again.' 
      },
      { status: 500 }
    );
  }
}

export async function deleteTodoAction({ request, params }: ActionFunctionArgs) {
  try {
    const { id } = params;
    if (!id) {
      return json(
        { 
          success: false, 
          error: 'Todo ID is required' 
        },
        { status: 400 }
      );
    }

    await deleteTodo(id);
    
    return json({
      success: true,
      message: 'Todo deleted successfully!'
    });
  } catch (error) {
    console.error('Error deleting todo:', error);
    
    if (error instanceof ApiError) {
      return json(
        { 
          success: false, 
          error: error.message 
        },
        { status: error.status || 500 }
      );
    }
    
    return json(
      { 
        success: false, 
        error: 'Failed to delete todo. Please try again.' 
      },
      { status: 500 }
    );
  }
}