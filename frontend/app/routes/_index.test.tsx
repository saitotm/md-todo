import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { createRemixStub } from '@remix-run/testing';
import IndexRoute from './_index';
import type { Todo } from '../lib/types';


describe('Index Route Tests', () => {
  const mockTodos: Todo[] = [
    {
      id: '1',
      title: 'Test Todo 1',
      content: 'This is test content 1',
      completed: false,
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z'
    },
    {
      id: '2', 
      title: 'Test Todo 2',
      content: 'This is test content 2',
      completed: true,
      created_at: '2025-01-01T01:00:00Z',
      updated_at: '2025-01-01T01:00:00Z'
    }
  ];

  describe('Using RemixStub (Recommended)', () => {
    it('renders todo management interface with empty state', async () => {
      const RemixStub = createRemixStub([
        {
          path: '/',
          Component: IndexRoute,
          loader: () => Response.json({ todos: [], error: null })
        }
      ], {
        future: {
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        },
      });

      render(<RemixStub />);
      
      // Since loader is async, wait for the content to appear
      expect(await screen.findByText('Your Todos')).toBeInTheDocument();
      expect(await screen.findByText('No todos yet. Create your first todo to get started!')).toBeInTheDocument();
    });

    it('displays statistics bar with correct data', async () => {
      const RemixStub = createRemixStub([
        {
          path: '/',
          Component: IndexRoute,
          loader: () => Response.json({ todos: mockTodos, error: null })
        }
      ], {
        future: {
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        },
      });

      render(<RemixStub />);
      
      expect(await screen.findByText('Total: 2')).toBeInTheDocument();
      expect(await screen.findByText('Completed: 1')).toBeInTheDocument();
      expect(await screen.findByText('Pending: 1')).toBeInTheDocument();
      expect(await screen.findByText('50% complete')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('displays error message when loader returns error', async () => {
      const RemixStub = createRemixStub([
        {
          path: '/',
          Component: IndexRoute,
          loader: () => Response.json({ todos: [], error: 'Failed to load todos' })
        }
      ], {
        future: {
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        },
      });

      render(<RemixStub />);
      
      expect(await screen.findByText('Failed to load todos')).toBeInTheDocument();
      expect(await screen.findByText('Your Todos')).toBeInTheDocument();
    });

    it('renders empty state when no todos are available', async () => {
      const RemixStub = createRemixStub([
        {
          path: '/',
          Component: IndexRoute,
          loader: () => Response.json({ todos: [], error: null })
        }
      ], {
        future: {
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        },
      });

      render(<RemixStub />);
      
      expect(await screen.findByText('Total: 0')).toBeInTheDocument();
      expect(await screen.findByText('No todos yet. Create your first todo to get started!')).toBeInTheDocument();
    });
  });
});