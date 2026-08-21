import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { TimePicker } from '../components/TimePicker';

describe('TimePicker', () => {
  it('selects and emits seconds when second precision is enabled', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <TimePicker
        value="09:15:20"
        onChange={onChange}
        precision="second"
        placeholder="选择秒级时间"
      />,
    );

    await user.click(screen.getByRole('button', { name: '选择秒级时间' }));
    await user.click(screen.getByRole('button', { name: '秒25' }));
    await user.click(screen.getByRole('button', { name: '确定' }));

    expect(onChange).toHaveBeenCalledWith('09:15:25');
  });

  it('keeps minute precision as the default', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <TimePicker
        value="09:15"
        onChange={onChange}
        placeholder="选择分钟时间"
      />,
    );

    await user.click(screen.getByRole('button', { name: '选择分钟时间' }));
    expect(screen.queryByText('秒')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '确定' }));

    expect(onChange).toHaveBeenCalledWith('09:15');
  });
});
