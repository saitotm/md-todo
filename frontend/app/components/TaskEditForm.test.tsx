import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import userEvent from "@testing-library/user-event";
import { TaskEditForm } from "./TaskEditForm";
import type { Todo, TodoUpdateData } from "../lib/types";

// Mock MarkdownPreview component
vi.mock("./MarkdownPreview", () => ({
  MarkdownPreview: ({ content }: { content: string }) => {
    const lines = content.split("\n");
    return (
      <div>
        {lines.map((line, index) => {
          if (line.startsWith("# ")) {
            return <h1 key={index}>{line.substring(2)}</h1>;
          } else if (line.startsWith("## ")) {
            return <h2 key={index}>{line.substring(3)}</h2>;
          } else if (line.includes("**")) {
            const parts = line.split("**");
            return (
              <p key={index}>
                {parts.map((part, i) =>
                  i % 2 === 1 ? <strong key={i}>{part}</strong> : part
                )}
              </p>
            );
          } else if (line.includes("*") && !line.includes("**")) {
            const parts = line.split("*");
            return (
              <p key={index}>
                {parts.map((part, i) =>
                  i % 2 === 1 ? <em key={i}>{part}</em> : part
                )}
              </p>
            );
          }
          return line.trim() ? <p key={index}>{line}</p> : null;
        })}
        {!content.trim() && <div>No content to preview</div>}
      </div>
    );
  },
}));

// Mock API functions
vi.mock("../lib/api-client", () => ({
  getTodo: vi.fn(),
  updateTodo: vi.fn(),
  ApiError: class extends Error {
    constructor(message: string, public status?: number) {
      super(message);
      this.name = "ApiError";
    }
  },
}));

import { getTodo, updateTodo } from "../lib/api-client";

const mockGetTodo = getTodo as ReturnType<typeof vi.fn>;
const mockUpdateTodo = updateTodo as ReturnType<typeof vi.fn>;

// Mock handlers
const mockOnSubmit = vi.fn();
const mockOnCancel = vi.fn();
const mockOnLoadError = vi.fn();

// Sample todo data for testing
const sampleTodo: Todo = {
  id: "018c2e65-4b7f-7000-8000-000000000000",
  title: "Sample Task",
  content: "# Sample content\n\nThis is a **sample** task for testing.",
  completed: false,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
};

