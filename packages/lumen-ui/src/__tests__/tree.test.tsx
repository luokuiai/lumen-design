import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Tree, type TreeNode } from '../index';

const nodes: TreeNode[] = [
  { key: 'docs', label: 'Documents', children: [
    { key: 'guide', label: 'Guide' },
    { key: 'notes', label: 'Notes', disabled: true },
  ] },
  { key: 'archive', label: 'Archive', selectable: false, children: [{ key: 'old', label: 'Old' }] },
  { key: 'readme', label: 'Readme' },
];
const item = (name: string) => screen.getByRole('treeitem', { name });

describe('Tree', () => {
  it('expands using the pointer without selecting and respects disabled branches', () => {
    const onSelectionChange = vi.fn();
    const { rerender } = render(<Tree nodes={nodes} onSelectionChange={onSelectionChange} />);
    const chevron = item('Documents').querySelector('svg')!;
    fireEvent.click(chevron);
    expect(item('Guide')).toBeInTheDocument();
    expect(item('Documents')).toHaveFocus();
    expect(onSelectionChange).not.toHaveBeenCalled();
    fireEvent.click(chevron);
    expect(screen.queryByRole('treeitem', { name: 'Guide' })).not.toBeInTheDocument();
    rerender(<Tree nodes={[{ ...nodes[0]!, disabled: true }]} />);
    fireEvent.click(item('Documents').querySelector('svg')!);
    fireEvent.keyDown(item('Documents'), { key: 'ArrowRight' });
    expect(item('Documents')).toHaveAttribute('aria-expanded', 'false');
  });

  it('retains accessible labels with custom content and allows keyboard cancellation', () => {
    render(<Tree nodes={nodes} renderLabel={(node) => <strong>{node.label} details</strong>} onKeyDown={(event) => event.preventDefault()} />);
    expect(screen.getByText('Documents details')).toBeInTheDocument();
    fireEvent.keyDown(item('Documents'), { key: 'ArrowRight' });
    expect(item('Documents')).toHaveAttribute('aria-expanded', 'false');
  });

  it('navigates visible nodes, expands and collapses with arrow keys', () => {
    render(<Tree nodes={nodes} aria-label="Files" />);
    expect(screen.getByRole('tree', { name: 'Files' })).toBeInTheDocument();
    expect(screen.queryByRole('treeitem', { name: 'Guide' })).not.toBeInTheDocument();
    item('Documents').focus();
    fireEvent.keyDown(item('Documents'), { key: 'ArrowRight' });
    expect(item('Documents')).toHaveAttribute('aria-expanded', 'true');
    fireEvent.keyDown(item('Documents'), { key: 'ArrowRight' });
    expect(item('Guide')).toHaveFocus();
    fireEvent.keyDown(item('Guide'), { key: 'ArrowDown' });
    expect(item('Notes')).toHaveFocus();
    fireEvent.keyDown(item('Notes'), { key: 'ArrowUp' });
    expect(item('Guide')).toHaveFocus();
    fireEvent.keyDown(item('Guide'), { key: 'ArrowLeft' });
    expect(item('Documents')).toHaveFocus();
    fireEvent.keyDown(item('Documents'), { key: 'ArrowLeft' });
    expect(screen.queryByRole('treeitem', { name: 'Guide' })).not.toBeInTheDocument();
    fireEvent.keyDown(item('Documents'), { key: 'End' });
    expect(item('Readme')).toHaveFocus();
    fireEvent.keyDown(item('Readme'), { key: 'Home' });
    expect(item('Documents')).toHaveFocus();
    fireEvent.keyDown(item('Documents'), { key: 'r' });
    expect(item('Readme')).toHaveFocus();
  });

  it('selects one node without selecting its ancestors', () => {
    const onSelectionChange = vi.fn();
    render(<Tree nodes={nodes} defaultExpandedKeys={['docs']} onSelectionChange={onSelectionChange} />);
    fireEvent.click(screen.getByText('Guide'));
    expect(item('Guide')).toHaveAttribute('aria-selected', 'true');
    expect(item('Documents')).toHaveAttribute('aria-selected', 'false');
    expect(onSelectionChange).toHaveBeenCalledExactlyOnceWith(['guide'], nodes[0]!.children![0]);
    fireEvent.keyDown(item('Readme'), { key: 'Enter' });
    expect(item('Guide')).toHaveAttribute('aria-selected', 'false');
    expect(item('Readme')).toHaveAttribute('aria-selected', 'true');
  });

  it('toggles independent multi-selection by Space and click', () => {
    render(<Tree nodes={nodes} multiple defaultSelectedKeys={['docs']} />);
    expect(screen.getByRole('tree')).toHaveAttribute('aria-multiselectable', 'true');
    fireEvent.keyDown(item('Readme'), { key: ' ' });
    expect(item('Documents')).toHaveAttribute('aria-selected', 'true');
    expect(item('Readme')).toHaveAttribute('aria-selected', 'true');
    fireEvent.click(screen.getByText('Documents'));
    expect(item('Documents')).toHaveAttribute('aria-selected', 'false');
  });

  it('reports controlled changes and waits for updated props', () => {
    const onExpandedChange = vi.fn();
    const onSelectionChange = vi.fn();
    const { rerender } = render(<Tree nodes={nodes} expandedKeys={[]} selectedKeys={[]} onExpandedChange={onExpandedChange} onSelectionChange={onSelectionChange} />);
    fireEvent.keyDown(item('Documents'), { key: 'ArrowRight' });
    fireEvent.click(screen.getByText('Readme'));
    expect(onExpandedChange).toHaveBeenCalledWith(['docs'], nodes[0]);
    expect(onSelectionChange).toHaveBeenCalledWith(['readme'], nodes[2]);
    expect(item('Documents')).toHaveAttribute('aria-expanded', 'false');
    expect(item('Readme')).toHaveAttribute('aria-selected', 'false');
    rerender(<Tree nodes={nodes} expandedKeys={['docs']} selectedKeys={['readme']} />);
    expect(item('Guide')).toBeInTheDocument();
    expect(item('Readme')).toHaveAttribute('aria-selected', 'true');
  });

  it('keeps disabled nodes inert and non-selectable branches expandable', () => {
    const onSelectionChange = vi.fn();
    render(<Tree nodes={nodes} defaultExpandedKeys={['docs']} onSelectionChange={onSelectionChange} />);
    fireEvent.click(screen.getByText('Notes'));
    fireEvent.keyDown(item('Notes'), { key: ' ' });
    fireEvent.click(screen.getByText('Archive'));
    expect(onSelectionChange).not.toHaveBeenCalled();
    fireEvent.keyDown(item('Archive'), { key: 'ArrowRight' });
    expect(item('Old')).toBeInTheDocument();
  });

  it('disables the entire tree and renders custom empty content', () => {
    const onSelectionChange = vi.fn();
    const { rerender } = render(<Tree nodes={nodes} disabled onSelectionChange={onSelectionChange} />);
    fireEvent.click(screen.getByText('Documents'));
    fireEvent.keyDown(item('Documents'), { key: 'ArrowRight' });
    expect(item('Documents')).toHaveAttribute('tabindex', '-1');
    expect(item('Documents')).toHaveAttribute('aria-expanded', 'false');
    expect(onSelectionChange).not.toHaveBeenCalled();
    rerender(<Tree nodes={[]} emptyContent={<span>No files</span>} />);
    expect(screen.getByText('No files')).toBeInTheDocument();
    expect(screen.queryByRole('treeitem')).not.toBeInTheDocument();
  });

  it('keeps one tab stop when data or expansion changes', () => {
    const { rerender } = render(<Tree nodes={nodes} defaultExpandedKeys={['docs']} />);
    fireEvent.click(screen.getByText('Guide'));
    rerender(<Tree nodes={nodes} expandedKeys={[]} />);
    expect(screen.getAllByRole('treeitem').filter((element) => element.tabIndex === 0)).toHaveLength(1);
    rerender(<Tree nodes={[nodes[2]!]} />);
    expect(item('Readme')).toHaveAttribute('tabindex', '0');
  });
});
