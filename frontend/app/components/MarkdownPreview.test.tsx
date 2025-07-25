import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MarkdownPreview } from './MarkdownPreview';

describe('MarkdownPreview', () => {
  describe('Empty Content Handling', () => {
    it('should render "No content to preview" message when content is empty', () => {
      const { container } = render(<MarkdownPreview content="" />);
      expect(container.textContent).toContain('No content to preview');
    });

    it('should render "No content to preview" message when content is only whitespace', () => {
      const { container } = render(<MarkdownPreview content="   " />);
      expect(container.textContent).toContain('No content to preview');
    });

    it('should apply custom className to empty content message', () => {
      const { container } = render(<MarkdownPreview content="" className="custom-class" />);
      const emptyMessage = container.querySelector('.custom-class');
      expect(emptyMessage).toBeInTheDocument();
      expect(emptyMessage?.textContent).toContain('No content to preview');
    });
  });

  describe('Content Rendering', () => {
    it('should render markdown content when provided', () => {
      const markdown = '# Hello World\n\nThis is a test.';
      const { container } = render(<MarkdownPreview content={markdown} />);
      
      expect(container.querySelector('h1')).toBeInTheDocument();
      expect(container.querySelector('p')).toBeInTheDocument();
      expect(container.textContent).toContain('Hello World');
      expect(container.textContent).toContain('This is a test.');
    });

    it('should pass className to MarkdownRenderer when content exists', () => {
      const markdown = '# Test';
      const { container } = render(<MarkdownPreview content={markdown} className="custom-class" />);
      
      const proseContainer = container.querySelector('.prose');
      expect(proseContainer).toBeInTheDocument();
      expect(proseContainer).toHaveClass('custom-class');
    });

    it('should handle code blocks with syntax highlighting', () => {
      const markdown = '```javascript\nconst x = 1;\n```';
      const { container } = render(<MarkdownPreview content={markdown} />);
      
      const codeElement = container.querySelector('code');
      expect(codeElement).toBeInTheDocument();
      
      // Should have language class for syntax highlighting
      const hasLanguageClass = codeElement?.className.includes('language-');
      expect(hasLanguageClass).toBe(true);
    });
  });
});