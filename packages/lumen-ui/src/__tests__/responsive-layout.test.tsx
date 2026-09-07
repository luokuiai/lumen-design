import React from 'react';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { DateTimePicker } from '../components/DateTimePicker';
import { DatePicker } from '../components/DatePicker';
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

  it('uses touch wheels in a modal on a narrow mobile viewport', async () => {
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: 200,
    });
    const user = userEvent.setup();

    render(<TimePicker value="09:15" onChange={() => undefined} />);
    await user.click(screen.getByRole('button', { name: '请选择时间' }));

    const panel = document.querySelector<HTMLElement>('[data-time-picker-panel]');
    const modal = document.querySelector<HTMLElement>('[data-modal="time-picker-panel"]');
    expect(document.querySelector('[data-modal-overlay="time-picker-panel"]')).toBeInTheDocument();
    expect(modal).toHaveAttribute('role', 'dialog');
    expect(modal).toHaveClass('max-w-[344px]');
    expect(panel).toHaveClass('contents');
    expect(
      screen.getByRole('listbox', { name: '时' }).querySelector('[aria-selected="true"]'),
    ).toHaveTextContent('09');
    expect(document.querySelector('[data-time-selector-column]')).not.toBeInTheDocument();
  });

  it('uses the shared modal treatment for the mobile date picker', async () => {
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: 300,
    });
    const user = userEvent.setup();

    render(<DatePicker value="" onChange={() => undefined} />);
    await user.click(screen.getByRole('button', { name: '请选择日期' }));

    const panel = document.querySelector<HTMLElement>('[data-date-picker-portal]');
    const modal = document.querySelector<HTMLElement>('[data-modal="date-picker-panel"]');
    expect(document.querySelector('[data-modal-overlay="date-picker-panel"]')).toBeInTheDocument();
    expect(modal).toHaveAttribute('role', 'dialog');
    expect(modal).toHaveClass('max-w-[320px]');
    expect(panel).toHaveClass('contents');
  });

  it('uses a stepped modal date-time flow on mobile', async () => {
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
    const modal = document.querySelector<HTMLElement>('[data-modal="date-time-picker-panel"]');
    expect(document.querySelector('[data-modal-overlay="date-time-picker-panel"]')).toBeInTheDocument();
    expect(modal).toHaveAttribute('role', 'dialog');
    expect(modal).toHaveClass('max-w-[360px]');
    expect(panel).toHaveClass('contents');
    expect(document.querySelector('[data-date-time-picker-time-column]')).not.toBeInTheDocument();

    const timeStep = panel?.querySelector<HTMLButtonElement>('button[aria-pressed="false"]');
    await user.click(timeStep!);

    expect(document.querySelector('[data-date-time-picker-mobile-time]')).toBeInTheDocument();
    expect(screen.queryByRole('textbox', { name: '时' })).not.toBeInTheDocument();
    expect(
      screen.getByRole('listbox', { name: '时' }).querySelector('[aria-selected="true"]'),
    ).toHaveTextContent('09');
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
