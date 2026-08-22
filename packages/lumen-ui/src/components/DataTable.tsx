import React from 'react';
import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react';
import { Checkbox } from './Checkbox';
import { cn } from './classNames';

export type DataTableKey = React.Key;
export type DataTableSortDirection = 'asc' | 'desc';
export type DataTableDensity = 'default' | 'compact';

export interface DataTableSort {
  key: string;
  direction: DataTableSortDirection;
}

export interface DataTableColumn<T> {
  key: string;
  header: React.ReactNode;
  render: (row: T, rowIndex: number) => React.ReactNode;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  width?: string | number;
  minWidth?: string | number;
  className?: string;
  headerClassName?: string;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  getRowKey: (row: T) => DataTableKey;
  caption?: string;
  density?: DataTableDensity;
  loading?: boolean;
  loadingRowCount?: number;
  emptyText?: React.ReactNode;
  sort?: DataTableSort;
  onSortChange?: (sort: DataTableSort) => void;
  selectedRowKeys?: DataTableKey[];
  onSelectedRowKeysChange?: (keys: DataTableKey[]) => void;
  isRowSelectable?: (row: T) => boolean;
  rowClassName?: string | ((row: T, rowIndex: number) => string | undefined);
  className?: string;
  tableClassName?: string;
}

const toCssSize = (value?: string | number) =>
  typeof value === 'number' ? `${value}px` : value;

const loadingCellWidths = ['72%', '48%', '64%', '40%', '58%'];

