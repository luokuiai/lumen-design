import React, { createRef } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DragHandle } from '../components/drag-handle/DragHandle';
import { enUS } from '../i18n';
import { LumenProvider } from '../components/LumenProvider';

describe('DragHandle', () => {
  it('renders an accessible vertical handle by default', () => {
    render(<DragHandle />);

    const handle = screen.getByRole('button', { name: '拖动排序' });
    expect(handle).toHaveAttribute('type', 'button');
    expect(handle).toHaveAttribute('data-axis', 'vertical');
    expect(handle).toHaveAttribute('data-size', 'md');
  });

  it('uses the active dragging treatment', () => {
    render(<DragHandle active axis="horizontal" size="lg" label="调整图片顺序" />);

    const handle = screen.getByRole('button', { name: '调整图片顺序' });
    expect(handle).toHaveAttribute('data-active', 'true');
    expect(handle).toHaveAttribute('data-axis', 'horizontal');
    expect(handle).toHaveClass('cursor-grabbing', 'h-9', 'w-8');
  });

  it('forwards dnd attributes, listeners, and its ref', () => {
    const ref = createRef<HTMLButtonElement>();
    const onPointerDown = vi.fn();
    render(
      <DragHandle
        ref={ref}
        aria-describedby="sortable-instructions"
        tabIndex={0}
        onPointerDown={onPointerDown}
      />,
    );

    fireEvent.pointerDown(ref.current!);

    expect(ref.current).toHaveAttribute('aria-describedby', 'sortable-instructions');
    expect(ref.current).toHaveAttribute('tabindex', '0');
    expect(onPointerDown).toHaveBeenCalledOnce();
  });

  it('uses the active locale and supports custom icons', () => {
    render(
      <LumenProvider locale={enUS}>
        <DragHandle icon={<span data-testid="custom-grip">::</span>} />
      </LumenProvider>,
    );

    expect(screen.getByRole('button', { name: 'Drag to reorder' })).toBeInTheDocument();
    expect(screen.getByTestId('custom-grip')).toBeInTheDocument();
  });
});
