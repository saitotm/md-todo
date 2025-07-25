import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypePrism from "rehype-prism";
import type { Components } from "react-markdown";

// Import prismjs core and language components for syntax highlighting
import "prismjs";
import "prismjs/components/prism-rust";
import "prismjs/components/prism-python";
import "prismjs/components/prism-go";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-json";
import "prismjs/components/prism-yaml";
import "prismjs/components/prism-toml";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-css";
import "prismjs/components/prism-markdown";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const components: Components = {
  h1: ({ children }) => (
    <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-200">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-lg font-medium mb-2 text-gray-700 dark:text-gray-300">
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p className="mb-4 text-gray-600 dark:text-gray-400">{children}</p>
  ),
  ul: ({ children }) => (
    <ul
      className="list-disc list-inside mb-4 text-gray-600 dark:text-gray-400"
      role="presentation"
    >
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol
      className="list-decimal list-inside mb-4 text-gray-600 dark:text-gray-400"
      role="presentation"
    >
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li className="mb-1" role="presentation">
      {children}
    </li>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-gray-300 pl-4 py-2 mb-4 italic text-gray-600 dark:border-gray-600 dark:text-gray-400">
      {children}
    </blockquote>
  ),
  code: ({ children, ...props }) => {
    const isInline = (props as { inline?: boolean }).inline;
    if (isInline) {
      return (
        <code
          className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm font-mono text-gray-800 dark:text-gray-200"
          {...props}
        >
          {children}
        </code>
      );
    }
    // For block code, just return the code element (pre will be handled by rehype-prism)
    return (
      <code className="text-sm font-mono" {...props}>
        {children}
      </code>
    );
  },
  pre: ({ children }) => (
    <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded mb-4 overflow-x-auto text-gray-800 dark:text-gray-200">
      {children}
    </pre>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      className="text-blue-600 hover:text-blue-800 underline dark:text-blue-400 dark:hover:text-blue-300"
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  ),
  strong: ({ children }) => (
    <strong className="font-bold text-gray-800 dark:text-gray-200">
      {children}
    </strong>
  ),
  em: ({ children }) => <em className="italic">{children}</em>,
  hr: () => <hr className="my-4 border-gray-300 dark:border-gray-600" />,
};

export function MarkdownRenderer({
  content,
  className = "",
}: MarkdownRendererProps) {
  // Create sanitize schema that allows Prism classes
  const sanitizeSchema = {
    ...defaultSchema,
    attributes: {
      ...defaultSchema.attributes,
      code: [
        ...(defaultSchema.attributes?.code || []),
        ['className', 'class'],
        // Allow Prism language classes
        ['className', /^language-/],
        ['className', /^token/],
      ],
      span: [
        ...(defaultSchema.attributes?.span || []),
        ['className', 'class'],
        ['className', /^token/],
      ],
    },
  };

  return (
    <div className={`prose prose-sm max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[
          [rehypeSanitize, sanitizeSchema],
          [rehypePrism, { ignoreMissing: true }]
        ]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
