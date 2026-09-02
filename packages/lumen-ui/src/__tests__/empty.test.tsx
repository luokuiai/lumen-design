import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Empty } from '../components/Empty';

describe('Empty', () => {
  it('renders its title, description, and action', () => {
    render(
      <Empty
        bordered
        title="暂无事件"
        description="当前筛选条件下没有匹配记录。"
        action={<button type="button">清除筛选</button>}
      />,
    );

    expect(screen.getByText('暂无事件')).toBeVisible();
    expect(screen.getByText('暂无事件')).toHaveClass('font-normal');
    expect(screen.getByText('暂无事件')).not.toHaveClass('font-medium');
    expect(screen.getByText('当前筛选条件下没有匹配记录。')).toBeVisible();
    expect(screen.getByRole('button', { name: '清除筛选' })).toBeVisible();
    expect(screen.getByText('暂无事件').closest('[data-ui="empty"]')).toHaveClass(
      'border-dashed',
    );
  });

  it('can hide the default icon', () => {
    const { container } = render(<Empty icon={false} size="sm" />);

    expect(screen.getByText('暂无数据')).toBeVisible();
    expect(container.querySelector('svg')).toBeNull();
  });

  it('renders the icon without a background surface', () => {
    const { container } = render(<Empty />);

    expect(container.querySelector('svg')?.parentElement).not.toHaveClass(
      'bg-[var(--lumen-color-surface-muted)]',
    );
  });

  it.each([
    ['sm', 'py-4'],
    ['md', 'py-8'],
    ['lg', 'py-12'],
  ] as const)('uses compact vertical padding for the %s size', (size, paddingClass) => {
    render(<Empty size={size} />);

    expect(screen.getByText('暂无数据').closest('[data-ui="empty"]')).toHaveClass(
      paddingClass,
    );
  });
});
