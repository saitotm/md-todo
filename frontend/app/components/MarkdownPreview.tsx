import { MarkdownRenderer } from './MarkdownRenderer';

interface MarkdownPreviewProps {
  content: string;
  className?: string;
}

export function MarkdownPreview({ content, className = '' }: MarkdownPreviewProps) {
  if (!content || content.trim() === '') {
    return (
      <div className={`text-gray-500 dark:text-gray-400 italic ${className}`}>
        No content to preview
      </div>
    );
  }

  return <MarkdownRenderer content={content} className={className} />;
}