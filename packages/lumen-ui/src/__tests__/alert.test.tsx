import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Alert } from '../components/Alert';

describe('Alert', () => {
  it('renders semantic content and an action', () => {
    render(
      <Alert
        variant="success"
        title="处置完成"
        action={<button type="button">查看详情</button>}
      >
        事件已成功关闭。
      </Alert>,
    );

    const alert = screen.getByRole('status');
    expect(alert).toHaveAttribute('data-variant', 'success');
    expect(alert).toHaveClass('bg-[var(--lumen-color-success-soft)]');
    expect(alert).toHaveTextContent('处置完成');
    expect(screen.getByRole('button', { name: '查看详情' })).toBeVisible();
  });

  it('uses alert semantics for warnings and invokes onClose', () => {
    const onClose = vi.fn();
    render(
      <Alert variant="warning" title="道路拥堵" onClose={onClose}>
        请关注车流变化。
      </Alert>,
    );

    expect(screen.getByRole('alert')).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: '关闭提示' }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('supports content without a title or default icon', () => {
    const { container } = render(<Alert icon={false}>仅显示说明</Alert>);

    expect(screen.getByRole('status')).toHaveTextContent('仅显示说明');
    expect(container.querySelector('svg')).toBeNull();
  });
});
