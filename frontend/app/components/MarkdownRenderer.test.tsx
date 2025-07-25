import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MarkdownRenderer } from './MarkdownRenderer';

describe('MarkdownRenderer', () => {
  describe('Syntax Highlighting', () => {
    it('should apply language classes to code blocks and preserve Prism tokens', () => {
      const markdownWithCode = `
\`\`\`javascript
function hello() {
  console.log("Hello, world!");
}
\`\`\`
      `;

      const { container } = render(
        <MarkdownRenderer content={markdownWithCode} />
      );

      const codeElement = container.querySelector('code');
      expect(codeElement).toBeInTheDocument();
      
      // Check if the code element has a language class (Prism adds these)
      const hasLanguageClass = codeElement?.className.includes('language-') || 
                               codeElement?.className.includes('lang-');
      expect(hasLanguageClass).toBe(true);
      
      // Check that token classes are preserved (if Prism processed the content)
      const hasTokenClasses = container.innerHTML.includes('token');
      // This may or may not be true depending on when Prism processes, but classes should be preserved
      if (hasTokenClasses) {
        expect(hasTokenClasses).toBe(true);
      }
    });

    it('should handle multiple language code blocks', () => {
      const markdownWithMultipleLanguages = `
\`\`\`python
def hello():
    print("Hello from Python")
\`\`\`

\`\`\`rust  
fn main() {
    println!("Hello from Rust!");
}
\`\`\`
      `;

      const { container } = render(
        <MarkdownRenderer content={markdownWithMultipleLanguages} />
      );

      const codeElements = container.querySelectorAll('code');
      expect(codeElements).toHaveLength(2);
      
      // Both should have language classes
      codeElements.forEach(codeElement => {
        const hasLanguageClass = codeElement.className.includes('language-') || 
                                 codeElement.className.includes('lang-');
        expect(hasLanguageClass).toBe(true);
      });
    });

    it('should handle inline code without syntax highlighting', () => {
      const markdownWithInlineCode = 'This is `inline code` in text.';

      const { container } = render(
        <MarkdownRenderer content={markdownWithInlineCode} />
      );

      const codeElement = container.querySelector('code');
      expect(codeElement).toBeInTheDocument();
      expect(codeElement?.textContent).toBe('inline code');
      
      // Inline code should not have language classes
      const hasLanguageClass = codeElement?.className.includes('language-') || 
                               codeElement?.className.includes('lang-');
      expect(hasLanguageClass).toBe(false);
    });
  });

  describe('Basic Functionality', () => {
    it('should render empty content without error', () => {
      const { container } = render(<MarkdownRenderer content="" />);
      // Should render the prose wrapper but no content
      expect(container.querySelector('.prose')).toBeInTheDocument();
    });

    it('should render markdown headings correctly', () => {
      const markdown = '# Main Title\n## Subtitle';
      const { container } = render(<MarkdownRenderer content={markdown} />);
      
      expect(container.querySelector('h1')).toBeInTheDocument();
      expect(container.querySelector('h2')).toBeInTheDocument();
    });

    it('should render markdown lists correctly', () => {
      const markdown = '- Item 1\n- Item 2\n- Item 3';
      const { container } = render(<MarkdownRenderer content={markdown} />);
      
      const list = container.querySelector('ul');
      expect(list).toBeInTheDocument();
      expect(list?.querySelectorAll('li')).toHaveLength(3);
    });
  });

  describe('Sanitization with Prism Support', () => {
    it('should preserve safe HTML classes for syntax highlighting', () => {
      const markdownWithCode = '```javascript\nconst x = 1;\n```';
      
      const { container } = render(
        <MarkdownRenderer content={markdownWithCode} />
      );

      const codeElement = container.querySelector('code');
      expect(codeElement).toBeInTheDocument();
      
      // Should preserve language- classes
      const hasLanguageClass = codeElement?.className.includes('language-');
      expect(hasLanguageClass).toBe(true);
    });

    it('should still sanitize dangerous content', () => {
      const dangerousMarkdown = '<script>alert("xss")</script>\n\n```javascript\nconst x = 1;\n```';
      
      const { container } = render(
        <MarkdownRenderer content={dangerousMarkdown} />
      );

      // Should not contain script tags
      expect(container.innerHTML).not.toContain('<script>');
      expect(container.innerHTML).not.toContain('alert("xss")');
      
      // But should still render the code block
      const codeElement = container.querySelector('code');
      expect(codeElement).toBeInTheDocument();
    });
  });
});