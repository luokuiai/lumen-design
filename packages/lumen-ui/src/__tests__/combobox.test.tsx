import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Combobox } from '../components/combobox/Combobox';

const options = [
  { label: '设计评审', value: 'review' },
  { label: '需求同步', value: 'sync' },
  { label: '线上发布', value: 'release', disabled: true },
];

describe('Combobox', () => {
  it('keeps typography aligned with the selected control size on mobile', () => {
    render(<Combobox options={options} value={null} onChange={() => undefined} />);

    const control = screen.getByRole('combobox').parentElement;
    expect(control).toHaveClass('text-[14px]');
    expect(control).not.toHaveClass('mobile:text-[16px]');
    expect(control).toHaveAttribute('data-size', 'md');
    expect(screen.getByRole('combobox')).toHaveAttribute('data-ui', 'combobox-input');
  });

  it('filters options from the editable trigger and selects a result', async () => {
    const onChange = vi.fn();
    render(<Combobox options={options} value={null} onChange={onChange} />);

    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: '需求' } });

    expect(input).toHaveAttribute('aria-expanded', 'true');
    expect(screen.queryByRole('option', { name: '设计评审' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('option', { name: '需求同步' }));

    expect(onChange).toHaveBeenCalledWith('sync', options[1]);
    await waitFor(() => expect(input).toHaveValue('需求同步'));
  });

  it('supports keyboard navigation and skips disabled options', () => {
    const onChange = vi.fn();
    render(
      <Combobox
        options={options}
        value={null}
        onChange={onChange}
        autoHighlight={false}
      />,
    );

    const input = screen.getByRole('combobox');
    fireEvent.focus(input);
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onChange).toHaveBeenCalledWith('sync', options[1]);
  });

  it('commits a custom value when no option matches', () => {
    const onChange = vi.fn();
    const onCreateOption = vi.fn();
    render(
      <Combobox
        options={options}
        value={null}
        allowCustomValue
        onChange={onChange}
        onCreateOption={onCreateOption}
      />,
    );

    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: '临时事项' } });

    fireEvent.click(screen.getByRole('option', { name: '临时事项' }));

    expect(onCreateOption).toHaveBeenCalledWith('临时事项');
    expect(onChange).toHaveBeenCalledWith('临时事项', null);
  });

  it('supports externally filtered asynchronous options', () => {
    const onInputValueChange = vi.fn();
    render(
      <Combobox
        options={[]}
        value={null}
        filterOptions={false}
        loading
        onChange={() => undefined}
        onInputValueChange={onInputValueChange}
      />,
    );

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'camera' } });

    expect(onInputValueChange).toHaveBeenCalledWith('camera');
    expect(screen.getByText('加载中...')).toBeInTheDocument();
  });

  it('positions the listbox portal from the editable control', () => {
    render(<Combobox options={options} value={null} onChange={() => undefined} />);

    const input = screen.getByRole('combobox');
    const root = input.closest('[data-ui="combobox"]')!;
    vi.spyOn(root, 'getBoundingClientRect').mockReturnValue({
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

    fireEvent.focus(input);

    expect(screen.getByTestId('combobox-dropdown')).toHaveStyle({
      left: '80px',
      top: '146px',
      visibility: 'visible',
      width: '220px',
    });
  });
});
