import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Modal } from '../components/Modal';

describe('Modal', () => {
  it('retains content until the close animation finishes', () => {
    const onExited = vi.fn();
    const { rerender } = render(
      <Modal open onRequestClose={() => undefined} onExited={onExited} modalId="demo">
        <p>Modal content</p>
      </Modal>,
    );

    rerender(
      <Modal
        open={false}
        onRequestClose={() => undefined}
        onExited={onExited}
        modalId="demo"
      >
        {null}
      </Modal>,
    );

    expect(screen.getByText('Modal content')).toBeInTheDocument();
    const overlay = document.querySelector('[data-modal-overlay="demo"]');
    expect(overlay).toHaveClass('backdrop-blur-sm');

    fireEvent.animationEnd(overlay!);

    expect(screen.queryByText('Modal content')).not.toBeInTheDocument();
    expect(onExited).toHaveBeenCalledOnce();
  });

  it('closes when the overlay is clicked', () => {
    const onRequestClose = vi.fn();
    render(
      <Modal open onRequestClose={onRequestClose} modalId="clickable">
        Content
      </Modal>,
    );

    fireEvent.click(document.querySelector('[data-modal-overlay="clickable"]')!);

    expect(onRequestClose).toHaveBeenCalledOnce();
  });
});
