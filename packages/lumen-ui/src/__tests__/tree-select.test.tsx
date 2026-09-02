import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { TreeSelect } from '../components/TreeSelect';

const nodes = [
  {
    label: '父节点',
    value: 'parent',
    selectable: false,
    children: [{ label: '子节点', value: 'child' }],
  },
  { label: '禁用节点', value: 'disabled', selectable: false },
];

describe('TreeSelect', () => {
  it('animates node expansion and keeps collapsed descendants inert', () => {
    render(
      <TreeSelect
        nodes={nodes}
        value={null}
        onChange={() => undefined}
        getValue={(node) => node.value}
        getLabel={(node) => node.label}
        isNodeSelectable={(node) => node.selectable !== false}
        defaultExpandedDepth={0}
      />,
    );

    fireEvent.click(screen.getByTestId('tree-select-trigger'));

    const expandButton = screen.getByTestId('tree-select-expand-parent');
    const childContainer = screen.getByText('子节点').closest('[aria-hidden]');
    const chevron = expandButton.querySelector('svg');

    expect(expandButton).toHaveAttribute('aria-expanded', 'false');
    expect(childContainer).toHaveAttribute('aria-hidden', 'true');
    expect(childContainer).toHaveAttribute('inert');
    expect(childContainer).toHaveClass('grid-rows-[0fr]', 'opacity-0');
    expect(chevron).not.toHaveClass('rotate-90');

    fireEvent.click(expandButton);

    expect(expandButton).toHaveAttribute('aria-expanded', 'true');
    expect(childContainer).toHaveAttribute('aria-hidden', 'false');
    expect(childContainer).not.toHaveAttribute('inert');
    expect(childContainer).toHaveClass('grid-rows-[1fr]', 'opacity-100');
    expect(chevron).toHaveClass('rotate-90');
  });

  it('keeps non-selectable rows neutral while only the expand control is interactive', () => {
    render(
      <TreeSelect
        nodes={nodes}
        value={null}
        onChange={() => undefined}
        getValue={(node) => node.value}
        getLabel={(node) => node.label}
        isNodeSelectable={(node) => node.selectable !== false}
      />,
    );

    fireEvent.click(screen.getByTestId('tree-select-trigger'));

    const parentOption = screen.getByTestId('tree-select-option-parent');
    const disabledOption = screen.getByTestId('tree-select-option-disabled');
    const expandButton = screen.getByTestId('tree-select-expand-parent');

    expect(parentOption).toBeDisabled();
    expect(parentOption).toHaveAttribute('aria-disabled', 'true');
    expect(parentOption).toHaveClass('!cursor-default');
    expect(parentOption.parentElement).toHaveClass('cursor-default');
    expect(parentOption.parentElement).not.toHaveClass(
      'hover:bg-[var(--lumen-color-surface-muted)]',
    );
    expect(disabledOption).toBeDisabled();
    expect(disabledOption).toHaveClass('!cursor-default');
    expect(expandButton).not.toBeDisabled();
    expect(expandButton).toHaveClass('cursor-pointer');
  });
});
