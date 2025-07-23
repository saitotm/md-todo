# Markdown Processing Documentation

## Overview

MD-Todo features comprehensive Markdown processing capabilities that allow users to write rich, formatted task descriptions using standard Markdown syntax. The system provides secure HTML output with syntax highlighting for code blocks and robust XSS protection.

## Technical Architecture

The Markdown processing system is built on the **unified processor ecosystem** with the following components:

- **unified** (v11.0.5): Core processor framework
- **remark-parse** (v11.0.0): Markdown AST parser  
- **remark-gfm** (v4.0.1): GitHub Flavored Markdown support
- **remark-rehype** (v11.1.2): Markdown to HTML AST transformation
- **rehype-prism** (v2.3.3): Syntax highlighting via Prism.js
- **rehype-stringify** (v10.0.1): HTML output generation

## Supported Markdown Syntax

### Headers

All six header levels are supported:

```markdown
# Header 1
## Header 2  
### Header 3
#### Header 4
##### Header 5
###### Header 6
```

### Text Formatting

#### Emphasis
- **Bold text**: `**bold**` or `__bold__` → **bold**
- *Italic text*: `*italic*` or `_italic_` → *italic*
- ***Bold and italic***: `***text***` → ***text***
- ~~Strikethrough~~: `~~text~~` → ~~text~~ (GFM extension)

#### Nested Emphasis
Complex emphasis combinations are supported:
```markdown
**Bold with *italic* inside**
*Italic with **bold** inside*
```

### Links

#### Inline Links
```markdown
[Link text](https://example.com)
[Link with title](https://example.com "Optional title")
```

#### Reference Links
```markdown
[Link text][reference]
[reference]: https://example.com "Optional title"
```

#### Automatic Links
URLs are automatically converted to links:
```markdown
https://example.com
```

### Code Elements

#### Inline Code
Use backticks for inline code: `` `console.log('Hello')` ``

#### Fenced Code Blocks
Supports language-specific syntax highlighting:

````markdown
```javascript
function greet(name) {
    console.log(`Hello, ${name}!`);
}
```
````

#### Indented Code Blocks
Four spaces or one tab creates a code block:
```markdown
    const message = "Hello, World!";
    console.log(message);
```

### Lists

#### Unordered Lists
Use `-`, `*`, or `+`:
```markdown
- Item 1
- Item 2
  - Nested item
  - Another nested item
- Item 3
```

#### Ordered Lists
Use numbers with periods:
```markdown
1. First item
2. Second item
   1. Nested numbered item
   2. Another nested item
3. Third item
```

#### Task Lists (GFM)
Create interactive checkboxes:
```markdown
- [x] Completed task
- [ ] Incomplete task
- [ ] Another task
```

### Tables (GFM)

Create tables with pipes and dashes:
```markdown
| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Cell 1   | Cell 2   | Cell 3   |
| Cell 4   | Cell 5   | Cell 6   |
```

Alignment is supported:
```markdown
| Left | Center | Right |
|:-----|:------:|------:|
| L1   |   C1   |    R1 |
| L2   |   C2   |    R2 |
```

### Blockquotes

Create blockquotes with `>`:
```markdown
> This is a blockquote.
> It can span multiple lines.
>
> And multiple paragraphs.
```

### Horizontal Rules

Create horizontal rules with three or more dashes, asterisks, or underscores:
```markdown
---
***
___
```

## Syntax Highlighting

### Supported Languages

The system supports 200+ programming languages through Prism.js integration. Here are the most commonly used languages:

#### Web Technologies
- `html` - HTML markup
- `css` - Cascading Style Sheets
- `javascript`, `js` - JavaScript
- `typescript`, `ts` - TypeScript
- `json` - JSON data format
- `jsx` - React JSX
- `tsx` - TypeScript JSX

#### Popular Programming Languages
- `python` - Python
- `java` - Java
- `c` - C programming language
- `cpp`, `c++` - C++
- `csharp`, `cs` - C#
- `rust` - Rust programming language
- `go` - Go (Golang)
- `php` - PHP
- `ruby` - Ruby
- `swift` - Swift
- `kotlin` - Kotlin
- `scala` - Scala
- `perl` - Perl
- `lua` - Lua

#### Shell and Configuration
- `bash` - Bash shell scripts
- `shell` - Generic shell
- `powershell` - PowerShell
- `yaml`, `yml` - YAML configuration
- `toml` - TOML configuration
- `ini` - INI configuration files
- `dockerfile` - Docker files

#### Database and Query Languages
- `sql` - SQL queries
- `graphql` - GraphQL
- `mongodb` - MongoDB queries

#### Markup and Documentation
- `markdown`, `md` - Markdown
- `latex` - LaTeX
- `xml` - XML markup

#### Specialized Languages
- `regex` - Regular expressions
- `diff` - Diff output
- `git` - Git commands and output
- `http` - HTTP requests/responses
- `nginx` - Nginx configuration

