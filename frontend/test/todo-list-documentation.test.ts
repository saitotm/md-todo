import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

const DOCS_PATH = join(__dirname, '../docs/TODO_LIST_FUNCTIONALITY.md');

describe('Todo List Functionality Documentation', () => {
  let documentContent: string;

  it('should have a documentation file', () => {
    expect(() => {
      documentContent = readFileSync(DOCS_PATH, 'utf-8');
    }).not.toThrow();
    expect(documentContent).toBeDefined();
    expect(documentContent.length).toBeGreaterThan(0);
  });

  describe('Required Sections', () => {
    beforeEach(() => {
      try {
        documentContent = readFileSync(DOCS_PATH, 'utf-8');
      } catch (error) {
        documentContent = '';
      }
    });

    it('should contain a title and overview section', () => {
      expect(documentContent).toContain('# Todo List Functionality');
      expect(documentContent).toMatch(/## Overview|## Introduction/);
    });

    it('should document the TodoList component usage', () => {
      expect(documentContent).toContain('## TodoList Component');
      expect(documentContent).toContain('### Component Props');
      expect(documentContent).toContain('TodoListProps');
      expect(documentContent).toContain('onToggle');
      expect(documentContent).toContain('onDelete');
    });

    it('should document filtering functionality', () => {
      expect(documentContent).toContain('## Filtering');
      expect(documentContent).toContain('FilterType');
      expect(documentContent).toContain("'all'");
      expect(documentContent).toContain("'completed'");
      expect(documentContent).toContain("'incomplete'");
      expect(documentContent).toContain('onFilterChange');
    });

    it('should document sorting functionality', () => {
      expect(documentContent).toContain('## Sorting');
      expect(documentContent).toContain('SortType');
      expect(documentContent).toContain("'created_at_desc'");
      expect(documentContent).toContain("'created_at_asc'");
      expect(documentContent).toContain("'title_asc'");
      expect(documentContent).toContain("'title_desc'");
      expect(documentContent).toContain("'completed'");
      expect(documentContent).toContain('onSortChange');
    });

    it('should document task completion state management', () => {
      expect(documentContent).toContain('## Task Completion');
      expect(documentContent).toContain('checkbox');
      expect(documentContent).toContain('completed');
      expect(documentContent).toContain('visual indication');
      expect(documentContent).toMatch(/line-through|strikethrough/);
      expect(documentContent).toContain('opacity');
    });

    it('should include user operation guide', () => {
      expect(documentContent).toContain('## User Guide');
      expect(documentContent).toContain('### How to');
      expect(documentContent).toContain('filter');
      expect(documentContent).toContain('sort');
      expect(documentContent).toContain('mark as complete');
      expect(documentContent).toContain('delete');
    });

    it('should document markdown rendering integration', () => {
      expect(documentContent).toContain('## Markdown');
      expect(documentContent).toContain('MarkdownParser');
      expect(documentContent).toContain('syntax highlighting');
      expect(documentContent).toContain('HTML');
    });

    it('should provide usage examples', () => {
      expect(documentContent).toContain('## Usage Examples');
      expect(documentContent).toContain('```tsx');
      expect(documentContent).toContain('<TodoList');
      expect(documentContent).toContain('todos={');
      expect(documentContent).toContain('onToggle={');
      expect(documentContent).toContain('onDelete={');
    });

    it('should document accessibility features', () => {
      expect(documentContent).toContain('## Accessibility');
      expect(documentContent).toContain('aria-label');
      expect(documentContent).toContain('keyboard');
      expect(documentContent).toContain('screen reader');
    });

    it('should document responsive design features', () => {
      expect(documentContent).toContain('## Responsive');
      expect(documentContent).toContain('mobile');
      expect(documentContent).toContain('desktop');
      expect(documentContent).toContain('breakpoint');
    });

    it('should include troubleshooting section', () => {
      expect(documentContent).toContain('## Troubleshooting');
      expect(documentContent).toContain('empty state');
      expect(documentContent).toContain('no matching');
      expect(documentContent).toContain('filter');
    });
  });

  describe('Content Quality', () => {
    beforeEach(() => {
      try {
        documentContent = readFileSync(DOCS_PATH, 'utf-8');
      } catch (error) {
        documentContent = '';
      }
    });

    it('should have proper markdown formatting', () => {
      // Check for proper heading hierarchy
      expect(documentContent).toMatch(/^#\s+/m); // H1
      expect(documentContent).toMatch(/^##\s+/m); // H2
      expect(documentContent).toMatch(/^###\s+/m); // H3
      
      // Check for code blocks
      expect(documentContent).toMatch(/```\w+/); // Language-specific code blocks
      
      // Check for proper list formatting
      expect(documentContent).toMatch(/^-\s+/m); // Unordered lists
    });

    it('should provide comprehensive code examples', () => {
      // Should have at least one complete component usage example
      const codeBlocks = documentContent.match(/```tsx[\s\S]*?```/g) || [];
      expect(codeBlocks.length).toBeGreaterThan(0);
      
      // Should demonstrate filtering usage
      expect(documentContent).toMatch(/filter.*=.*['"]all['"]|['"]all['"].*filter/);
      
      // Should demonstrate sorting usage
      expect(documentContent).toMatch(/sortBy.*=.*['"]created_at_desc['"]|['"]created_at_desc['"].*sortBy/);
    });

    it('should explain the purpose and benefits of each feature', () => {
      // Should explain why filtering is useful
      expect(documentContent).toMatch(/filter.*(help|allow|enable|useful)/i);
      
      // Should explain why sorting is useful
      expect(documentContent).toMatch(/sort.*(help|allow|enable|useful|organize)/i);
      
      // Should explain task completion benefits
      expect(documentContent).toMatch(/complet.*(progress|track|manage|status)/i);
    });

    it('should document error states and edge cases', () => {
      expect(documentContent).toContain('empty');
      expect(documentContent).toContain('no todos');
      expect(documentContent).toContain('no matching');
      expect(documentContent).toMatch(/error|fail|problem/i);
    });
  });
});