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
<script>
  alert("XSS");
</script>
<img src="x" onerror="alert('XSS')" />
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
  allowHtml?: boolean; // Enable safe HTML elements (default: false)
  disableHeadings?: boolean; // Disable header processing (default: false)
  disableEmphasis?: boolean; // Disable bold/italic processing (default: false)
  breaks?: boolean; // Convert line breaks to <br> (default: false)
}
```

## Integration Examples

### Todo Content Rendering

```typescript
import { MarkdownParser } from "~/lib/markdown-parser";

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
import { useState, useEffect } from "react";
import { MarkdownParser } from "~/lib/markdown-parser";

function MarkdownEditor() {
  const [markdown, setMarkdown] = useState("");
  const [html, setHtml] = useState("");
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

## Related Documentation

- [API Documentation](./API.md)
- [Frontend Architecture](./FRONTEND.md)
- [Security Guidelines](./SECURITY.md)
- [Development Setup](../README.md)

---

For questions or issues related to Markdown processing, please refer to the project's GitHub issues or contact the development team.
