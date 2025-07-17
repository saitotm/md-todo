import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import IndexRoute from './_index';

describe('Index Route', () => {
  it('renders welcome message', () => {
    render(<IndexRoute />);
    expect(screen.getByText(/welcome to/i)).toBeInTheDocument();
  });
});