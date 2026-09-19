import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { Select } from '../components/Select';

const options = [
  { label: '项目一', value: 'one' },
  { label: '项目二', value: 'two' },
];

describe('Select', () => {
  it('shows keyboard focus on the closed trigger without selecting a value', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<>
      <Select options={options} value={null} onChange={onChange} />
      <button>Next</button>
    </>);
    const trigger = screen.getByTestId('select-trigger');
    await user.tab();
    expect(trigger).toHaveFocus();
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveClass('focus-visible:border-[var(--lumen-color-primary)]', 'focus-visible:ring-2');
    expect(onChange).not.toHaveBeenCalled();
    await user.tab();
    expect(screen.getByText('Next')).toHaveFocus();
    await user.tab({ shift: true });
    expect(trigger).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('uses equal compact padding around options with visible item spacing', () => {
    render(
      <Select
        options={options}
        value={null}
        onChange={() => undefined}
      />,
    );

    fireEvent.click(screen.getByTestId('select-trigger'));
    const option = document.querySelector('[data-ui="select-option"]');

    expect(option).toHaveClass('p-2', 'text-[14px]');
    expect(option?.parentElement).toHaveClass('flex', 'flex-col', 'gap-1', 'p-2');
    const scrollbar = option?.closest('[data-ui="scrollbar"]');
    expect(scrollbar).toHaveAttribute('data-size', 'sm');
    expect(scrollbar).toHaveAttribute('tabindex', '-1');
    expect(option?.parentElement?.parentElement).toBe(scrollbar);
  });

  it('inherits the trigger font size for multiple-value chips', () => {
    render(
      <Select
        mode="multiple"
        options={options}
        value={['one']}
        onChange={() => undefined}
      />,
    );

    expect(screen.getByTestId('select-trigger')).toHaveClass('text-[14px]');
    expect(document.querySelector('[data-ui="select-value-chip"]')).not.toHaveClass(
      'text-[13px]',
    );
  });

  it('positions the portal before making the dropdown visible', () => {
    render(
      <Select
        options={options}
        value={null}
        onChange={() => undefined}
      />,
    );

    const container = screen.getByTestId('select-trigger').parentElement!;
    vi.spyOn(container, 'getBoundingClientRect').mockReturnValue({
      bottom: 140,
      height: 40,
      left: 80,
      right: 280,
      top: 100,
      width: 200,
      x: 80,
      y: 100,
      toJSON: () => undefined,
    });

    fireEvent.click(screen.getByTestId('select-trigger'));

    expect(screen.getByTestId('select-dropdown')).toHaveStyle({
      left: '80px',
      minWidth: '200px',
      top: '146px',
      visibility: 'visible',
    });
  });
});
