import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
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
  it('keeps manually expanded branches open across controlled multi-selection rerenders', () => {
    const Harness = () => {
      const [values, setValues] = React.useState<string[]>([]);
      return <TreeSelect
        nodes={[{ value: 'parent', label: 'Parent', children: [
          { value: 'first', label: 'First' }, { value: 'second', label: 'Second' },
        ] }]}
        value={null} onChange={() => undefined} multiple values={values} onMultiChange={setValues}
        getValue={(node) => node.value} getLabel={(node) => node.label} defaultExpandedDepth={0}
      />;
    };
    render(<Harness />);
    fireEvent.click(screen.getByTestId('tree-select-trigger'));
    fireEvent.click(screen.getByTestId('tree-select-expand-parent'));
    fireEvent.click(screen.getByTestId('tree-select-option-first'));
    expect(screen.getByTestId('tree-select-dropdown')).toBeInTheDocument();
    const scrollbar = screen.getByTestId('tree-select-dropdown').querySelector('[data-ui="scrollbar"]');
    expect(scrollbar).toHaveAttribute('data-size', 'sm');
    expect(scrollbar).toHaveAttribute('tabindex', '-1');
    expect(scrollbar?.firstElementChild).toHaveClass('px-2.5', 'py-1.5');
    expect(screen.getByTestId('tree-select-expand-parent')).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByTestId('tree-select-option-second').closest('[aria-hidden]')).toHaveAttribute('aria-hidden', 'false');
    fireEvent.click(screen.getByTestId('tree-select-option-second'));
    expect(screen.getByTestId('tree-select-trigger')).toHaveTextContent('FirstSecond');
  });

  it.each([200, 528])('chooses the roomier side and keeps it as content grows at top %i', (triggerTop) => {
    let height = 100;
    const heightSpy = vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockImplementation(() => height);
    const boundsSpy = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
      top: triggerTop, bottom: triggerTop + 36,
      left: 20, right: 220, width: 200, height: 36, x: 20, y: triggerTop, toJSON: () => ({}),
    });
    try {
      render(<TreeSelect nodes={nodes} value={null} onChange={() => undefined}
        getValue={(node) => node.value} getLabel={(node) => node.label} />);
      fireEvent.click(screen.getByTestId('tree-select-trigger'));
      const dropdown = screen.getByTestId('tree-select-dropdown');
      const placement = triggerTop > window.innerHeight / 2 ? 'top' : 'bottom';
      expect(dropdown).toHaveAttribute('data-placement', placement);
      height = 400;
      fireEvent.scroll(window);
      expect(dropdown).toHaveAttribute('data-placement', placement);
      const availableHeight = placement === 'top' ? triggerTop - 14 : window.innerHeight - triggerTop - 50;
      expect(dropdown).toHaveStyle({ maxHeight: `${availableHeight}px` });
      expect(parseFloat(dropdown.style.top)).toBe(placement === 'top' ? triggerTop - 406 : triggerTop + 42);
    } finally {
      heightSpy.mockRestore(); boundsSpy.mockRestore();
    }
  });

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

  it('distinguishes non-selectable nodes while keeping expand controls interactive', () => {
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
    expect(parentOption.parentElement).toHaveClass(
      'cursor-default',
      'text-[var(--lumen-color-text-secondary)]',
    );
    expect(parentOption.parentElement).not.toHaveClass(
      'hover:bg-[var(--lumen-color-surface-muted)]',
    );

    expect(disabledOption).toBeDisabled();
    expect(disabledOption).toHaveClass('!cursor-default');
    expect(disabledOption.parentElement).toHaveClass(
      'text-[var(--lumen-color-text-secondary)]',
    );
    expect(expandButton).not.toBeDisabled();
    expect(expandButton).toHaveClass('cursor-pointer');
  });
});
