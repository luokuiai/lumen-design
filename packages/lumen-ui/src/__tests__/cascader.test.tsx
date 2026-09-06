import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Cascader, type CascaderOption } from '../components/cascader/Cascader';

const options: CascaderOption[] = [
  {
    value: 'north',
    label: 'North region',
    children: [
      {
        value: 'beijing',
        label: 'Beijing',
        children: [
          { value: 'chaoyang', label: 'Chaoyang camera', keywords: ['camera'] },
          { value: 'haidian', label: 'Haidian radar' },
        ],
      },
    ],
  },
  { value: 'disabled', label: 'Disabled region', disabled: true },
];

describe('Cascader', () => {
  it('expands columns and returns the complete selected path', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Cascader options={options} onChange={onChange} aria-label="Device location" />);

    await user.click(screen.getByRole('button', { name: 'Device location' }));
    const north = await screen.findByRole('option', { name: 'North region' });
    north.focus();
    await user.keyboard('{ArrowRight}');
    await waitFor(() => expect(screen.getByRole('option', { name: 'Beijing' })).toHaveFocus());

    await user.keyboard('{ArrowRight}');
    await waitFor(() => expect(screen.getByRole('option', { name: 'Chaoyang camera' })).toHaveFocus());
    await user.keyboard('{Enter}');

    expect(onChange).toHaveBeenCalledWith(
      ['north', 'beijing', 'chaoyang'],
      [options[0], options[0]!.children![0], options[0]!.children![0]!.children![0]],
    );
  });

  it('searches leaf paths and uses the Lumen scrollbar', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Cascader options={options} searchable onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: '请选择' }));
    await user.type(await screen.findByRole('textbox', { name: '搜索选项' }), 'camera');
    const results = screen.getByRole('listbox', { name: '搜索结果' });
    expect(results).toHaveAttribute('data-ui', 'scrollbar');
    await user.click(screen.getByRole('option', { name: /North region.*Chaoyang camera/ }));
    expect(onChange).toHaveBeenCalledWith(
      ['north', 'beijing', 'chaoyang'],
      expect.any(Array),
    );
  });

  it('renders a selected path and clears it', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Cascader
        options={options}
        value={['north', 'beijing', 'haidian']}
        onChange={onChange}
      />,
    );

    expect(screen.getByText('North region / Beijing / Haidian radar')).toBeVisible();
    await user.click(screen.getByRole('button', { name: '清除选择' }));
    expect(onChange).toHaveBeenCalledWith([], []);
  });
});
