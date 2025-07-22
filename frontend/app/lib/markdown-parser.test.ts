import { describe, test, expect } from 'vitest';
import { MarkdownParser } from './markdown-parser';

describe('MarkdownParser', () => {
  let parser: MarkdownParser;

  beforeEach(() => {
    parser = new MarkdownParser();
  });

  describe('Basic Markdown to HTML conversion', () => {
    test('converts plain text to paragraph', () => {
      const input = 'This is plain text';
      const expected = '<p>This is plain text</p>';
      const result = parser.toHtml(input);
      expect(result).toBe(expected);
    });

    test('converts multiple paragraphs', () => {
      const input = 'First paragraph\n\nSecond paragraph';
      const expected = '<p>First paragraph</p><p>Second paragraph</p>';
      const result = parser.toHtml(input);
      expect(result).toBe(expected);
    });

    test('handles empty input', () => {
      const input = '';
      const expected = '';
      const result = parser.toHtml(input);
      expect(result).toBe(expected);
    });

    test('handles whitespace-only input', () => {
      const input = '   \n  \t  \n  ';
      const expected = '';
      const result = parser.toHtml(input);
      expect(result).toBe(expected);
    });
  });

  describe('Headers formatting (requirement 2.3)', () => {
    test('converts h1 headers', () => {
      const input = '# Main Title';
      const expected = '<h1>Main Title</h1>';
      const result = parser.toHtml(input);
      expect(result).toBe(expected);
    });

    test('converts h2 headers', () => {
      const input = '## Subtitle';
      const expected = '<h2>Subtitle</h2>';
      const result = parser.toHtml(input);
      expect(result).toBe(expected);
    });

    test('converts h3 to h6 headers', () => {
      const inputs = [
        '### Level 3',
        '#### Level 4', 
        '##### Level 5',
        '###### Level 6'
      ];
      const expected = [
        '<h3>Level 3</h3>',
        '<h4>Level 4</h4>',
        '<h5>Level 5</h5>',
        '<h6>Level 6</h6>'
      ];
      
      inputs.forEach((input, index) => {
        const result = parser.toHtml(input);
        expect(result).toBe(expected[index]);
      });
    });

    test('handles headers with trailing whitespace', () => {
      const input = '## Title with spaces   ';
      const expected = '<h2>Title with spaces</h2>';
      const result = parser.toHtml(input);
      expect(result).toBe(expected);
    });

    test('does not convert invalid headers', () => {
      const input = '####### Too many hashes';
      const expected = '<p>####### Too many hashes</p>';
      const result = parser.toHtml(input);
      expect(result).toBe(expected);
    });
  });

  describe('Emphasis formatting (requirement 2.3)', () => {
    test('converts bold text with **', () => {
      const input = 'This is **bold** text';
      const expected = '<p>This is <strong>bold</strong> text</p>';
      const result = parser.toHtml(input);
      expect(result).toBe(expected);
    });

    test('converts bold text with __', () => {
      const input = 'This is __bold__ text';
      const expected = '<p>This is <strong>bold</strong> text</p>';
      const result = parser.toHtml(input);
      expect(result).toBe(expected);
    });

    test('converts italic text with *', () => {
      const input = 'This is *italic* text';
      const expected = '<p>This is <em>italic</em> text</p>';
      const result = parser.toHtml(input);
      expect(result).toBe(expected);
    });

    test('converts italic text with _', () => {
      const input = 'This is _italic_ text';
      const expected = '<p>This is <em>italic</em> text</p>';
      const result = parser.toHtml(input);
      expect(result).toBe(expected);
    });

    test('converts combined bold and italic', () => {
      const input = 'This is ***bold and italic*** text';
      const expected = '<p>This is <strong><em>bold and italic</em></strong> text</p>';
      const result = parser.toHtml(input);
      expect(result).toBe(expected);
    });

    test('handles nested emphasis', () => {
      const input = 'This is **bold with _italic_ inside** text';
      const expected = '<p>This is <strong>bold with <em>italic</em> inside</strong> text</p>';
      const result = parser.toHtml(input);
      expect(result).toBe(expected);
    });
  });

  describe('Links formatting (requirement 2.2)', () => {
    test('converts inline links', () => {
      const input = 'Visit [Google](https://google.com) for search';
      const expected = '<p>Visit <a href="https://google.com">Google</a> for search</p>';
      const result = parser.toHtml(input);
      expect(result).toBe(expected);
    });

    test('converts reference links', () => {
      const input = 'Visit [Google][1]\n\n[1]: https://google.com';
      const expected = '<p>Visit <a href="https://google.com">Google</a></p>';
      const result = parser.toHtml(input);
      expect(result).toBe(expected);
    });

    test('handles links with titles', () => {
      const input = 'Visit [Google](https://google.com "Search Engine")';
      const expected = '<p>Visit <a href="https://google.com" title="Search Engine">Google</a></p>';
      const result = parser.toHtml(input);
      expect(result).toBe(expected);
    });

    test('auto-links URLs', () => {
      const input = 'Visit https://google.com directly';
      const expected = '<p>Visit <a href="https://google.com">https://google.com</a> directly</p>';
      const result = parser.toHtml(input);
      expect(result).toBe(expected);
    });
  });

  describe('Code formatting (requirement 2.4)', () => {
    test('converts inline code', () => {
      const input = 'Use `console.log()` for debugging';
      const expected = '<p>Use <code>console.log()</code> for debugging</p>';
      const result = parser.toHtml(input);
      expect(result).toBe(expected);
    });

    test('converts code blocks', () => {
      const input = '```javascript\nconsole.log("Hello World");\n```';
      const expected = '<pre><code class="language-javascript">console.log("Hello World");</code></pre>';
      const result = parser.toHtml(input);
      expect(result).toBe(expected);
    });

    test('converts code blocks without language', () => {
      const input = '```\nsome code here\n```';
      const expected = '<pre><code>some code here</code></pre>';
      const result = parser.toHtml(input);
      expect(result).toBe(expected);
    });

    test('handles indented code blocks', () => {
      const input = '    const x = 1;\n    const y = 2;';
      const expected = '<pre><code>const x = 1;\nconst y = 2;</code></pre>';
      const result = parser.toHtml(input);
      expect(result).toBe(expected);
    });
  });

  describe('Lists formatting', () => {
    test('converts unordered lists', () => {
      const input = '- Item 1\n- Item 2\n- Item 3';
      const expected = '<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul>';
      const result = parser.toHtml(input);
      expect(result).toBe(expected);
    });

    test('converts ordered lists', () => {
      const input = '1. First item\n2. Second item\n3. Third item';
      const expected = '<ol><li>First item</li><li>Second item</li><li>Third item</li></ol>';
      const result = parser.toHtml(input);
      expect(result).toBe(expected);
    });

    test('handles nested lists', () => {
      const input = '- Item 1\n  - Nested item\n  - Another nested item\n- Item 2';
      const expected = '<ul><li>Item 1<ul><li>Nested item</li><li>Another nested item</li></ul></li><li>Item 2</li></ul>';
      const result = parser.toHtml(input);
      expect(result).toBe(expected);
    });
  });

  describe('Edge cases', () => {
    test('handles special characters', () => {
      const input = 'Text with & < > " characters';
      const expected = '<p>Text with &amp; &lt; &gt; &quot; characters</p>';
      const result = parser.toHtml(input);
      expect(result).toBe(expected);
    });

    test('handles malformed markdown gracefully', () => {
      const input = '**unclosed bold\n*unclosed italic\n[unclosed link';
      const expected = '<p>**unclosed bold\n*unclosed italic\n[unclosed link</p>';
      const result = parser.toHtml(input);
      expect(result).toBe(expected);
    });

    test('handles mixed line endings', () => {
      const input = 'Line 1\r\nLine 2\rLine 3\nLine 4';
      const expected = '<p>Line 1\nLine 2\nLine 3\nLine 4</p>';
      const result = parser.toHtml(input);
      expect(result).toBe(expected);
    });

    test('handles very long text', () => {
      const longText = 'A'.repeat(10000);
      const input = longText;
      const expected = `<p>${longText}</p>`;
      const result = parser.toHtml(input);
      expect(result).toBe(expected);
    });

    test('handles unicode characters', () => {
      const input = 'Unicode: 🚀 こんにちは émojis';
      const expected = '<p>Unicode: 🚀 こんにちは émojis</p>';
      const result = parser.toHtml(input);
      expect(result).toBe(expected);
    });

    test('handles complex markdown combinations', () => {
      const input = '# Header\n\nThis is **bold** and *italic* with [link](http://example.com)\n\n- List item with `code`\n- Another item\n\n```javascript\nconst x = 1;\n```';
      const expected = '<h1>Header</h1><p>This is <strong>bold</strong> and <em>italic</em> with <a href="http://example.com">link</a></p><ul><li>List item with <code>code</code></li><li>Another item</li></ul><pre><code class="language-javascript">const x = 1;</code></pre>';
      const result = parser.toHtml(input);
      expect(result).toBe(expected);
    });
  });

  describe('Security considerations', () => {
    test('sanitizes HTML input', () => {
      const input = '<script>alert("xss")</script>';
      const expected = '<p>&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;</p>';
      const result = parser.toHtml(input);
      expect(result).toBe(expected);
    });

    test('sanitizes dangerous attributes', () => {
      const input = '<img src="x" onerror="alert(1)">';
      const expected = '<p>&lt;img src=&quot;x&quot; onerror=&quot;alert(1)&quot;&gt;</p>';
      const result = parser.toHtml(input);
      expect(result).toBe(expected);
    });

    test('allows safe HTML elements when enabled', () => {
      const input = 'Some <em>emphasized</em> text';
      const expected = '<p>Some <em>emphasized</em> text</p>';
      const result = parser.toHtml(input, { allowHtml: true });
      expect(result).toBe(expected);
    });
  });

  describe('Parser configuration', () => {
    test('can disable certain features', () => {
      const input = '# Header\n**bold**';
      const expected = '<p># Header\n**bold**</p>';
      const result = parser.toHtml(input, { 
        disableHeadings: true,
        disableEmphasis: true 
      });
      expect(result).toBe(expected);
    });

    test('can configure line breaks', () => {
      const input = 'Line 1\nLine 2';
      const expected = '<p>Line 1<br>Line 2</p>';
      const result = parser.toHtml(input, { breaks: true });
      expect(result).toBe(expected);
    });
  });
});