import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Accordion, Collapse, CollapseItem } from '../components/Collapse';

describe('Collapse', () => {
  it('allows multiple panels to be expanded', () => {
    render(
      <Collapse defaultValue={['one']}>
        <CollapseItem value="one" title="第一项">内容一</CollapseItem>
        <CollapseItem value="two" title="第二项">内容二</CollapseItem>
      </Collapse>,
    );

    expect(screen.getByRole('button', { name: '第一项' })).toHaveClass('text-[14px]');
    expect(screen.getByRole('button', { name: '第一项' })).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('内容一')).toHaveClass('text-[14px]');
    expect(screen.getByText('内容二').closest('[aria-hidden="true"]')).toHaveClass(
      'grid-rows-[0fr]',
      'opacity-0',
    );
    fireEvent.click(screen.getByRole('button', { name: '第二项' }));
    expect(screen.getByRole('button', { name: '第一项' })).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('button', { name: '第二项' })).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('内容二').closest('[aria-hidden="false"]')).toHaveClass(
      'grid-rows-[1fr]',
      'opacity-100',
    );
  });

  it('keeps only one Accordion panel open', () => {
    const onValueChange = vi.fn();
    render(
      <Accordion defaultValue="one" onValueChange={onValueChange}>
        <CollapseItem value="one" title="第一项">内容一</CollapseItem>
        <CollapseItem value="two" title="第二项">内容二</CollapseItem>
      </Accordion>,
    );

    fireEvent.click(screen.getByRole('button', { name: '第二项' }));
    expect(screen.getByRole('button', { name: '第一项' })).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByRole('button', { name: '第二项' })).toHaveAttribute('aria-expanded', 'true');
    expect(onValueChange).toHaveBeenCalledWith('two');
  });
});
