import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Pagination } from '../components/Pagination';

describe('Pagination', () => {
  it('renders page controls in the default variant', () => {
    const onPageChange = vi.fn();
    const { unmount } = render(
      <Pagination
        currentPage={3}
        totalPages={8}
        totalItems={80}
        onPageChange={onPageChange}
      />,
    );

    expect(screen.getByText('第 3 / 8 页')).toBeInTheDocument();
    expect(screen.getByRole('button', { current: 'page' })).toHaveTextContent(
      '3',
    );
    fireEvent.click(screen.getByRole('button', { name: '下一页' }));
    expect(onPageChange).toHaveBeenCalledWith(4);
    unmount();
  });

  it('renders previous and next actions in the compact variant', () => {
    const onPageChange = vi.fn();
    const { unmount } = render(
      <Pagination
        variant="compact"
        currentPage={2}
        totalPages={4}
        totalItems={32}
        itemLabel="records"
        onPageChange={onPageChange}
      />,
    );

    expect(screen.getByText('共 32 records · 第 2 / 4 页')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '上一页' }));
    expect(onPageChange).toHaveBeenCalledWith(1);
    unmount();
  });

  it('uses 10, 20, and 50 as the default page-size options', () => {
    const onPageSizeChange = vi.fn();
    render(
      <Pagination
        currentPage={1}
        totalPages={8}
        totalItems={80}
        pageSize={10}
        onPageChange={() => undefined}
        onPageSizeChange={onPageSizeChange}
      />,
    );

    fireEvent.click(screen.getByTestId('select-trigger'));
    const options = Array.from(
      document.querySelectorAll('[data-ui="select-option"]'),
      (option) => option.textContent,
    );
    expect(options).toEqual(['10条/页', '20条/页', '50条/页']);

    fireEvent.click(screen.getByText('20条/页'));
    expect(onPageSizeChange).toHaveBeenCalledWith(20);
  });

  it('hides a compact paginator when there is only one page', () => {
    const { container, unmount } = render(
      <Pagination
        variant="compact"
        currentPage={1}
        totalPages={1}
        totalItems={1}
        onPageChange={() => undefined}
      />,
    );

    expect(container).toBeEmptyDOMElement();
    unmount();
  });
});
