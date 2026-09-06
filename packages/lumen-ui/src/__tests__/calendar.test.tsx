import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Calendar } from '../components/calendar/Calendar';
import { DatePicker } from '../components/DatePicker';

describe('Calendar', () => {
  it('selects dates and enforces the inclusive date range', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Calendar
        value="2026-09-10"
        onChange={onChange}
        minDate="2026-09-10"
        maxDate="2026-09-20"
      />,
    );

    expect(screen.getByRole('gridcell', { name: '2026-09-09' })).toBeDisabled();
    expect(screen.getByRole('gridcell', { name: '2026-09-21' })).toBeDisabled();
    screen.getByRole('gridcell', { name: '2026-09-10' }).focus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('gridcell', { name: '2026-09-11' })).toHaveFocus();
    await user.click(screen.getByRole('gridcell', { name: '2026-09-15' }));
    expect(onChange).toHaveBeenCalledWith('2026-09-15');
  });

  it('supports uncontrolled selection, clearing, and month navigation', async () => {
    const user = userEvent.setup();
    render(<Calendar defaultValue="2026-09-10" showToday={false} />);

    await user.click(screen.getByRole('gridcell', { name: '2026-09-15' }));
    expect(screen.getByRole('gridcell', { name: '2026-09-15' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await user.click(screen.getByRole('button', { name: '清除' }));
    expect(screen.queryByRole('button', { name: '清除' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '上个月' }));
    expect(screen.getByRole('grid', { name: '2026年8月' })).toBeVisible();
  });

  it('is the calendar panel used by DatePicker', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <DatePicker
        value="2026-09-10"
        onChange={onChange}
        triggerAriaLabel="选择日期"
      />,
    );

    await user.click(screen.getByRole('button', { name: '选择日期' }));
    expect(document.querySelector('[data-date-picker-portal] [data-ui="calendar"]')).toBeTruthy();
    await user.click(screen.getByRole('gridcell', { name: '2026-09-15' }));
    expect(onChange).toHaveBeenCalledWith('2026-09-15');
    expect(screen.queryByRole('grid', { name: '2026年9月' })).not.toBeInTheDocument();
  });
});
