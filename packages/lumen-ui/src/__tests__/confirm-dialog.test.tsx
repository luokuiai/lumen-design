import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ConfirmDialog } from '../components/ConfirmDialog';

describe('ConfirmDialog', () => {
  it('uses its desktop width without a modal max-width override', () => {
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
    expect(actions).toHaveClass('l:flex-row', 'l:items-center', 'l:justify-end');
  });
});
