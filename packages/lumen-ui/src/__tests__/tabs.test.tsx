import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Tabs } from '../components/Tabs';

const options = [
  { label: 'Overview', value: 'overview' },
  { label: 'Activity', value: 'activity' },
];

describe('Tabs', () => {
  it('uses the line treatment by default', () => {
    render(
      <Tabs value="overview" options={options} onChange={() => undefined} />,
    );

    expect(screen.getByRole('tab', { name: 'Overview' })).toHaveClass(
      'after:bg-[var(--lumen-color-primary)]',
      'after:bottom-0',
      'after:h-[2px]',
    );
    expect(screen.getByRole('tablist')).toHaveClass(
      'overflow-x-auto',
      'overflow-y-hidden',
    );
  });

  it('keeps the pill variant available', () => {
    render(
      <Tabs
        value="overview"
        options={options}
        variant="pill"
        onChange={() => undefined}
      />,
    );

    expect(screen.getByRole('tab', { name: 'Overview' })).toHaveClass(
      'rounded-full',
    );
  });

  it('links tabs to panels with a shared id prefix', () => {
    render(
      <Tabs
        value="overview"
        options={options}
        idPrefix="account"
        onChange={() => undefined}
      />,
    );

    expect(screen.getByRole('tab', { name: 'Overview' })).toHaveAttribute(
      'id',
      'account-tab-overview',
    );
    expect(screen.getByRole('tab', { name: 'Overview' })).toHaveAttribute(
      'aria-controls',
      'account-panel-overview',
    );
  });

  it('scrolls a newly active tab into horizontal view', () => {
    const { rerender } = render(
      <Tabs value="overview" options={options} onChange={() => undefined} />,
    );
    const tabList = screen.getByRole('tablist');
    const activityTab = screen.getByRole('tab', { name: 'Activity' });
    const scrollTo = vi.fn();
    tabList.scrollTo = scrollTo;
    Object.defineProperty(tabList, 'clientWidth', { configurable: true, value: 200 });
    Object.defineProperty(tabList, 'scrollWidth', { configurable: true, value: 400 });
    Object.defineProperty(tabList, 'scrollLeft', { configurable: true, value: 10 });
    vi.spyOn(tabList, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      right: 200,
    } as DOMRect);
    vi.spyOn(activityTab, 'getBoundingClientRect').mockReturnValue({
      left: 220,
      right: 300,
    } as DOMRect);

    rerender(
      <Tabs value="activity" options={options} onChange={() => undefined} />,
    );

    expect(scrollTo).toHaveBeenCalledWith({ left: 114, behavior: 'smooth' });
  });
});