### Usage Examples

#### JavaScript with Syntax Highlighting
````markdown
```javascript
// Function declaration
function calculateTotal(items) {
    return items.reduce((sum, item) => sum + item.price, 0);
}

// Arrow function
const greet = (name) => `Hello, ${name}!`;

// Class definition
class TodoItem {
    constructor(title, content) {
        this.title = title;
        this.content = content;
        this.completed = false;
    }
    
    markComplete() {
        this.completed = true;
    }
}
```
````

#### Rust Code Example
````markdown
```rust
use std::collections::HashMap;

#[derive(Debug, Clone)]
pub struct Todo {
    pub id: String,
    pub title: String,
    pub content: String,
    pub completed: bool,
}

impl Todo {
    pub fn new(title: String, content: String) -> Self {
        Self {
            id: uuid::Uuid::new_v4().to_string(),
            title,
            content,
            completed: false,
        }
    }
}
```
````

#### Python Example
````markdown
```python
import datetime
from typing import List, Optional

class TodoManager:
    def __init__(self):
        self.todos: List[dict] = []
    
    def add_todo(self, title: str, content: str) -> dict:
        todo = {
            'id': len(self.todos) + 1,
            'title': title,
            'content': content,
            'completed': False,
            'created_at': datetime.datetime.now()
        }
        self.todos.append(todo)
        return todo
    
    def mark_complete(self, todo_id: int) -> bool:
        for todo in self.todos:
            if todo['id'] == todo_id:
                todo['completed'] = True
                return True
        return False
```
````

## Security Features

### XSS Protection

The Markdown processor implements comprehensive XSS (Cross-Site Scripting) protection through multiple layers:

#### HTML Sanitization
- **Dangerous HTML disabled**: `{ allowDangerousHtml: false }` configuration
- **Script tag protection**: All `<script>` tags are escaped and neutralized
- **Event handler sanitization**: HTML event handlers (`onclick`, `onerror`, `onload`, etc.) are escaped
- **JavaScript protocol protection**: `javascript:` URLs are URL-encoded and made safe

#### Protected Elements and Attributes

The following potentially dangerous elements are sanitized:

**Script Elements**:
```html
<!-- These are automatically escaped -->
<script>alert('XSS')</script>
<img src="x" onerror="alert('XSS')">
<div onclick="alert('XSS')">Click me</div>
```

**Event Handlers**:
- `onclick`, `onload`, `onerror`, `onmouseover`
- `onmouseout`, `onfocus`, `onblur`
- All other `on*` event attributes

**Dangerous Protocols**:
- `javascript:` links are neutralized
- `data:` URIs in certain contexts are sanitized
- `vbscript:` and other script protocols

#### Security Test Coverage

The system includes 50+ security tests covering:
- Script injection attempts
- Event handler injections  
- Protocol-based attacks
- Mixed case attack vectors
- Nested XSS payloads
- Unicode-based attacks
- HTML entity manipulation

### Safe HTML Elements

The following HTML elements are considered safe and preserved:

- **Text formatting**: `<strong>`, `<em>`, `<code>`, `<del>`
- **Structure**: `<p>`, `<h1>`-`<h6>`, `<ul>`, `<ol>`, `<li>`
- **Links**: `<a>` (with sanitized `href`)
- **Code blocks**: `<pre>`, `<code>` with syntax highlighting classes
- **Tables**: `<table>`, `<thead>`, `<tbody>`, `<tr>`, `<th>`, `<td>`
- **Blockquotes**: `<blockquote>`

## Configuration Options

The `MarkdownParser` class supports flexible configuration:

```typescript
interface MarkdownOptions {
  allowHtml?: boolean;        // Enable safe HTML elements (default: false)
  disableHeadings?: boolean;  // Disable header processing (default: false)
  disableEmphasis?: boolean;  // Disable bold/italic processing (default: false)
  breaks?: boolean;           // Convert line breaks to <br> (default: false)
}
```

### Usage Examples

```typescript
import { MarkdownParser } from '~/lib/markdown-parser';

// Default configuration
const parser = new MarkdownParser();
const html = parser.toHtml('**Bold text** with `code`');

// Custom configuration
const customParser = new MarkdownParser({
  allowHtml: true,
  breaks: true
});
const htmlWithBreaks = customParser.toHtml('Line 1\nLine 2');
```

## Best Practices

### For Content Authors

1. **Use semantic headers**: Start with `#` for main topics, use `##` for subsections
2. **Code formatting**: Always specify language for syntax highlighting
3. **Link titles**: Provide descriptive titles for accessibility
4. **Alt text**: Include descriptive text for images (when supported)
5. **Table headers**: Use proper table headers for accessibility

### For Developers

1. **Input validation**: Always validate Markdown input before processing
2. **Error handling**: Handle malformed Markdown gracefully
3. **Performance**: Reuse parser instances when processing multiple documents
4. **Security**: Never disable XSS protection in production
5. **Testing**: Test with various input types including edge cases

