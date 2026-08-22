import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../components/Card';

describe('Card', () => {
  it('renders the complete card structure', () => {
    render(
      <Card aria-label="Project" variant="outlined">
        <CardHeader>
          <div>
            <CardTitle>Project status</CardTitle>
            <CardDescription>Updated today</CardDescription>
          </div>
        </CardHeader>
        <CardContent>Ready</CardContent>
        <CardFooter>Actions</CardFooter>
      </Card>,
    );

    const card = screen.getByLabelText('Project');
    expect(card).toHaveAttribute('data-variant', 'outlined');
    expect(card).toHaveClass(
      'rounded-[var(--lumen-radius-card)]',
      'bg-[var(--lumen-color-surface)]',
    );
    expect(screen.getByRole('heading', { name: 'Project status' })).toBeVisible();
    expect(screen.getByText('Updated today')).toHaveAttribute(
      'data-ui',
      'card-description',
    );
    expect(screen.getByText('Ready')).toHaveClass('p-5', 'pad:p-6');
    expect(screen.getByText('Actions')).toHaveAttribute('data-ui', 'card-footer');
  });

  it('uses the elevated treatment by default', () => {
    render(<Card aria-label="Elevated" />);

    expect(screen.getByLabelText('Elevated')).toHaveClass(
      'shadow-[var(--lumen-shadow-card)]',
    );
  });
});
