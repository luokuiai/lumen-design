import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { List, ListItem } from '../components/List';

describe('List', () => {
  it('renders semantic items with structured content', () => {
    render(
      <List aria-label="事件列表">
        <ListItem title="异常停车" description="G65 K12+400" meta="刚刚" />
        <ListItem title="设备离线" selected />
      </List>,
    );

    expect(screen.getByRole('list', { name: '事件列表' })).toBeVisible();
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    expect(screen.getByText('异常停车')).toHaveClass('text-[14px]');
    expect(screen.getByText('G65 K12+400')).toHaveClass('text-[14px]');
    expect(screen.getByText('设备离线').closest('li')).toHaveAttribute('data-selected', 'true');
  });

  it('supports selectable and disabled items', () => {
    const onSelect = vi.fn();
    render(
      <List>
        <ListItem title="可选择" onSelect={onSelect} selectLabel="选择事件" />
        <ListItem title="不可选择" onSelect={onSelect} selectLabel="选择禁用事件" disabled />
      </List>,
    );

    fireEvent.click(screen.getByRole('button', { name: '选择事件' }));
    expect(onSelect).toHaveBeenCalledOnce();
    expect(screen.getByRole('button', { name: '选择禁用事件' })).toBeDisabled();
  });
});
