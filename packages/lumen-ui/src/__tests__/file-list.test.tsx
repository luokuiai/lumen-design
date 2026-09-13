import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FileList, FileListItem, type FileListFile } from '../components/file-list/FileList';
import { FileUpload } from '../components/FileUpload';

const items: FileListFile[] = [
  { id: 'pdf', name: 'report.pdf', size: 1258291, badge: { label: 'Awaiting a very long review', variant: 'warning' } },
  { id: 'sheet', name: 'budget.xlsx', size: 0 },
  { id: 'remote', name: 'remote.png' },
];

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('FileList', () => {
  it('defaults to compact badges and forwards updated width settings to each item', () => {
    const { rerender } = render(<FileList items={items} />);
    const widths = () => screen.getAllByRole('listitem').map((item) => item.style.getPropertyValue('--lumen-file-badge-max-width'));
    expect(widths()).toEqual(['96px', '96px', '96px']);
    rerender(<FileList items={items} badgeMaxWidth={72} />);
    expect(widths()).toEqual(['72px', '72px', '72px']);
    rerender(<FileList items={items} badgeMaxWidth="5rem" />);
    expect(widths()).toEqual(['5rem', '5rem', '5rem']);
    expect(screen.getByRole('list')).not.toHaveAttribute('badgeMaxWidth');
  });

  it('supports badge width on standalone items while preserving caller styles', () => {
    render(<ul><FileListItem file={items[0]!} badgeMaxWidth="20%" style={{ color: 'red' }} /></ul>);
    const item = screen.getByRole('listitem');
    expect(item.style.getPropertyValue('--lumen-file-badge-max-width')).toBe('20%');
    expect(item.style.color).toBe('red');
    expect(item).not.toHaveAttribute('badgeMaxWidth');
  });

  it('renders remote metadata with file type icons and optional sizes', () => {
    const { container, rerender } = render(<FileList items={items} />);
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
    expect(container.querySelector('[data-file-type-category="pdf"]')).toBeInTheDocument();
    expect(container.querySelector('[data-file-type-category="spreadsheet"]')).toBeInTheDocument();
    expect(screen.getByText('1.2 MB')).toBeInTheDocument();
    expect(screen.getByText('0 B')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    rerender(<FileList items={items} showSize={false} wrapName />);
    expect(screen.queryByText('1.2 MB')).not.toBeInTheDocument();
    expect(screen.queryByText('0 B')).not.toBeInTheDocument();
    expect(screen.getByText('report.pdf')).not.toHaveClass('truncate');
  });

  it('removes the selected item and respects disabled state', () => {
    const onRemove = vi.fn();
    const { rerender } = render(<FileList items={items} onRemove={onRemove} />);
    fireEvent.click(screen.getByRole('button', { name: /budget.xlsx/ }));
    expect(onRemove).toHaveBeenCalledWith(items[1]);
    rerender(<FileList items={items} onRemove={onRemove} disabled />);
    fireEvent.click(screen.getByRole('button', { name: /budget.xlsx/ }));
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it.each(['report.pdf', 'Awaiting a very long review'])(
    'only shows a tooltip for overflowing text: %s', (text) => {
      vi.useFakeTimers();
      let width = 500;
      vi.spyOn(HTMLElement.prototype, 'scrollWidth', 'get').mockReturnValue(200);
      vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(() => width);
      render(<FileList items={items.slice(0, 1)} />);
      fireEvent.pointerEnter(screen.getByText(text));
      act(() => { vi.advanceTimersByTime(400); });
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
      fireEvent.pointerLeave(screen.getByText(text));
      width = 80;
      fireEvent.pointerEnter(screen.getByText(text));
      act(() => { vi.advanceTimersByTime(400); });
      expect(screen.getByRole('tooltip')).toHaveTextContent(text);
    },
  );

  it('renders trailing actions with the matching file independently of removal', () => {
    const preview = vi.fn();
    render(<FileList items={items} renderActions={(file) => (
      <button onClick={() => preview(file.id)}>Preview {file.name}</button>
    )} />);
    fireEvent.click(screen.getByRole('button', { name: 'Preview budget.xlsx' }));
    expect(preview).toHaveBeenCalledWith('sheet');
    expect(screen.getAllByRole('button')).toHaveLength(6);
  });

  it('collapses custom actions into a mobile overflow menu', () => {
    const preview = vi.fn();
    const remove = vi.fn();
    render(<FileList items={items.slice(0, 1)} onRemove={remove} renderActions={(file) => (
      <button title="Preview" onClick={() => preview(file.id)}>Preview {file.name}</button>
    )} />);

    const desktopActions = screen.getByText('Preview report.pdf').parentElement;
    expect(desktopActions).toHaveClass('mobile:hidden');

    const trigger = screen.getByRole('button', { name: 'report.pdf 的更多操作' });
    expect(trigger.parentElement).toHaveClass('mobile:block');
    fireEvent.click(trigger);
    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: '移除' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('menuitem', { name: 'Preview' }));
    expect(preview).toHaveBeenCalledWith('pdf');
    expect(screen.getByTestId('dropdown-menu')).toHaveAttribute('data-state', 'closing');
  });

  it('does not show a name tooltip in wrapping mode', () => {
    vi.useFakeTimers();
    vi.spyOn(HTMLElement.prototype, 'scrollWidth', 'get').mockReturnValue(200);
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(80);
    render(<FileList items={items.slice(0, 1)} wrapName />);
    fireEvent.pointerEnter(screen.getByText('report.pdf'));
    act(() => { vi.advanceTimersByTime(400); });
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });
});

describe('FileUpload file list integration', () => {
  it('forwards display options and keeps removal tied to the original File', () => {
    const files = [new File(['hello'], 'report.pdf'), new File(['hi'], 'photo.png')];
    const onChange = vi.fn();
    const { rerender } = render(
      <FileUpload value={files} onChange={onChange} showFileSize={false} wrapFileName getFileBadge={() => ({ label: 'Ready' })} renderFileActions={(file) => (
        <button onClick={() => onChange([file])}>Preview {file.name}</button>
      )} />,
    );
    expect(screen.getAllByText('Ready')).toHaveLength(2);
    expect(screen.queryByText('5 B')).not.toBeInTheDocument();
    expect(screen.getByText('report.pdf')).not.toHaveClass('truncate');
    fireEvent.click(screen.getByRole('button', { name: 'Preview report.pdf' }));
    expect(onChange).toHaveBeenCalledWith([files[0]]);
    fireEvent.click(screen.getByRole('button', { name: '移除 report.pdf' }));
    expect(onChange).toHaveBeenCalledWith([files[1]]);
    rerender(<FileUpload value={files} onChange={onChange} uploading />);
    expect(screen.getByRole('button', { name: '移除 report.pdf' })).toBeDisabled();
    rerender(<FileUpload value={files} onChange={onChange} showFileList={false} />);
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });
});
