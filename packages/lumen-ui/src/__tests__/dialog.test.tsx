import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Dialog } from '../components/Dialog';
import { Select } from '../components/Select';

describe('Dialog', () => {
  it('retains content until the close animation finishes', () => {
    const onExited = vi.fn();
    const { rerender } = render(
      <Dialog
        open
        onRequestClose={() => undefined}
        onExited={onExited}
        dialogId="demo"
      >
        <p>Dialog content</p>
      </Dialog>,
    );

    rerender(
      <Dialog
        open={false}
        onRequestClose={() => undefined}
        onExited={onExited}
        dialogId="demo"
      >
        {null}
      </Dialog>,
    );

    expect(screen.getByText('Dialog content')).toBeInTheDocument();
    const overlay = document.querySelector('[data-dialog-overlay="demo"]');
    const panel = document.querySelector('[data-dialog="demo"]');
    expect(overlay).toHaveClass('backdrop-blur-[2px]');
    expect(overlay).toHaveClass('items-center');
    expect(overlay).not.toHaveClass('mobile:items-end');
    expect(panel).not.toHaveClass('max-w-full');

    fireEvent.animationEnd(overlay!);

    expect(screen.queryByText('Dialog content')).not.toBeInTheDocument();
    expect(onExited).toHaveBeenCalledOnce();
  });

  it('closes when the overlay is clicked', () => {
    const onRequestClose = vi.fn();
    render(
      <Dialog open onRequestClose={onRequestClose} dialogId="clickable">
        Content
      </Dialog>,
    );

    fireEvent.click(
      document.querySelector('[data-dialog-overlay="clickable"]')!,
    );

    expect(onRequestClose).toHaveBeenCalledOnce();
  });

  it('does not treat a pointer gesture starting in the panel as an overlay click', () => {
    const onRequestClose = vi.fn();
    render(
      <Dialog open onRequestClose={onRequestClose} dialogId="drag-safe">
        Content
      </Dialog>,
    );

    const overlay = document.querySelector('[data-dialog-overlay="drag-safe"]')!;
    const panel = document.querySelector('[data-dialog="drag-safe"]')!;
    fireEvent.pointerDown(panel);
    fireEvent.click(overlay);

    expect(onRequestClose).not.toHaveBeenCalled();
    fireEvent.pointerDown(overlay);
    fireEvent.click(overlay);
    expect(onRequestClose).toHaveBeenCalledOnce();
  });

  it('renders and automatically associates its title and description', () => {
    render(
      <Dialog
        open
        title="Edit profile"
        description="Update the account details."
        onRequestClose={() => undefined}
      >
        Content
      </Dialog>,
    );

    const dialog = screen.getByRole('dialog', { name: 'Edit profile' });
    expect(dialog).toHaveAccessibleDescription('Update the account details.');
    expect(document.querySelector('[data-dialog-title]')).toHaveTextContent(
      'Edit profile',
    );
    expect(
      document.querySelector('[data-dialog-description]'),
    ).toHaveTextContent('Update the account details.');
  });

  it('traps focus, closes with Escape, and restores the previous focus', async () => {
    const trigger = document.createElement('button');
    document.body.appendChild(trigger);
    trigger.focus();
    const onRequestClose = vi.fn();
    const { unmount } = render(
      <Dialog open onRequestClose={onRequestClose} aria-label="Edit profile">
        <button type="button">First action</button>
        <button type="button">Last action</button>
      </Dialog>,
    );

    const dialog = screen.getByRole('dialog', { name: 'Edit profile' });
    const first = screen.getByRole('button', { name: 'First action' });
    const last = screen.getByRole('button', { name: 'Last action' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    await waitFor(() => expect(first).toHaveFocus());

    last.focus();
    fireEvent.keyDown(last, { key: 'Tab' });
    expect(first).toHaveFocus();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onRequestClose).toHaveBeenCalledOnce();

    unmount();
    expect(trigger).toHaveFocus();
    trigger.remove();
  });

  it('keeps an owned Select portal in the focus scope and dismisses it before the dialog', async () => {
    const onRequestClose = vi.fn();
    render(
      <Dialog open onRequestClose={onRequestClose} aria-label="Edit profile">
        <Select
          searchable
          aria-label="Role"
          options={[{ label: 'Administrator', value: 'admin' }]}
          value={null}
          onChange={() => undefined}
        />
      </Dialog>,
    );

    fireEvent.click(screen.getByTestId('select-trigger'));
    const search = await screen.findByPlaceholderText('搜索...');
    search.focus();
    expect(search).toHaveFocus();

    fireEvent.keyDown(search, { key: 'Escape' });

    expect(screen.queryByTestId('select-dropdown')).not.toBeInTheDocument();
    expect(onRequestClose).not.toHaveBeenCalled();
  });

  it('keeps scroll locked and dismisses only the topmost nested overlay', () => {
    const firstClose = vi.fn();
    const secondClose = vi.fn();
    const first = render(
      <Dialog open onRequestClose={firstClose} aria-label="First dialog">
        First
      </Dialog>,
    );
    const second = render(
      <Dialog open onRequestClose={secondClose} aria-label="Second dialog">
        Second
      </Dialog>,
    );

    expect(document.body.style.overflow).toBe('hidden');
    const firstOverlay = screen.getByRole('dialog', {
      name: 'First dialog',
    }).parentElement;
    const secondOverlay = screen.getByRole('dialog', {
      name: 'Second dialog',
    }).parentElement;
    expect(Number(secondOverlay?.style.zIndex)).toBeGreaterThan(
      Number(firstOverlay?.style.zIndex),
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(firstClose).not.toHaveBeenCalled();
    expect(secondClose).toHaveBeenCalledOnce();

    second.unmount();
    expect(document.body.style.overflow).toBe('hidden');
    first.unmount();
    expect(document.body.style.overflow).toBe('');
  });
});
