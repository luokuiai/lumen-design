import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DataTable, type DataTableColumn } from '../components/DataTable';

type Row = { id: number; name: string; status: string };

const rows: Row[] = [
  { id: 1, name: 'K12+400', status: '待处置' },
  { id: 2, name: 'K18+900', status: '已关闭' },
];

const columns: DataTableColumn<Row>[] = [
  { key: 'name', header: '路段', sortable: true, render: (row) => row.name },
  { key: 'status', header: '状态', render: (row) => row.status },
];

describe('DataTable', () => {
  it('renders rows and requests controlled sorting', () => {
    const onSortChange = vi.fn();
    render(
      <DataTable
        caption="事件列表"
        columns={columns}
        data={rows}
        getRowKey={(row) => row.id}
        sort={{ key: 'name', direction: 'asc' }}
        onSortChange={onSortChange}
      />,
    );

    expect(screen.getByRole('table', { name: '事件列表' })).toBeVisible();
    expect(screen.getByRole('table').parentElement?.parentElement).toHaveClass(
      'rounded-[8px]',
      'border-[var(--lumen-color-border)]',
    );
    expect(screen.getByText('K12+400').closest('td')).toHaveClass('text-[14px]');
    expect(screen.getByRole('columnheader', { name: /路段/ })).toHaveAttribute(
      'aria-sort',
      'ascending',
    );
    expect(screen.getByRole('columnheader', { name: /路段/ })).toHaveClass(
      'text-[14px]',
      'font-normal',
    );
    expect(screen.getByRole('columnheader', { name: /路段/ }).parentElement?.className).toContain(
      '--lumen-color-divider',
    );
    fireEvent.click(screen.getByRole('button', { name: /路段/ }));
    expect(onSortChange).toHaveBeenCalledWith({ key: 'name', direction: 'desc' });
  });

  it('keeps compact tables at the dense text scale', () => {
    render(
      <DataTable
        density="compact"
        columns={columns}
        data={rows}
        getRowKey={(row) => row.id}
      />,
    );

    expect(screen.getByRole('columnheader', { name: '路段' })).toHaveClass('text-[13px]');
    expect(screen.getByText('K12+400').closest('td')).toHaveClass('text-[13px]');
  });

  it('removes the outer frame when embedded in another surface', () => {
    render(
      <DataTable
        variant="embedded"
        columns={columns}
        data={rows}
        getRowKey={(row) => row.id}
      />,
    );

    const root = screen.getByRole('table').parentElement?.parentElement;
    expect(root).toHaveAttribute('data-variant', 'embedded');
    expect(root).toHaveClass('rounded-none', 'border-0');
    expect(root).not.toHaveClass('rounded-[8px]');
    expect(root).not.toHaveClass('border-t');
  });

  it('selects visible rows while retaining selections from other pages', () => {
    const onSelectedRowKeysChange = vi.fn();
    render(
      <DataTable
        columns={columns}
        data={rows}
        getRowKey={(row) => row.id}
        selectedRowKeys={[99]}
        onSelectedRowKeysChange={onSelectedRowKeysChange}
      />,
    );

    fireEvent.click(screen.getByRole('checkbox', { name: '选择当前页全部行' }));
    expect(onSelectedRowKeysChange).toHaveBeenCalledWith([99, 1, 2]);
  });

  it('renders empty and loading states', () => {
    const { rerender } = render(
      <DataTable
        columns={columns}
        data={[]}
        getRowKey={(row) => row.id}
        emptyText="没有事件"
      />,
    );

    expect(screen.getByText('没有事件')).toBeVisible();
    rerender(
      <DataTable
        columns={columns}
        data={[]}
        getRowKey={(row) => row.id}
        loading
        loadingRowCount={3}
      />,
    );
    expect(screen.getAllByText('', { selector: 'span.animate-pulse' })).toHaveLength(6);
  });
});
