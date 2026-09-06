import React, { createRef } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import {
  VirtualList,
  type VirtualListHandle,
  type VirtualListRange,
} from '../components/virtual-list/VirtualList';

const items = Array.from({ length: 100 }, (_, index) => `Item ${index}`);

describe('VirtualList', () => {
  it('renders only the visible and overscan items', () => {
    render(
      <VirtualList
        aria-label="Items"
        items={items}
        itemSize={20}
        height={100}
        overscan={1}
        renderItem={(item) => item}
      />,
    );

    expect(screen.getAllByRole('listitem')).toHaveLength(6);
    expect(screen.getByText('Item 0')).toBeInTheDocument();
    expect(screen.getByText('Item 5')).toBeInTheDocument();
    expect(screen.queryByText('Item 6')).not.toBeInTheDocument();
  });

  it('updates the rendered window and reports its range while scrolling', () => {
    const onRangeChange = vi.fn<(range: VirtualListRange) => void>();
    render(
      <VirtualList
        aria-label="Items"
        items={items}
        itemSize={20}
        height={100}
        overscan={1}
        onRangeChange={onRangeChange}
        renderItem={(item) => item}
      />,
    );
    const list = screen.getByRole('list', { name: 'Items' });

    fireEvent.scroll(list, { target: { scrollTop: 200 } });

    expect(screen.getByText('Item 9')).toBeInTheDocument();
    expect(screen.getByText('Item 15')).toBeInTheDocument();
    expect(screen.queryByText('Item 8')).not.toBeInTheDocument();
    expect(onRangeChange).toHaveBeenLastCalledWith({
      startIndex: 10,
      endIndex: 14,
      overscanStartIndex: 9,
      overscanEndIndex: 15,
    });
  });

  it('supports known variable item sizes', () => {
    render(
      <VirtualList
        aria-label="Variable items"
        items={items}
        itemSize={(_, index) => index % 2 === 0 ? 20 : 40}
        height={60}
        overscan={0}
        renderItem={(item) => item}
      />,
    );

    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    expect(screen.getByText('Item 1')).toHaveStyle({
      height: '40px',
      transform: 'translateY(20px)',
    });
  });

  it('exposes imperative scrolling by item index', () => {
    const ref = createRef<VirtualListHandle>();
    render(
      <VirtualList
        ref={ref}
        aria-label="Items"
        items={items}
        itemSize={20}
        height={100}
        renderItem={(item) => item}
      />,
    );
    const list = screen.getByRole('list', { name: 'Items' });
    const scrollTo = vi.fn();
    Object.defineProperty(list, 'scrollTo', { configurable: true, value: scrollTo });

    ref.current?.scrollToIndex(10, { align: 'start' });

    expect(scrollTo).toHaveBeenCalledWith({ behavior: 'auto', top: 200 });
  });

  it('renders an empty state without list items', () => {
    render(
      <VirtualList
        aria-label="Empty items"
        items={[]}
        itemSize={40}
        emptyContent="暂无数据"
        renderItem={(item: string) => item}
      />,
    );

    expect(screen.getByText('暂无数据')).toBeInTheDocument();
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
  });
});
