import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import userEvent from "@testing-library/user-event";
import { TaskCreateForm } from "./TaskCreateForm";
import type { TodoCreateData } from "../lib/types";

// Mock MarkdownPreview component
vi.mock("./MarkdownPreview", () => ({
  MarkdownPreview: ({ content }: { content: string }) => {
    // Parse simple markdown for testing
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
          } else if (line.startsWith("- ")) {
            return <li key={index}>{line.substring(2)}</li>;
          } else if (line.startsWith("> ")) {
            return <blockquote key={index}>{line.substring(2)}</blockquote>;
          } else if (line.includes("[") && line.includes("](")) {
            const match = line.match(/\[([^\]]+)\]\(([^)]+)\)/);
            if (match) {
              return (
                <p key={index}>
                  <a href={match[2]}>{match[1]}</a>
                </p>
              );
            }
          }
          return line.trim() ? <p key={index}>{line}</p> : null;
        })}
        {!content.trim() && <div>No content to preview</div>}
      </div>
    );
  },
}));

// Mock handlers
const mockOnSubmit = vi.fn();
const mockOnCancel = vi.fn();

describe("TaskCreateForm Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Form Rendering and Structure", () => {
    it("renders all required form elements", () => {
      render(
        <TaskCreateForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      // Check for title input field
      expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/title/i)).toHaveAttribute("type", "text");

      // Check for content textarea
      expect(screen.getByLabelText(/content/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/content/i).tagName).toBe("TEXTAREA");

      // Check for submit button
      expect(
        screen.getByRole("button", { name: /create/i })
      ).toBeInTheDocument();

      // Check for cancel button
      expect(
        screen.getByRole("button", { name: /cancel/i })
      ).toBeInTheDocument();
    });

    it("renders with correct initial state", () => {
      render(
        <TaskCreateForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      const titleInput = screen.getByLabelText(/title/i) as HTMLInputElement;
      const contentTextarea = screen.getByLabelText(
        /content/i
      ) as HTMLTextAreaElement;
      const submitButton = screen.getByRole("button", { name: /create/i });

      expect(titleInput.value).toBe("");
      expect(contentTextarea.value).toBe("");
      expect(submitButton).toBeDisabled(); // Should be disabled when title is empty
    });

    it("applies correct CSS classes and styling", () => {
      render(
        <TaskCreateForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      const form =
        screen.getByRole("form") || screen.getByTestId("task-create-form");
      expect(form).toHaveClass("space-y-4");

      const titleInput = screen.getByLabelText(/title/i);
      expect(titleInput).toHaveClass("w-full", "px-3", "py-2", "border");

      const contentTextarea = screen.getByLabelText(/content/i);
      expect(contentTextarea).toHaveClass("w-full", "px-3", "py-2", "border");
    });

    it("displays form labels correctly", () => {
      render(
        <TaskCreateForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      expect(screen.getByText(/title/i)).toBeInTheDocument();
      expect(screen.getByText(/content/i)).toBeInTheDocument();
    });

    it("has proper accessibility attributes", () => {
      render(
        <TaskCreateForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      const titleInput = screen.getByLabelText(/title/i);
      const contentTextarea = screen.getByLabelText(/content/i);

      expect(titleInput).toHaveAttribute("required");
      expect(titleInput).toHaveAttribute("aria-describedby");

      expect(contentTextarea).toHaveAttribute("placeholder");
      expect(contentTextarea).toHaveAttribute("aria-describedby");
    });
  });

  describe("Form Input Handling", () => {
    it("updates title input value when user types", async () => {
      const user = userEvent.setup();
      render(
        <TaskCreateForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      const titleInput = screen.getByLabelText(/title/i) as HTMLInputElement;

      await user.type(titleInput, "New Task Title");

      expect(titleInput.value).toBe("New Task Title");
    });

    it("updates content textarea value when user types", async () => {
      const user = userEvent.setup();
      render(
        <TaskCreateForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      const contentTextarea = screen.getByLabelText(
        /content/i
      ) as HTMLTextAreaElement;

      await user.type(contentTextarea, "This is some **markdown** content");

      expect(contentTextarea.value).toBe("This is some **markdown** content");
    });

    it("handles rapid input correctly", async () => {
      const user = userEvent.setup();
      render(
        <TaskCreateForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      const titleInput = screen.getByLabelText(/title/i) as HTMLInputElement;

      await user.type(titleInput, "Quick");
      await user.clear(titleInput);
      await user.type(titleInput, "Updated Title");

      expect(titleInput.value).toBe("Updated Title");
    });

    it("handles multiline content input", async () => {
      const user = userEvent.setup();
      render(
        <TaskCreateForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      const contentTextarea = screen.getByLabelText(
        /content/i
      ) as HTMLTextAreaElement;
      const multilineContent = "Line 1\nLine 2\nLine 3";

      await user.click(contentTextarea);
      await user.paste(multilineContent);

      expect(contentTextarea.value).toBe(multilineContent);
    });

    it("maintains focus state correctly", async () => {
      const user = userEvent.setup();
      render(
        <TaskCreateForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      const titleInput = screen.getByLabelText(/title/i);
      const contentTextarea = screen.getByLabelText(/content/i);

      await user.click(titleInput);
      expect(titleInput).toHaveFocus();

      await user.click(contentTextarea);
      expect(contentTextarea).toHaveFocus();
    });

    it("supports markdown formatting in content field", async () => {
      const user = userEvent.setup();
      render(
        <TaskCreateForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      const contentTextarea = screen.getByLabelText(
        /content/i
      ) as HTMLTextAreaElement;
      const markdownContent =
        "# Header\n\n**Bold text** and *italic text*\n\n- List item 1\n- List item 2";

      await user.click(contentTextarea);
      await user.paste(markdownContent);

      expect(contentTextarea.value).toBe(markdownContent);
    });
  });

  describe("Form Validation", () => {
    it("shows error message when title exceeds character limit", async () => {
      const user = userEvent.setup();
      render(
        <TaskCreateForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      const titleInput = screen.getByLabelText(/title/i);
      const longTitle = "a".repeat(256); // Exceeds 255 character limit

      await user.click(titleInput);
      await user.paste(longTitle);
      // Blur to trigger touched state
      await user.click(document.body);

      await waitFor(() => {
        expect(
          screen.getByText(/title must be no more than 255 characters/i)
        ).toBeInTheDocument();
      });
    });

    it("shows error message when content exceeds character limit", async () => {
      const user = userEvent.setup();
      render(
        <TaskCreateForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      const titleInput = screen.getByLabelText(/title/i);
      const contentTextarea = screen.getByLabelText(/content/i);
      const longContent = "a".repeat(10001); // Exceeds 10000 character limit

      await user.type(titleInput, "Valid Title");
      await user.click(contentTextarea);
      await user.paste(longContent);
      // Blur to trigger touched state
      await user.click(document.body);

      await waitFor(() => {
        expect(
          screen.getByText(/content must be no more than 10000 characters/i)
        ).toBeInTheDocument();
      });
    });

    it("disables submit button when form is invalid", async () => {
      const user = userEvent.setup();
      render(
        <TaskCreateForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      const submitButton = screen.getByRole("button", { name: /create/i });

      expect(submitButton).toBeDisabled();

      // Add invalid title (too long)
      const titleInput = screen.getByLabelText(/title/i);
      await user.click(titleInput);
      await user.paste("a".repeat(256));

      expect(submitButton).toBeDisabled();
    });

    it("enables submit button when form is valid", async () => {
      const user = userEvent.setup();
      render(
        <TaskCreateForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      const titleInput = screen.getByLabelText(/title/i);
      const submitButton = screen.getByRole("button", { name: /create/i });

      await user.type(titleInput, "Valid Title");

      expect(submitButton).toBeEnabled();
    });

    it("clears validation errors when input becomes valid", async () => {
      const user = userEvent.setup();
      render(
        <TaskCreateForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      const contentTextarea = screen.getByLabelText(/content/i);
      const longContent = "a".repeat(10001); // Exceeds 10000 character limit

      // Enter long content that exceeds limit
      await user.click(contentTextarea);
      await user.paste(longContent);
      // Blur to trigger touched state
      await user.click(document.body);

      // Wait for error message to appear
      await waitFor(() => {
        expect(
          screen.getByText(/content must be no more than 10000 characters/i)
        ).toBeInTheDocument();
      });

      // Clear content and enter valid content
      await user.clear(contentTextarea);
      await user.type(contentTextarea, "Valid content");

      // Wait for error message to disappear
      await waitFor(() => {
        expect(
          screen.queryByText(/content must be no more than 10000 characters/i)
        ).not.toBeInTheDocument();
      });
    });

    it("validates title in real-time", async () => {
      const user = userEvent.setup();
      render(
        <TaskCreateForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      const titleInput = screen.getByLabelText(/title/i);

      // Type a long title
      await user.click(titleInput);
      await user.paste("a".repeat(256));
      // Blur to trigger touched state
      await user.click(document.body);

      await waitFor(() => {
        expect(
          screen.getByText(/title must be no more than 255 characters/i)
        ).toBeInTheDocument();
      });

      // Clear and type valid title
      await user.clear(titleInput);
      await user.type(titleInput, "Valid Title");

      await waitFor(() => {
        expect(
          screen.queryByText(/title must be no more than 255 characters/i)
        ).not.toBeInTheDocument();
      });
    });

    it("validates content in real-time", async () => {
      const user = userEvent.setup();
      render(
        <TaskCreateForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      const contentTextarea = screen.getByLabelText(/content/i);

      // Type content that exceeds limit
      await user.click(contentTextarea);
      await user.paste("a".repeat(10001));
      // Blur to trigger touched state
      await user.click(document.body);

      await waitFor(() => {
        expect(
          screen.getByText(/content must be no more than 10000 characters/i)
        ).toBeInTheDocument();
      });

      // Clear and type valid content
      await user.clear(contentTextarea);
      await user.type(contentTextarea, "Valid content");

      await waitFor(() => {
        expect(
          screen.queryByText(/content must be no more than 10000 characters/i)
        ).not.toBeInTheDocument();
      });
    });
  });

  describe("Form Submission", () => {
    it("calls onSubmit with correct data when form is valid", async () => {
      const user = userEvent.setup();
      render(
        <TaskCreateForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      const titleInput = screen.getByLabelText(/title/i);
      const contentTextarea = screen.getByLabelText(/content/i);
      const submitButton = screen.getByRole("button", { name: /create/i });

      await user.type(titleInput, "Test Task Title");
      await user.type(contentTextarea, "Test task content with **markdown**");
      await user.click(submitButton);

      expect(mockOnSubmit).toHaveBeenCalledWith({
        title: "Test Task Title",
        content: "Test task content with **markdown**",
      } as TodoCreateData);
    });

    it("does not call onSubmit when form is invalid", async () => {
      const user = userEvent.setup();
      render(
        <TaskCreateForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      const submitButton = screen.getByRole("button", { name: /create/i });

      await user.click(submitButton);

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it("shows loading state during submission", async () => {
      const user = userEvent.setup();
      mockOnSubmit.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      render(
        <TaskCreateForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      const titleInput = screen.getByLabelText(/title/i);
      const submitButton = screen.getByRole("button", { name: /create/i });

      await user.type(titleInput, "Test Title");
      await user.click(submitButton);

      expect(screen.getByText(/creating/i)).toBeInTheDocument();
      expect(submitButton).toBeDisabled();

      await waitFor(() => {
        expect(screen.queryByText(/creating/i)).not.toBeInTheDocument();
      });
    });

    it("handles submission errors gracefully", async () => {
      const user = userEvent.setup();
      mockOnSubmit.mockRejectedValue(new Error("Submission failed"));

      render(
        <TaskCreateForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      const titleInput = screen.getByLabelText(/title/i);
      const submitButton = screen.getByRole("button", { name: /create/i });

      await user.type(titleInput, "Test Title");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/submission failed/i)).toBeInTheDocument();
      });
    });

    it("resets form state after successful submission", async () => {
      const user = userEvent.setup();
      mockOnSubmit.mockResolvedValue({ success: true });

      render(
        <TaskCreateForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      const titleInput = screen.getByLabelText(/title/i) as HTMLInputElement;
      const contentTextarea = screen.getByLabelText(
        /content/i
      ) as HTMLTextAreaElement;
      const submitButton = screen.getByRole("button", { name: /create/i });

      await user.type(titleInput, "Test Title");
      await user.type(contentTextarea, "Test content");
      await user.click(submitButton);

      await waitFor(() => {
        expect(titleInput.value).toBe("");
        expect(contentTextarea.value).toBe("");
      });
    });

    it("supports form submission via Enter key in title field", async () => {
      const user = userEvent.setup();
      render(
        <TaskCreateForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      const titleInput = screen.getByLabelText(/title/i);

      await user.type(titleInput, "Test Title");
      await user.keyboard("{Enter}");

      expect(mockOnSubmit).toHaveBeenCalledWith({
        title: "Test Title",
        content: "",
      } as TodoCreateData);
    });

    it("prevents default form submission behavior", async () => {
      const user = userEvent.setup();
      render(
        <TaskCreateForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      const form =
        screen.getByRole("form") || screen.getByTestId("task-create-form");
      const titleInput = screen.getByLabelText(/title/i);

      await user.type(titleInput, "Test Title");

      const submitEvent = new Event("submit", {
        bubbles: true,
        cancelable: true,
      });
      const preventDefaultSpy = vi.spyOn(submitEvent, "preventDefault");

      form.dispatchEvent(submitEvent);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });
  });

  describe("Form Actions", () => {
    it("calls onCancel when cancel button is clicked", async () => {
      const user = userEvent.setup();
      render(
        <TaskCreateForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      const cancelButton = screen.getByRole("button", { name: /cancel/i });

      await user.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalled();
    });

    it("does not call onSubmit when cancel button is clicked", async () => {
      const user = userEvent.setup();
      render(
        <TaskCreateForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      const titleInput = screen.getByLabelText(/title/i);
      const cancelButton = screen.getByRole("button", { name: /cancel/i });

      await user.type(titleInput, "Test Title");
      await user.click(cancelButton);

      expect(mockOnSubmit).not.toHaveBeenCalled();
      expect(mockOnCancel).toHaveBeenCalled();
    });

    it("shows confirmation dialog when canceling with unsaved changes", async () => {
      const user = userEvent.setup();
      render(
        <TaskCreateForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      const titleInput = screen.getByLabelText(/title/i);
      const cancelButton = screen.getByRole("button", { name: /cancel/i });

      await user.type(titleInput, "Test Title");
      await user.click(cancelButton);

      expect(screen.getByText(/unsaved changes/i)).toBeInTheDocument();
    });
  });

  describe("Markdown Preview", () => {
    it("shows preview tab when content is entered", async () => {
      const user = userEvent.setup();
      render(
        <TaskCreateForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      const contentTextarea = screen.getByLabelText(/content/i);

      // Preview tab should not be visible initially
      expect(
        screen.queryByRole("tab", { name: /preview/i })
      ).not.toBeInTheDocument();

      // Enter content
      await user.click(contentTextarea);
      await user.type(contentTextarea, "# Hello World");

      // Wait for preview tab to appear
      await waitFor(() => {
        expect(
          screen.getByRole("tab", { name: /preview/i })
        ).toBeInTheDocument();
      });
    });

    it("toggles between edit and preview modes", async () => {
      const user = userEvent.setup();
      render(
        <TaskCreateForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      const contentTextarea = screen.getByLabelText(/content/i);
      await user.click(contentTextarea);
      await user.type(contentTextarea, "# Hello World\n\n**Bold text**");

      // Wait for preview tab to appear
      await waitFor(() => {
        expect(
          screen.getByRole("tab", { name: /preview/i })
        ).toBeInTheDocument();
      });

      // Click preview tab
      // Wait for preview tab to appear
      await waitFor(() => {
        expect(
          screen.getByRole("tab", { name: /preview/i })
        ).toBeInTheDocument();
      });

      const previewTab = screen.getByRole("tab", { name: /preview/i });
      await user.click(previewTab);

      // Wait for preview content to be visible
      await waitFor(() => {
        expect(
          screen.getByRole("heading", { level: 1, name: "Hello World" })
        ).toBeInTheDocument();
        expect(screen.getByText("Bold text")).toBeInTheDocument();
      });

      // Textarea should be hidden
      expect(contentTextarea).not.toBeVisible();

      // Click edit tab
      const editTab = screen.getByRole("tab", { name: /edit/i });
      await user.click(editTab);

      // Textarea should be visible again
      await waitFor(() => {
        expect(contentTextarea).toBeVisible();
      });
    });

    it("maintains cursor position when switching between edit and preview", async () => {
      const user = userEvent.setup();
      render(
        <TaskCreateForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      const contentTextarea = screen.getByLabelText(
        /content/i
      ) as HTMLTextAreaElement;
      await user.click(contentTextarea);
      await user.type(contentTextarea, "Hello World");

      // Set cursor position
      contentTextarea.setSelectionRange(5, 5);
      const initialPosition = contentTextarea.selectionStart;

      // Switch to preview and back
      // Wait for preview tab to appear
      await waitFor(() => {
        expect(
          screen.getByRole("tab", { name: /preview/i })
        ).toBeInTheDocument();
      });

      const previewTab = screen.getByRole("tab", { name: /preview/i });
      await user.click(previewTab);

      const editTab = screen.getByRole("tab", { name: /edit/i });
      await user.click(editTab);

      // Cursor position should be maintained
      expect(contentTextarea.selectionStart).toBe(initialPosition);
    });

    it("updates preview in real-time as user types", async () => {
      const user = userEvent.setup();
      render(
        <TaskCreateForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      const contentTextarea = screen.getByLabelText(/content/i);

      // Type initial content
      await user.click(contentTextarea);
      await user.type(contentTextarea, "# Title");

      // Switch to preview
      // Wait for preview tab to appear
      await waitFor(() => {
        expect(
          screen.getByRole("tab", { name: /preview/i })
        ).toBeInTheDocument();
      });

      const previewTab = screen.getByRole("tab", { name: /preview/i });
      await user.click(previewTab);

      expect(
        screen.getByRole("heading", { level: 1, name: "Title" })
      ).toBeInTheDocument();

      // Switch back to edit
      const editTab = screen.getByRole("tab", { name: /edit/i });
      await user.click(editTab);

      // Add more content
      await user.type(contentTextarea, "\n\nNew paragraph");

      // Switch to preview again
      await user.click(previewTab);

      expect(screen.getByText("New paragraph")).toBeInTheDocument();
    });

    it("preserves preview mode state when form is rerendered", async () => {
      const user = userEvent.setup();
      const { rerender } = render(
        <TaskCreateForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      const contentTextarea = screen.getByLabelText(/content/i);
      await user.click(contentTextarea);
      await user.type(contentTextarea, "# Hello");

      // Switch to preview
      // Wait for preview tab to appear
      await waitFor(() => {
        expect(
          screen.getByRole("tab", { name: /preview/i })
        ).toBeInTheDocument();
      });

      const previewTab = screen.getByRole("tab", { name: /preview/i });
      await user.click(previewTab);

      // Rerender component
      rerender(
        <TaskCreateForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      // Should still be in preview mode
      expect(
        screen.getByRole("heading", { level: 1, name: "Hello" })
      ).toBeInTheDocument();
      expect(contentTextarea).not.toBeVisible();
    });
  });

  describe("Accessibility", () => {
    it("provides proper ARIA labels for form elements", () => {
      render(
        <TaskCreateForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      const titleInput = screen.getByLabelText(/title/i);
      const contentTextarea = screen.getByLabelText(/content/i);

      expect(titleInput).toHaveAttribute("aria-label");
      expect(contentTextarea).toHaveAttribute("aria-label");
    });

    it("supports keyboard navigation between form elements", async () => {
      const user = userEvent.setup();
      render(
        <TaskCreateForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      const titleInput = screen.getByLabelText(/title/i);
      const contentTextarea = screen.getByLabelText(/content/i);
      const cancelButton = screen.getByRole("button", { name: /cancel/i });

      await user.tab();
      expect(titleInput).toHaveFocus();

      await user.tab();
      expect(contentTextarea).toHaveFocus();

      await user.tab();
      expect(cancelButton).toHaveFocus();
    });
  });

  describe("Integration with FormState", () => {
    it("uses TodoFormState for form management", async () => {
      const user = userEvent.setup();
      render(
        <TaskCreateForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      const titleInput = screen.getByLabelText(/title/i);
      const contentTextarea = screen.getByLabelText(/content/i);

      await user.type(titleInput, "Test Title");
      await user.type(contentTextarea, "Test Content");

      // Form state should be managed internally
      expect(titleInput).toHaveValue("Test Title");
      expect(contentTextarea).toHaveValue("Test Content");
    });

    it("provides form state information to parent component", async () => {
      const user = userEvent.setup();
      const mockOnStateChange = vi.fn();

      render(
        <TaskCreateForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          onStateChange={mockOnStateChange}
        />
      );

      const titleInput = screen.getByLabelText(/title/i);

      await user.type(titleInput, "Test");

      expect(mockOnStateChange).toHaveBeenCalled();
    });
  });
});