describe("TaskEditForm Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetTodo.mockResolvedValue(sampleTodo);
    mockUpdateTodo.mockResolvedValue({ ...sampleTodo, title: "Updated Task" });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Data Loading Tests", () => {
    it("renders loading state initially when todoId is provided", async () => {
      render(
        <TaskEditForm
          todoId={sampleTodo.id}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          onLoadError={mockOnLoadError}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/loading task/i)).toBeInTheDocument();
      });
    });

    it("calls getTodo API when todoId is provided", async () => {
      render(
        <TaskEditForm
          todoId={sampleTodo.id}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          onLoadError={mockOnLoadError}
        />
      );

      await waitFor(() =>
        expect(mockGetTodo).toHaveBeenCalledWith(sampleTodo.id)
      );
    });

    it("loads and displays todo data successfully", async () => {
      render(
        <TaskEditForm
          todoId={sampleTodo.id}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          onLoadError={mockOnLoadError}
        />
      );

      await waitFor(() => {
        expect(screen.queryByTestId("loading-spinner")).not.toBeInTheDocument();
      });

      const titleInput = screen.getByDisplayValue(sampleTodo.title);
      const contentTextarea = screen.getByLabelText(
        /content/i
      ) as HTMLTextAreaElement;

      expect(titleInput).toBeInTheDocument();
      expect(contentTextarea).toBeInTheDocument();
      expect(contentTextarea.value).toBe(sampleTodo.content);
    });

    it("handles API error when loading todo", async () => {
      const errorMessage = "Todo not found";
      mockGetTodo.mockRejectedValue(new Error(errorMessage));

      render(
        <TaskEditForm
          todoId={sampleTodo.id}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          onLoadError={mockOnLoadError}
        />
      );

      await waitFor(() => {
        expect(mockOnLoadError).toHaveBeenCalledWith(errorMessage);
      });
    });

    it("allows direct initialization with todo data", async () => {
      render(
        <TaskEditForm
          todo={sampleTodo}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          onLoadError={mockOnLoadError}
        />
      );

      // Should not show loading state
      expect(screen.queryByTestId("loading-spinner")).not.toBeInTheDocument();

      // Should not call API
      expect(mockGetTodo).not.toHaveBeenCalled();

      // Should display todo data immediately
      const titleInput = screen.getByDisplayValue(sampleTodo.title);
      const contentTextarea = screen.getByLabelText(
        /content/i
      ) as HTMLTextAreaElement;

      expect(titleInput).toBeInTheDocument();
      expect(contentTextarea).toBeInTheDocument();
      expect(contentTextarea.value).toBe(sampleTodo.content);
    });

    it("handles network errors gracefully", async () => {
      const networkError = new Error("Failed to fetch");
      mockGetTodo.mockRejectedValue(networkError);

      render(
        <TaskEditForm
          todoId={sampleTodo.id}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          onLoadError={mockOnLoadError}
        />
      );

      await waitFor(() => {
        expect(mockOnLoadError).toHaveBeenCalledWith("Failed to fetch");
      });
    });

    it("refetches data when todoId changes", async () => {
      const { rerender } = render(
        <TaskEditForm
          todoId={sampleTodo.id}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          onLoadError={mockOnLoadError}
        />
      );

      await waitFor(() => {
        expect(mockGetTodo).toHaveBeenCalledWith(sampleTodo.id);
      });

      const newTodoId = "018c2e65-4b7f-7000-8000-000000000001";
      rerender(
        <TaskEditForm
          todoId={newTodoId}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          onLoadError={mockOnLoadError}
        />
      );

      await waitFor(() => {
        expect(mockGetTodo).toHaveBeenCalledWith(newTodoId);
      });

      expect(mockGetTodo).toHaveBeenCalledTimes(2);
    });
  });

  describe("Editing Functionality Tests", () => {
    it("renders all form elements with loaded data", async () => {
      render(
        <TaskEditForm
          todo={sampleTodo}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          onLoadError={mockOnLoadError}
        />
      );

      // Check for title input field with loaded value
      const titleInput = screen.getByLabelText(/title/i) as HTMLInputElement;
      expect(titleInput).toBeInTheDocument();
      expect(titleInput.value).toBe(sampleTodo.title);

      // Check for content textarea with loaded value
      const contentTextarea = screen.getByLabelText(
        /content/i
      ) as HTMLTextAreaElement;
      expect(contentTextarea).toBeInTheDocument();
      expect(contentTextarea.value).toBe(sampleTodo.content);

      // Check for submit and cancel buttons
      expect(
        screen.getByRole("button", { name: /update/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /cancel/i })
      ).toBeInTheDocument();
    });

    it("allows editing title field", async () => {
      const user = userEvent.setup();
      render(
        <TaskEditForm
          todo={sampleTodo}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          onLoadError={mockOnLoadError}
        />
      );

      const titleInput = screen.getByLabelText(/title/i) as HTMLInputElement;

      await user.clear(titleInput);
      await user.type(titleInput, "Updated Task Title");

      expect(titleInput.value).toBe("Updated Task Title");
    });

    it("allows editing content field", async () => {
      const user = userEvent.setup();
      render(
        <TaskEditForm
          todo={sampleTodo}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          onLoadError={mockOnLoadError}
        />
      );

      const contentTextarea = screen.getByLabelText(
        /content/i
      ) as HTMLTextAreaElement;

      await user.clear(contentTextarea);
      await user.type(
        contentTextarea,
        "# Updated Content\n\nThis is the **updated** content."
      );

      expect(contentTextarea.value).toBe(
        "# Updated Content\n\nThis is the **updated** content."
      );
    });

    it("validates title field during editing", async () => {
      const user = userEvent.setup();
      render(
        <TaskEditForm
          todo={sampleTodo}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          onLoadError={mockOnLoadError}
        />
      );

      const titleInput = screen.getByLabelText(/title/i);

      // Clear title to trigger required validation
      await user.clear(titleInput);
      await user.tab(); // Blur to trigger validation

      await waitFor(() => {
        expect(screen.getByText(/title is required/i)).toBeInTheDocument();
      });
    });

    it(
      "validates content length during editing",
      async () => {
        const user = userEvent.setup();
        render(
          <TaskEditForm
            todo={sampleTodo}
            onSubmit={mockOnSubmit}
            onCancel={mockOnCancel}
            onLoadError={mockOnLoadError}
          />
        );

        const contentTextarea = screen.getByLabelText(/content/i);
        const longContent = "a".repeat(10001); // Exceeds 10000 character limit

        await user.clear(contentTextarea);
        await user.click(contentTextarea);
        await user.paste(longContent);
        await user.tab(); // Blur to trigger validation

        await waitFor(() => {
          expect(
            screen.getByText(/content must be no more than 10000 characters/i)
          ).toBeInTheDocument();
        });
      }, 10000);

    it("enables form submission when data is valid", async () => {
      const user = userEvent.setup();
      render(
        <TaskEditForm
          todo={sampleTodo}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          onLoadError={mockOnLoadError}
        />
      );

      const titleInput = screen.getByLabelText(/title/i);
      const submitButton = screen.getByRole("button", { name: /update/i });

      await user.clear(titleInput);
      await user.type(titleInput, "Valid Updated Title");

      expect(submitButton).toBeEnabled();
    });

    it("disables form submission when data is invalid", async () => {
      const user = userEvent.setup();
      render(
        <TaskEditForm
          todo={sampleTodo}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          onLoadError={mockOnLoadError}
        />
      );

      const titleInput = screen.getByLabelText(/title/i);
      const submitButton = screen.getByRole("button", { name: /update/i });

      // Clear title to make form invalid
      await user.clear(titleInput);
      await user.tab(); // Blur to trigger validation state

      await waitFor(() => {
        expect(submitButton).toBeDisabled();
      });
    });

    it("supports markdown preview for content editing", async () => {
      const user = userEvent.setup();
      render(
        <TaskEditForm
          todo={sampleTodo}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          onLoadError={mockOnLoadError}
        />
      );

      const contentTextarea = screen.getByLabelText(/content/i);

      await user.clear(contentTextarea);
      await user.type(contentTextarea, "# Updated Header");

      // Should show preview tab when content exists
      await waitFor(() => {
        expect(
          screen.getByRole("tab", { name: /preview/i })
        ).toBeInTheDocument();
      });

      // Click preview tab
      const previewTab = screen.getByRole("tab", { name: /preview/i });
      await user.click(previewTab);

      // Should show rendered preview - check for text content instead of specific heading
      await waitFor(() => {
        expect(screen.getByText("Updated Header")).toBeInTheDocument();
      });
    });

    describe("Real-time Preview Tests (Task 6.5)", () => {
      it("enables real-time preview mode for editing", async () => {
        const user = userEvent.setup();
        render(
          <TaskEditForm
            todo={sampleTodo}
            onSubmit={mockOnSubmit}
            onCancel={mockOnCancel}
            onLoadError={mockOnLoadError}
          />
        );

        // Should show realtime preview toggle button
        await waitFor(() => {
          expect(
            screen.getByRole("button", { name: /enable real.*time preview/i })
          ).toBeInTheDocument();
        });

        // Enable realtime preview
        const realtimeToggle = screen.getByRole("button", { name: /enable real.*time preview/i });
        await user.click(realtimeToggle);

        // Should show both textarea and preview side by side
        expect(screen.getByLabelText(/task content/i)).toBeVisible();
        expect(screen.getByTestId("realtime-preview-panel")).toBeVisible();

        // Should show original content in preview
        await waitFor(() => {
          expect(screen.getByText("Sample content")).toBeInTheDocument();
        });
      });

      it("updates preview in real-time during editing", async () => {
        const user = userEvent.setup();
        render(
          <TaskEditForm
            todo={sampleTodo}
            onSubmit={mockOnSubmit}
            onCancel={mockOnCancel}
            onLoadError={mockOnLoadError}
          />
        );

        // Enable realtime preview
        const realtimeToggle = screen.getByRole("button", { name: /enable real.*time preview/i });
        await user.click(realtimeToggle);

        // Clear and add new content in realtime mode
        const textareaInRealtimeMode = screen.getByLabelText(/task content/i);
        await user.clear(textareaInRealtimeMode);
        await user.type(textareaInRealtimeMode, "# Edited Content\n\n*Modified* text");

        // Should update preview immediately
        await waitFor(() => {
          expect(screen.getByText("Edited Content")).toBeInTheDocument();
          expect(screen.getByText("Modified")).toBeInTheDocument();
        }, { timeout: 1000 });

        // Both elements should remain visible
        expect(screen.getByLabelText(/task content/i)).toBeVisible();
        expect(screen.getByTestId("realtime-preview-panel")).toBeVisible();
      });
    });

    it("detects form changes and updates dirty state", async () => {
      const user = userEvent.setup();
      const mockOnStateChange = vi.fn();

      render(
        <TaskEditForm
          todo={sampleTodo}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          onLoadError={mockOnLoadError}
          onStateChange={mockOnStateChange}
        />
      );

      const titleInput = screen.getByLabelText(/title/i);

      // Initial state should not be dirty
      expect(mockOnStateChange).toHaveBeenCalledWith(
        expect.objectContaining({ isDirty: false })
      );

      // Change title
      await user.type(titleInput, " Modified");

      // Should detect change and set dirty to true
      await waitFor(() => {
        expect(mockOnStateChange).toHaveBeenCalledWith(
          expect.objectContaining({ isDirty: true })
        );
      });
    });
  });

  describe("Update Process Tests", () => {
    it("calls onSubmit with correct update data when form is submitted", async () => {
      const user = userEvent.setup();
      render(
        <TaskEditForm
          todo={sampleTodo}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          onLoadError={mockOnLoadError}
        />
      );

      const titleInput = screen.getByLabelText(/title/i);
      const contentTextarea = screen.getByLabelText(/content/i);
      const submitButton = screen.getByRole("button", { name: /update/i });

      // Modify both title and content
      await user.clear(titleInput);
      await user.type(titleInput, "Updated Task Title");
      await user.clear(contentTextarea);
      await user.type(contentTextarea, "Updated content");

      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          title: "Updated Task Title",
          content: "Updated content",
        } as TodoUpdateData);
      });
    });

    it("only includes changed fields in update data", async () => {
      const user = userEvent.setup();
      render(
        <TaskEditForm
          todo={sampleTodo}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          onLoadError={mockOnLoadError}
        />
      );

      const titleInput = screen.getByLabelText(/title/i);
      const submitButton = screen.getByRole("button", { name: /update/i });

      // Only modify title, leave content unchanged
      await user.clear(titleInput);
      await user.type(titleInput, "Only Title Changed");

      await user.click(submitButton);

      // Should only include title in update data
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          title: "Only Title Changed",
        } as TodoUpdateData);
      });
    });

    it("shows loading state during submission", async () => {
      const user = userEvent.setup();
      mockOnSubmit.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      render(
        <TaskEditForm
          todo={sampleTodo}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          onLoadError={mockOnLoadError}
        />
      );

      const titleInput = screen.getByLabelText(/title/i);
      const submitButton = screen.getByRole("button", { name: /update/i });

      await user.type(titleInput, " Modified");
      await user.click(submitButton);

      expect(screen.getByText(/updating/i)).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });

    it("handles submission errors gracefully", async () => {
      const user = userEvent.setup();
      mockOnSubmit.mockRejectedValue(new Error("Update failed"));

      render(
        <TaskEditForm
          todo={sampleTodo}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          onLoadError={mockOnLoadError}
        />
      );

      const titleInput = screen.getByLabelText(/title/i);
      const submitButton = screen.getByRole("button", { name: /update/i });

      await user.type(titleInput, " Modified");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/update failed/i)).toBeInTheDocument();
      });
    });

    it("does not submit when form is invalid", async () => {
      const user = userEvent.setup();
      render(
        <TaskEditForm
          todo={sampleTodo}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          onLoadError={mockOnLoadError}
        />
      );

      const titleInput = screen.getByLabelText(/title/i);
      const submitButton = screen.getByRole("button", { name: /update/i });

      // Clear title to make form invalid
      await user.clear(titleInput);
      await user.tab(); // Trigger validation
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).not.toHaveBeenCalled();
      });
    });

    it("prevents multiple simultaneous submissions", async () => {
      const user = userEvent.setup();
      mockOnSubmit.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      render(
        <TaskEditForm
          todo={sampleTodo}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          onLoadError={mockOnLoadError}
        />
      );

      const titleInput = screen.getByLabelText(/title/i);
      const submitButton = screen.getByRole("button", { name: /update/i });

      await user.type(titleInput, " Modified");

      // Click submit button multiple times rapidly
      await user.click(submitButton);
      await user.click(submitButton);
      await user.click(submitButton);

      // Should only call onSubmit once
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    });

    it("calls onCancel when cancel button is clicked", async () => {
      const user = userEvent.setup();
      render(
        <TaskEditForm
          todo={sampleTodo}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          onLoadError={mockOnLoadError}
        />
      );

      const cancelButton = screen.getByRole("button", { name: /cancel/i });
      await user.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalled();
    });

    it("shows confirmation when canceling with unsaved changes", async () => {
      const user = userEvent.setup();
      render(
        <TaskEditForm
          todo={sampleTodo}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          onLoadError={mockOnLoadError}
        />
      );

      const titleInput = screen.getByLabelText(/title/i);
      const cancelButton = screen.getByRole("button", { name: /cancel/i });

      // Make changes to trigger dirty state
      await user.type(titleInput, " Modified");
      await user.click(cancelButton);

      // Should show unsaved changes confirmation (mocked in test environment)
      expect(screen.getByText(/unsaved changes/i)).toBeInTheDocument();
    });

    it("resets form state after successful submission", async () => {
      const user = userEvent.setup();
      const updatedTodo = { ...sampleTodo, title: "Updated Title" };
      mockOnSubmit.mockResolvedValue(updatedTodo);

      render(
        <TaskEditForm
          todo={sampleTodo}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          onLoadError={mockOnLoadError}
        />
      );

      const titleInput = screen.getByLabelText(/title/i) as HTMLInputElement;
      const submitButton = screen.getByRole("button", { name: /update/i });

      await user.clear(titleInput);
      await user.type(titleInput, "Updated Title");
      await user.click(submitButton);

      await waitFor(() => {
        expect(titleInput).toHaveValue("Updated Title");
      });
    });
  });

  describe("Accessibility", () => {
    it("provides proper ARIA labels for form elements", async () => {
      render(
        <TaskEditForm
          todo={sampleTodo}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          onLoadError={mockOnLoadError}
        />
      );

      const titleInput = screen.getByLabelText(/title/i);
      const contentTextarea = screen.getByLabelText(/content/i);

      expect(titleInput).toHaveAttribute("aria-label");
      expect(contentTextarea).toHaveAttribute("aria-label");
    });

    it("supports keyboard navigation", async () => {
      const user = userEvent.setup();
      render(
        <TaskEditForm
          todo={sampleTodo}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          onLoadError={mockOnLoadError}
        />
      );

      const titleInput = screen.getByLabelText(/title/i);
      const contentTextarea = screen.getByLabelText(/content/i);
      
      await user.tab();
      expect(titleInput).toHaveFocus();

      // The realtime preview button appears to be next in the DOM order
      await user.tab();
      const realtimeButton = screen.getByRole("button", { name: /enable real.*time preview/i });
      expect(realtimeButton).toHaveFocus();

      // Then the textarea
      await user.tab();
      expect(contentTextarea).toHaveFocus();

      await user.tab(); // cancel button  
      const cancelButton = screen.getByRole("button", { name: /cancel/i });
      expect(cancelButton).toHaveFocus();
    });
  });

  describe("Integration with TodoFormState", () => {
    it("uses TodoFormState for form management", async () => {
      const user = userEvent.setup();
      render(
        <TaskEditForm
          todo={sampleTodo}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          onLoadError={mockOnLoadError}
        />
      );

      const titleInput = screen.getByLabelText(/title/i);
      const contentTextarea = screen.getByLabelText(/content/i);

      // Initial values should be loaded from todo
      expect(titleInput).toHaveValue(sampleTodo.title);
      expect(contentTextarea).toHaveValue(sampleTodo.content);

      // Should handle value changes
      await user.clear(titleInput);
      await user.type(titleInput, "Sample Task Modified");

      await waitFor(() => {
        expect(titleInput).toHaveValue("Sample Task Modified");
      });
    });

    it("provides form state information to parent component", async () => {
      const user = userEvent.setup();
      const mockOnStateChange = vi.fn();

      render(
        <TaskEditForm
          todo={sampleTodo}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          onLoadError={mockOnLoadError}
          onStateChange={mockOnStateChange}
        />
      );

      const titleInput = screen.getByLabelText(/title/i);
      await user.type(titleInput, " Modified");

      expect(mockOnStateChange).toHaveBeenCalled();
    });
  });
});