### Content Guidelines

#### Effective Task Descriptions

**Good Example**:
```markdown
## Bug Fix: Login Validation

**Problem**: Users can submit empty login forms

**Solution**:
1. Add client-side validation
2. Implement server-side checks
3. Display helpful error messages

**Code Changes**:
```javascript
function validateLogin(email, password) {
  if (!email || !password) {
    throw new Error('Email and password are required');
  }
  // Additional validation logic
}
```

**Acceptance Criteria**:
- [ ] Empty forms show validation errors
- [ ] Valid submissions proceed normally
- [ ] Error messages are user-friendly
```

#### Code Documentation

When including code examples:
- Always specify the programming language
- Include comments explaining complex logic
- Show both input and expected output when relevant
- Use meaningful variable and function names

## Error Handling

### Malformed Markdown

The parser gracefully handles malformed input:

```markdown
# Unclosed emphasis **bold text
[Broken link](incomplete-url
```

**Result**: Returns safely escaped plain text rather than breaking

### Empty or Whitespace Input

- Empty strings return empty HTML
- Whitespace-only input is normalized
- Preserves intentional whitespace in code blocks

### Unicode Support

Full Unicode support including:
- Emoji characters: 🚀 ✅ 📝
- International characters: café, naïve, Москва
- Mathematical symbols: α, β, ∑, ∆
- Special punctuation: — – " " ' '

## Integration Examples

### Todo Content Rendering

```typescript
import { MarkdownParser } from '~/lib/markdown-parser';

interface Todo {
  id: string;
  title: string;
  content: string;
  completed: boolean;
}

function renderTodoContent(todo: Todo): string {
  const parser = new MarkdownParser();
  return parser.toHtml(todo.content);
}
```

### Real-time Preview

```typescript
import { useState, useEffect } from 'react';
import { MarkdownParser } from '~/lib/markdown-parser';

function MarkdownEditor() {
  const [markdown, setMarkdown] = useState('');
  const [html, setHtml] = useState('');
  const parser = new MarkdownParser();

  useEffect(() => {
    const rendered = parser.toHtml(markdown);
    setHtml(rendered);
  }, [markdown]);

  return (
    <div className="grid grid-cols-2 gap-4">
      <textarea
        value={markdown}
        onChange={(e) => setMarkdown(e.target.value)}
        placeholder="Enter Markdown..."
        className="p-4 border rounded"
      />
      <div 
        className="p-4 border rounded prose"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
```

## Performance Considerations

### Processing Speed
- **Single-pass processing**: Efficient unified pipeline
- **Optimized parsing**: Minimal AST transformations
- **Caching**: Parser instances can be reused

### Bundle Size
- **Selective loading**: Only required Prism.js components are loaded
- **Tree shaking**: Unused unified plugins are excluded
- **Lazy loading**: Syntax highlighter loads on demand

### Memory Usage
- **Streaming friendly**: Processes content in chunks
- **AST cleanup**: Automatic memory management
- **No memory leaks**: Proper cleanup of processor instances

## Troubleshooting

### Common Issues

#### Syntax Highlighting Not Working
**Problem**: Code blocks appear without highlighting
**Solution**: Ensure language identifier is correct and supported

```markdown
<!-- Incorrect -->
```js
console.log('Hello');
```

<!-- Correct -->
```javascript  
console.log('Hello');
```
```

#### Links Not Working
**Problem**: Links don't render as clickable
**Solution**: Check URL format and encoding

```markdown
<!-- Problematic -->
[Link](example.com/path with spaces)

<!-- Correct -->
[Link](https://example.com/path%20with%20spaces)
[Link with title](https://example.com "Descriptive title")
```

#### Table Formatting Issues
**Problem**: Tables don't render correctly
**Solution**: Ensure proper pipe alignment

```markdown
<!-- Incorrect -->
|Name|Age|City|
|---|---|---|
|John|25|NYC|

<!-- Correct -->
| Name | Age | City |
|------|-----|------|
| John | 25  | NYC  |
```

### Debug Mode

For development, you can enable debug output:

```typescript
const parser = new MarkdownParser();
// Add console logging to see AST transformations
console.log(parser.toHtml('# Debug test'));
```

## Version History

- **v1.0.0**: Initial implementation with basic Markdown support
- **v1.1.0**: Added GitHub Flavored Markdown (GFM) support
- **v1.2.0**: Implemented comprehensive XSS protection
- **v1.3.0**: Added syntax highlighting with Prism.js
- **v1.4.0**: Enhanced security testing and validation

## Related Documentation

- [API Documentation](./API.md)
- [Frontend Architecture](./FRONTEND.md)
- [Security Guidelines](./SECURITY.md)
- [Development Setup](../README.md)

---

For questions or issues related to Markdown processing, please refer to the project's GitHub issues or contact the development team.