export function DataTable<T>({
  columns,
  data,
  getRowKey,
  caption,
  density = 'default',
  loading = false,
  loadingRowCount = 5,
  emptyText = '暂无数据',
  sort,
  onSortChange,
  selectedRowKeys,
  onSelectedRowKeysChange,
  isRowSelectable,
  rowClassName,
  className,
  tableClassName,
}: DataTableProps<T>) {
  const selectable = Boolean(selectedRowKeys && onSelectedRowKeysChange);
  const selectedKeys = new Set(selectedRowKeys ?? []);
  const selectableRows = data.filter((row) => isRowSelectable?.(row) ?? true);
  const selectableKeys = selectableRows.map(getRowKey);
  const selectedVisibleCount = selectableKeys.filter((key) => selectedKeys.has(key)).length;
  const allVisibleSelected = selectableKeys.length > 0
    && selectedVisibleCount === selectableKeys.length;
  const someVisibleSelected = selectedVisibleCount > 0 && !allVisibleSelected;
  const cellPadding = density === 'compact' ? 'px-3 py-2' : 'px-4 py-3';

  const updateVisibleSelection = (checked: boolean) => {
    const nextKeys = new Set(selectedKeys);
    selectableKeys.forEach((key) => {
      if (checked) nextKeys.add(key);
      else nextKeys.delete(key);
    });
    onSelectedRowKeysChange?.(Array.from(nextKeys));
  };

  const updateRowSelection = (key: DataTableKey, checked: boolean) => {
    const nextKeys = new Set(selectedKeys);
    if (checked) nextKeys.add(key);
    else nextKeys.delete(key);
    onSelectedRowKeysChange?.(Array.from(nextKeys));
  };

  const requestSort = (column: DataTableColumn<T>) => {
    if (!column.sortable || !onSortChange) return;
    onSortChange({
      key: column.key,
      direction: sort?.key === column.key && sort.direction === 'asc' ? 'desc' : 'asc',
    });
  };

  const renderSortIcon = (column: DataTableColumn<T>) => {
    if (sort?.key !== column.key) return <ChevronsUpDown aria-hidden="true" size={14} />;
    return sort.direction === 'asc'
      ? <ArrowUp aria-hidden="true" size={14} />
      : <ArrowDown aria-hidden="true" size={14} />;
  };

  const totalColumns = columns.length + (selectable ? 1 : 0);

  return (
    <div
      data-ui="data-table"
      data-density={density}
      className={cn(
        'min-w-0 overflow-hidden rounded-[8px] border border-[var(--lumen-color-border)] bg-[var(--lumen-color-surface)]',
        className,
      )}
    >
      <div className="max-w-full overflow-x-auto">
        <table className={cn('w-full border-collapse text-left', tableClassName)}>
          {caption ? <caption className="sr-only">{caption}</caption> : null}
          <thead className="bg-[var(--lumen-color-surface-subtle)]">
            <tr className="border-b border-[var(--lumen-color-border)]">
              {selectable ? (
                <th scope="col" className={cn('w-12', cellPadding)}>
                  <Checkbox
                    aria-label="选择当前页全部行"
                    checked={allVisibleSelected}
                    indeterminate={someVisibleSelected}
                    disabled={loading || selectableKeys.length === 0}
                    onChange={updateVisibleSelection}
                  />
                </th>
              ) : null}
              {columns.map((column) => {
                const activeSort = sort?.key === column.key ? sort.direction : undefined;
                return (
                  <th
                    key={column.key}
                    scope="col"
                    aria-sort={
                      activeSort === 'asc'
                        ? 'ascending'
                        : activeSort === 'desc'
                          ? 'descending'
                          : undefined
                    }
                    className={cn(
                      cellPadding,
                      'whitespace-nowrap text-[13px] font-medium leading-5 text-[var(--lumen-color-text-secondary)]',
                      column.align === 'center' && 'text-center',
                      column.align === 'right' && 'text-right',
                      column.headerClassName,
                    )}
                    style={{
                      width: toCssSize(column.width),
                      minWidth: toCssSize(column.minWidth),
                    }}
                  >
                    {column.sortable ? (
                      <button
                        type="button"
                        className={cn(
                          'inline-flex items-center gap-1 rounded-[4px] transition-colors hover:text-[var(--lumen-color-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--lumen-color-primary)]/20',
                          column.align === 'right' && 'ml-auto',
                          column.align === 'center' && 'mx-auto',
                          activeSort && 'text-[var(--lumen-color-primary)]',
                        )}
                        onClick={() => requestSort(column)}
                      >
                        {column.header}
                        {renderSortIcon(column)}
                      </button>
                    ) : column.header}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: Math.max(1, loadingRowCount) }, (_, rowIndex) => (
                  <tr
                    key={`loading-${rowIndex}`}
                    className="border-b border-[var(--lumen-color-surface-muted)] last:border-b-0"
                  >
                    {selectable ? <td className={cellPadding} /> : null}
                    {columns.map((column, columnIndex) => (
                      <td key={column.key} className={cellPadding}>
                        <span
                          className="block h-3 animate-pulse rounded-[4px] bg-[var(--lumen-color-surface-muted)]"
                          style={{ width: loadingCellWidths[columnIndex % loadingCellWidths.length] }}
                        />
                      </td>
                    ))}
                  </tr>
                ))
              : data.length === 0
                ? (
                    <tr>
                      <td
                        colSpan={totalColumns}
                        className="px-4 py-14 text-center text-[13px] text-[var(--lumen-color-text-placeholder)]"
                      >
                        {emptyText}
                      </td>
                    </tr>
                  )
                : data.map((row, rowIndex) => {
                    const key = getRowKey(row);
                    const rowSelectable = isRowSelectable?.(row) ?? true;
                    const resolvedRowClassName = typeof rowClassName === 'function'
                      ? rowClassName(row, rowIndex)
                      : rowClassName;
                    return (
                      <tr
                        key={key}
                        data-selected={selectedKeys.has(key) || undefined}
                        className={cn(
                          'border-b border-[var(--lumen-color-surface-muted)] transition-colors last:border-b-0 hover:bg-[var(--lumen-color-surface-hover)] data-[selected=true]:bg-[var(--lumen-color-info-soft)]',
                          resolvedRowClassName,
                        )}
                      >
                        {selectable ? (
                          <td className={cellPadding}>
                            <Checkbox
                              aria-label={`选择第 ${rowIndex + 1} 行`}
                              checked={selectedKeys.has(key)}
                              disabled={!rowSelectable}
                              onChange={(checked) => updateRowSelection(key, checked)}
                            />
                          </td>
                        ) : null}
                        {columns.map((column) => (
                          <td
                            key={column.key}
                            className={cn(
                              cellPadding,
                              'text-[13px] font-normal leading-5 text-[var(--lumen-color-text-secondary)]',
                              column.align === 'center' && 'text-center',
                              column.align === 'right' && 'text-right',
                              column.className,
                            )}
                          >
                            {column.render(row, rowIndex)}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
