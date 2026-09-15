import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Bell, Settings } from 'lucide-react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SideNav } from '../components/SideNav';

const sections = [
  {
    title: 'Workspace',
    items: [
      { value: 'overview', label: 'Overview', icon: Bell, href: '#overview' },
      { value: 'settings', label: 'Settings', icon: Settings, disabled: true },
    ],
  },
];

const groupedSections = [{ items: [{
  value: 'workspace',
  label: 'Workspace',
  icon: Bell,
  children: [
    { value: 'unavailable', label: 'Unavailable', disabled: true },
    { value: 'overview', label: 'Overview', href: '#overview' },
    { value: 'reports', label: 'Reports' },
  ],
}] }];

afterEach(() => {
  vi.useRealTimers();
});

describe('SideNav', () => {
  it('expands groups with the keyboard and keeps hidden children out of Tab navigation', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const onExpandedValuesChange = vi.fn();
    render(
      <>
        <SideNav sections={groupedSections} activeValue="overview" onSelect={onSelect} onExpandedValuesChange={onExpandedValuesChange} />
        <button type="button">After navigation</button>
      </>,
    );
    const group = screen.getByRole('button', { name: 'Workspace' });
    const region = document.getElementById(group.getAttribute('aria-controls')!)!;
    expect(group).toHaveAttribute('data-active', 'true');
    expect(group).not.toHaveAttribute('aria-current');
    expect(region).toHaveAttribute('inert');

    await user.tab();
    expect(group).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'After navigation' })).toHaveFocus();
    await user.tab({ shift: true });
    await user.keyboard('{Enter}');
    expect(group).toHaveAttribute('aria-expanded', 'true');
    expect(region).not.toHaveAttribute('inert');
    expect(onExpandedValuesChange).toHaveBeenLastCalledWith(['workspace']);
    expect(onSelect).not.toHaveBeenCalled();

    await user.tab();
    const link = screen.getByRole('link', { name: 'Overview' });
    expect(link).toHaveFocus();
    expect(link).toHaveAttribute('aria-current', 'page');
    await user.tab();
    await user.keyboard(' ');
    expect(onSelect).toHaveBeenLastCalledWith('reports', groupedSections[0]!.items[0]!.children[2]);

    await user.click(group);
    expect(region).toHaveAttribute('inert');
    expect(link).toHaveAttribute('tabindex', '-1');
    expect(link).toBeInTheDocument();
    expect(onExpandedValuesChange).toHaveBeenLastCalledWith([]);
  });

  it('only changes a controlled group after the parent updates its expanded values', () => {
    const onExpandedValuesChange = vi.fn();
    const { rerender } = render(<SideNav sections={groupedSections} expandedValues={[]} onExpandedValuesChange={onExpandedValuesChange} />);
    const group = screen.getByRole('button', { name: 'Workspace' });
    fireEvent.click(group);
    expect(onExpandedValuesChange).toHaveBeenCalledWith(['workspace']);
    expect(group).toHaveAttribute('aria-expanded', 'false');
    rerender(<SideNav sections={groupedSections} expandedValues={['workspace']} onExpandedValuesChange={onExpandedValuesChange} />);
    expect(group).toHaveAttribute('aria-expanded', 'true');
  });

  it('keeps nested descendants untabbable while their ancestor is closed', () => {
    const nested = [{ items: [{ value: 'root', label: 'Root', children: groupedSections[0]!.items }] }];
    render(<SideNav sections={nested} defaultExpandedValues={['workspace']} />);
    const link = screen.getByRole('link', { name: 'Overview', hidden: true });
    expect(link).toHaveAttribute('tabindex', '-1');
    fireEvent.click(screen.getByRole('button', { name: 'Root' }));
    expect(screen.getByRole('button', { name: 'Workspace' })).toHaveAttribute('aria-expanded', 'true');
    expect(link).not.toHaveAttribute('tabindex');
  });

  it('navigates to the first enabled descendant in collapsed mode', () => {
    const onSelect = vi.fn();
    render(<SideNav sections={groupedSections} collapsed activeValue="reports" onSelect={onSelect} />);
    const group = screen.getByRole('link', { name: 'Workspace' });
    expect(group).toHaveAttribute('href', '#overview');
    expect(group).toHaveAttribute('data-active', 'true');
    expect(group).not.toHaveAttribute('aria-expanded');
    fireEvent.click(group);
    expect(onSelect).toHaveBeenCalledWith('overview', groupedSections[0]!.items[0]!.children[1]);
    expect(screen.queryByRole('button', { name: 'Reports' })).not.toBeInTheDocument();
  });

  it('disables descendants of a disabled group', () => {
    const onSelect = vi.fn();
    const onExpandedValuesChange = vi.fn();
    const disabledSections = [{ items: [{ ...groupedSections[0]!.items[0]!, disabled: true }] }];
    render(<SideNav sections={disabledSections} defaultExpandedValues={['workspace']} onSelect={onSelect} onExpandedValuesChange={onExpandedValuesChange} />);
    for (const button of screen.getAllByRole('button')) {
      expect(button).toBeDisabled();
      fireEvent.click(button);
    }
    expect(onSelect).not.toHaveBeenCalled();
    expect(onExpandedValuesChange).not.toHaveBeenCalled();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('gives separate navigation instances unique submenu relationships', () => {
    render(<><SideNav sections={groupedSections} /><SideNav sections={groupedSections} /></>);
    const groups = screen.getAllByRole('button', { name: 'Workspace' });
    const ids = groups.map((group) => group.getAttribute('aria-controls'));
    expect(new Set(ids).size).toBe(2);
    for (const id of ids) expect(document.getElementById(id!)).toHaveAttribute('data-side-nav-children');
  });

  it('marks the active item and emits selections', () => {
    const onSelect = vi.fn();
    render(
      <SideNav
        sections={sections}
        activeValue="overview"
        ariaLabel="Workspace navigation"
        onSelect={onSelect}
      />,
    );

    const activeItem = screen.getByRole('link', { name: 'Overview' });
    expect(activeItem).toHaveAttribute('aria-current', 'page');
    expect(activeItem).toHaveClass(
      'bg-[var(--lumen-color-primary-soft)]',
      'text-[14px]',
      'font-normal',
    );
    expect(screen.getByText('Workspace')).toHaveClass('text-[13px]', 'font-normal');

    fireEvent.click(activeItem);
    expect(onSelect).toHaveBeenCalledWith('overview', sections[0]!.items[0]!);
    expect(screen.getByRole('button', { name: 'Settings' })).toBeDisabled();
  });

  it('keeps collapsed items accessible by name', () => {
    render(<SideNav sections={sections} collapsed activeValue="overview" />);

    expect(screen.getByRole('navigation')).toHaveAttribute('data-collapsed', 'true');
    expect(screen.getByRole('link', { name: 'Overview' })).toHaveClass('justify-center');
  });

  it('does not show tooltips while quickly moving across collapsed items', () => {
    vi.useFakeTimers();
    render(<SideNav sections={sections} collapsed activeValue="overview" />);

    const overview = screen.getByRole('link', { name: 'Overview' });
    const settings = screen.getByRole('button', { name: 'Settings' });

    fireEvent.pointerEnter(overview);
    act(() => vi.advanceTimersByTime(200));
    fireEvent.pointerLeave(overview);
    fireEvent.pointerEnter(settings);
    act(() => vi.advanceTimersByTime(200));
    fireEvent.pointerLeave(settings);

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });
});
