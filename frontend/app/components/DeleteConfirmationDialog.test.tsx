import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { DeleteConfirmationDialog } from './DeleteConfirmationDialog';
import { Todo } from '../lib/types';

// Sample test data
const createMockTodo = (overrides: Partial<Todo> = {}): Todo => ({
  id: '018c2e65-4b7f-7000-8000-000000000000',
  title: 'Sample Todo',
  content: 'This is a sample todo item',
  completed: false,
  created_at: '2025-01-17T10:00:00Z',
  updated_at: '2025-01-17T10:00:00Z',
  ...overrides
});

const mockTodo = createMockTodo({
  id: '018c2e65-4b7f-7000-8000-000000000001',
  title: 'Task to Delete',
  content: 'This task will be deleted',
  completed: false
});

// Mock handler functions
const mockOnConfirm = vi.fn();
const mockOnCancel = vi.fn();

describe('DeleteConfirmationDialog Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
    // Clean up any open modals
    document.body.style.overflow = 'unset';
  });

  describe('Confirmation Modal Display Tests', () => {
    it('renders modal when isOpen is true', () => {
      render(
        <DeleteConfirmationDialog
          isOpen={true}
          todo={mockTodo}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText(/delete task/i)).toBeInTheDocument();
    });

    it('does not render modal when isOpen is false', () => {
      render(
        <DeleteConfirmationDialog
          isOpen={false}
          todo={mockTodo}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('displays the correct task title in confirmation message', () => {
      render(
        <DeleteConfirmationDialog
          isOpen={true}
          todo={mockTodo}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByText(/task to delete/i)).toBeInTheDocument();
      expect(
        screen.getByText(/are you sure you want to delete this task/i)
      ).toBeInTheDocument();
    });

    it('displays proper modal title', () => {
      render(
        <DeleteConfirmationDialog
          isOpen={true}
          todo={mockTodo}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByText(/delete task/i)).toBeInTheDocument();
    });

    it('shows warning message about permanent deletion', () => {
      render(
        <DeleteConfirmationDialog
          isOpen={true}
          todo={mockTodo}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );

      expect(
        screen.getByText(/this action cannot be undone/i)
      ).toBeInTheDocument();
    });

    it('applies correct CSS classes for modal styling', () => {
      render(
        <DeleteConfirmationDialog
          isOpen={true}
          todo={mockTodo}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );

      const modal = screen.getByRole('dialog');
      expect(modal).toHaveClass('fixed', 'inset-0', 'z-50');
    });

    it('has proper accessibility attributes', () => {
      render(
        <DeleteConfirmationDialog
          isOpen={true}
          todo={mockTodo}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );

      const modal = screen.getByRole('dialog');
      expect(modal).toHaveAttribute('aria-modal', 'true');
      expect(modal).toHaveAttribute('aria-labelledby');
    });

    it('displays both confirm and cancel buttons', () => {
      render(
        <DeleteConfirmationDialog
          isOpen={true}
          todo={mockTodo}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );

      expect(
        screen.getByRole('button', { name: /delete/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /cancel/i })
      ).toBeInTheDocument();
    });

    it('applies danger styling to delete button', () => {
      render(
        <DeleteConfirmationDialog
          isOpen={true}
          todo={mockTodo}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      expect(deleteButton).toHaveClass('bg-red-600', 'hover:bg-red-700');
    });

    it('applies secondary styling to cancel button', () => {
      render(
        <DeleteConfirmationDialog
          isOpen={true}
          todo={mockTodo}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      expect(cancelButton).toHaveClass('bg-gray-300', 'hover:bg-gray-400');
    });

    it('handles long task titles gracefully', () => {
      const longTitleTodo = createMockTodo({
        title: 'This is a very long task title that should be handled gracefully in the confirmation dialog without breaking the layout or causing issues with text overflow and should wrap appropriately'
      });

      render(
        <DeleteConfirmationDialog
          isOpen={true}
          todo={longTitleTodo}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText(longTitleTodo.title)).toBeInTheDocument();
    });

    it('handles task titles with special characters', () => {
      const specialCharTodo = createMockTodo({
        title: 'Task with "quotes" & <special> characters'
      });

      render(
        <DeleteConfirmationDialog
          isOpen={true}
          todo={specialCharTodo}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByText(specialCharTodo.title)).toBeInTheDocument();
    });
  });

  describe('Cancel/Confirm Action Tests', () => {
    it('calls onCancel when cancel button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <DeleteConfirmationDialog
          isOpen={true}
          todo={mockTodo}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
      expect(mockOnConfirm).not.toHaveBeenCalled();
    });

    it('calls onConfirm with todo id when delete button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <DeleteConfirmationDialog
          isOpen={true}
          todo={mockTodo}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      await user.click(deleteButton);

      expect(mockOnConfirm).toHaveBeenCalledWith(mockTodo.id);
      expect(mockOnConfirm).toHaveBeenCalledTimes(1);
      expect(mockOnCancel).not.toHaveBeenCalled();
    });

    it('calls onCancel when modal backdrop is clicked', async () => {
      const user = userEvent.setup();
      render(
        <DeleteConfirmationDialog
          isOpen={true}
          todo={mockTodo}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );

      const backdrop = screen.getByRole('dialog');
      // Click on the backdrop overlay (not the modal content)
      const backdropOverlay = backdrop.querySelector('.bg-black.bg-opacity-50');
      if (backdropOverlay) {
        await user.click(backdropOverlay as Element);
      }

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
      expect(mockOnConfirm).not.toHaveBeenCalled();
    });

    it('calls onCancel when Escape key is pressed', async () => {
      const user = userEvent.setup();
      render(
        <DeleteConfirmationDialog
          isOpen={true}
          todo={mockTodo}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );

      await user.keyboard('{Escape}');

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
      expect(mockOnConfirm).not.toHaveBeenCalled();
    });

    it('calls onCancel when X close button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <DeleteConfirmationDialog
          isOpen={true}
          todo={mockTodo}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );

      const closeButtons = screen.getAllByLabelText(/close modal/i);
      // The X button is the second close button (first is backdrop)
      const xCloseButton = closeButtons[1];
      await user.click(xCloseButton);

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
      expect(mockOnConfirm).not.toHaveBeenCalled();
    });

    it('does not call handlers when modal is closed', async () => {
      const user = userEvent.setup();
      render(
        <DeleteConfirmationDialog
          isOpen={false}
          todo={mockTodo}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );

      // Try to press Escape when modal is closed
      await user.keyboard('{Escape}');

      expect(mockOnCancel).not.toHaveBeenCalled();
      expect(mockOnConfirm).not.toHaveBeenCalled();
    });

    it('prevents event propagation when modal content is clicked', async () => {
      const user = userEvent.setup();
      render(
        <DeleteConfirmationDialog
          isOpen={true}
          todo={mockTodo}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );

      const modalContent = screen.getByRole('dialog').querySelector('.bg-white');
      if (modalContent) {
        await user.click(modalContent as Element);
      }

      // Clicking on modal content should not trigger onCancel
      expect(mockOnCancel).not.toHaveBeenCalled();
      expect(mockOnConfirm).not.toHaveBeenCalled();
    });

    it('handles rapid button clicks correctly', async () => {
      const user = userEvent.setup();
      // Make onConfirm take time to complete so loading state blocks subsequent clicks
      const slowMockOnConfirm = vi.fn().mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 50))
      );
      
      render(
        <DeleteConfirmationDialog
          isOpen={true}
          todo={mockTodo}
          onConfirm={slowMockOnConfirm}
          onCancel={mockOnCancel}
        />
      );

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      
      // Click multiple times rapidly - only first should work due to loading state
      user.click(deleteButton); // Don't await this
      user.click(deleteButton); // Don't await this
      user.click(deleteButton); // Don't await this

      // Wait a bit for the first operation to complete
      await new Promise(resolve => setTimeout(resolve, 100));

      // Should only call once due to loading state preventing rapid clicks
      expect(slowMockOnConfirm).toHaveBeenCalledTimes(1);
      expect(slowMockOnConfirm).toHaveBeenCalledWith(mockTodo.id);
    });

    it('shows loading state during delete confirmation', async () => {
      const user = userEvent.setup();
      const slowOnConfirm = vi.fn().mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );

      render(
        <DeleteConfirmationDialog
          isOpen={true}
          todo={mockTodo}
          onConfirm={slowOnConfirm}
          onCancel={mockOnCancel}
        />
      );

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      await user.click(deleteButton);

      // Should show loading state
      expect(screen.getByText(/deleting/i)).toBeInTheDocument();
      expect(deleteButton).toBeDisabled();

      await waitFor(() => {
        expect(screen.queryByText(/deleting/i)).not.toBeInTheDocument();
      });
    });

    it('disables buttons during loading state', async () => {
      const user = userEvent.setup();
      const slowOnConfirm = vi.fn().mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );

      render(
        <DeleteConfirmationDialog
          isOpen={true}
          todo={mockTodo}
          onConfirm={slowOnConfirm}
          onCancel={mockOnCancel}
        />
      );

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      const cancelButton = screen.getByRole('button', { name: /cancel/i });

      await user.click(deleteButton);

      expect(deleteButton).toBeDisabled();
      expect(cancelButton).toBeDisabled();

      await waitFor(() => {
        expect(deleteButton).not.toBeDisabled();
        expect(cancelButton).not.toBeDisabled();
      });
    });
  });

  describe('Keyboard Navigation and Accessibility', () => {
    it('focuses on first focusable element (close button) by default when modal opens', () => {
      render(
        <DeleteConfirmationDialog
          isOpen={true}
          todo={mockTodo}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );

      const closeButtons = screen.getAllByLabelText(/close modal/i);
      const xCloseButton = closeButtons[1]; // X button in header
      expect(xCloseButton).toHaveFocus();
    });

    it('supports tab navigation between buttons', async () => {
      const user = userEvent.setup();
      render(
        <DeleteConfirmationDialog
          isOpen={true}
          todo={mockTodo}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      const deleteButton = screen.getByRole('button', { name: /delete/i });
      const closeButtons = screen.getAllByLabelText(/close modal/i);
      const xCloseButton = closeButtons[1]; // X button in header

      // Initial focus should be on close button
      expect(xCloseButton).toHaveFocus();

      // Tab to cancel button (due to tabIndex=1)
      await user.tab();
      expect(cancelButton).toHaveFocus();

      // Tab to delete button (due to tabIndex=2)
      await user.tab();
      expect(deleteButton).toHaveFocus();
    });

    it('supports Enter key to confirm deletion when delete button has focus', async () => {
      const user = userEvent.setup();
      render(
        <DeleteConfirmationDialog
          isOpen={true}
          todo={mockTodo}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      
      // Focus on delete button manually
      deleteButton.focus();
      expect(deleteButton).toHaveFocus();

      await user.keyboard('{Enter}');

      expect(mockOnConfirm).toHaveBeenCalledWith(mockTodo.id);
    });

    it('supports Enter key to cancel when cancel button has focus', async () => {
      const user = userEvent.setup();
      render(
        <DeleteConfirmationDialog
          isOpen={true}
          todo={mockTodo}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      cancelButton.focus();

      await user.keyboard('{Enter}');

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it('has proper ARIA labels for screen readers', () => {
      render(
        <DeleteConfirmationDialog
          isOpen={true}
          todo={mockTodo}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      const cancelButton = screen.getByRole('button', { name: /cancel/i });

      expect(deleteButton).toHaveAttribute('aria-label');
      expect(cancelButton).toHaveAttribute('aria-label');
    });

    it('modal manages focus correctly', async () => {
      const user = userEvent.setup();
      render(
        <div>
          <button>Outside Button</button>
          <DeleteConfirmationDialog
            isOpen={true}
            todo={mockTodo}
            onConfirm={mockOnConfirm}
            onCancel={mockOnCancel}
          />
        </div>
      );

      const closeButtons = screen.getAllByLabelText(/close modal/i);
      const xCloseButton = closeButtons[1]; // X button in header

      // Focus should initially be on close button
      expect(xCloseButton).toHaveFocus();

      // Test that modal buttons are all focusable and functional
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      const deleteButton = screen.getByRole('button', { name: /delete/i });
      
      // Test tab navigation works within modal
      await user.tab();
      expect(cancelButton).toHaveFocus();
      
      await user.tab();
      expect(deleteButton).toHaveFocus();
      
      // Modal dialog role should be present for screen readers
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('handles missing todo gracefully', () => {
      render(
        <DeleteConfirmationDialog
          isOpen={true}
          todo={null as any}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText(/delete task/i)).toBeInTheDocument();
    });

    it('handles undefined todo title gracefully', () => {
      const todoWithoutTitle = { ...mockTodo, title: undefined as any };

      render(
        <DeleteConfirmationDialog
          isOpen={true}
          todo={todoWithoutTitle}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('handles deletion errors gracefully', async () => {
      const user = userEvent.setup();
      const errorOnConfirm = vi.fn().mockRejectedValue(new Error('Delete failed'));

      render(
        <DeleteConfirmationDialog
          isOpen={true}
          todo={mockTodo}
          onConfirm={errorOnConfirm}
          onCancel={mockOnCancel}
        />
      );

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      await user.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByText(/error occurred/i)).toBeInTheDocument();
      });

      expect(errorOnConfirm).toHaveBeenCalledWith(mockTodo.id);
    });
  });

  describe('Modal State Management', () => {
    it('prevents body scroll when modal is open', () => {
      render(
        <DeleteConfirmationDialog
          isOpen={true}
          todo={mockTodo}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );

      expect(document.body.style.overflow).toBe('hidden');
    });

    it('restores body scroll when modal is closed', () => {
      const { rerender } = render(
        <DeleteConfirmationDialog
          isOpen={true}
          todo={mockTodo}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );

      expect(document.body.style.overflow).toBe('hidden');

      rerender(
        <DeleteConfirmationDialog
          isOpen={false}
          todo={mockTodo}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );

      expect(document.body.style.overflow).toBe('unset');
    });

    it('handles modal state changes correctly', () => {
      const { rerender } = render(
        <DeleteConfirmationDialog
          isOpen={false}
          todo={mockTodo}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

      rerender(
        <DeleteConfirmationDialog
          isOpen={true}
          todo={mockTodo}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });
});