import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ConfirmDialog } from '../components/ConfirmDialog';

describe('ConfirmDialog', () => {
  it('uses its desktop width and keeps actions aligned on every viewport', () => {
    render(
      <ConfirmDialog
        open
        title="Confirm action"
        message="This action cannot be undone."
        onCancel={() => undefined}
        onConfirm={() => undefined}
      />,
    );

    const panel = document.querySelector('[data-modal="confirm-dialog"]');
    const actions = document.querySelector('[data-confirm-dialog-actions]');
    expect(screen.getByText('Confirm action')).toHaveClass(
      'text-[16px]',
      'font-semibold',
      'leading-6',
    );
    expect(panel).toHaveClass('w-full', 'max-w-[420px]');
    expect(panel).not.toHaveClass('max-w-full');
    expect(actions).toHaveClass('flex', 'items-center', 'justify-end');
    expect(actions).not.toHaveClass('flex-col', 'flex-col-reverse');
    const dialog = screen.getByRole('alertdialog', { name: 'Confirm action' });
    expect(dialog).toHaveAccessibleDescription('This action cannot be undone.');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });
});
