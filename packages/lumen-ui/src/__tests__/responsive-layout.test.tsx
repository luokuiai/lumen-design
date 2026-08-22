import React from 'react';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { DateTimePicker } from '../components/DateTimePicker';
import { Tabs } from '../components/Tabs';
import { TimePicker } from '../components/TimePicker';
import { Toast } from '../components/Toast';

const tabOptions = [
  { label: 'Overview', value: 'overview' },
  { label: 'Activity', value: 'activity' },
];

describe('responsive layouts', () => {
  const originalInnerWidth = window.innerWidth;

  afterEach(() => {
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: originalInnerWidth,
    });
    Toast.resetForTests();
  });

  it('exposes every wide-screen tier on card tabs', () => {
    render(
      <Tabs
        value="overview"
        options={tabOptions}
        variant="card"
        onChange={() => undefined}
      />,
    );

    expect(screen.getByTestId('tabs-grid')).toHaveClass(
      'grid-cols-1',
      'pad:grid-cols-2',
      'l:grid-cols-3',
      'xl:grid-cols-4',
      'xxl:grid-cols-5',
      'xxxl:grid-cols-6',
    );
  });

  it('keeps time popovers inside a narrow mobile viewport', async () => {
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: 200,
    });
    const user = userEvent.setup();

    render(<TimePicker value="09:15" onChange={() => undefined} />);
    await user.click(screen.getByRole('button', { name: '请选择时间' }));

    const panel = document.querySelector<HTMLElement>('[data-time-picker-panel]');
    expect(panel).toHaveStyle({ width: '184px' });
    expect(panel).toHaveStyle({ maxHeight: 'calc(100dvh - 16px)' });
  });

  it('keeps date-time columns on mobile with horizontal overflow', async () => {
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: 300,
    });
    const user = userEvent.setup();

    render(
      <DateTimePicker
        value=""
        label="请选择日期时间"
        onChange={() => undefined}
      />,
    );
    await user.click(screen.getByRole('button', { name: '请选择日期时间' }));

    const panel = document.querySelector<HTMLElement>('[data-date-time-picker-panel]');
    const layout = panel?.firstElementChild as HTMLElement | null;
    expect(panel).toHaveStyle({ width: '284px' });
    expect(panel).toHaveClass('overflow-x-auto');
    expect(layout).toHaveStyle({ gridTemplateColumns: '320px 210px' });
  });

  it('positions toasts on the right with responsive width', async () => {
    await act(async () => {
      Toast.info('响应式消息');
    });

    const toast = await screen.findByRole('status');
    expect(toast).toHaveClass('w-full', 'min-w-0');
    expect(toast.parentElement).toHaveClass(
      'right-3',
      'w-[calc(100vw-1.5rem)]',
      'pad:w-[328px]',
      'l:w-[344px]',
    );
  });
});
