import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { SearchBar } from '../components/search-bar/SearchBar';

describe('SearchBar', () => {
  it('supports typing, submitting, and clearing an uncontrolled value', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onSearch = vi.fn();
    const onClear = vi.fn();
    render(<SearchBar aria-label="站内搜索" onChange={onChange} onSearch={onSearch} onClear={onClear} />);

    const input = screen.getByRole('searchbox', { name: '站内搜索' });
    await user.type(input, 'Lumen{Enter}');

    expect(onChange).toHaveBeenLastCalledWith('Lumen');
    expect(onSearch).toHaveBeenCalledWith('Lumen');
    await user.click(screen.getByRole('button', { name: '清除' }));
    expect(input).toHaveValue('');
    expect(onClear).toHaveBeenCalledOnce();
    expect(input).toHaveFocus();
  });

  it('does not mutate a controlled value', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<SearchBar aria-label="搜索" value="固定值" onChange={onChange} />);

    const input = screen.getByRole('searchbox', { name: '搜索' });
    await user.type(input, 'A');

    expect(onChange).toHaveBeenCalledWith('固定值A');
    expect(input).toHaveValue('固定值');
  });

  it('shows loading state instead of the clear action', () => {
    render(<SearchBar aria-label="搜索" defaultValue="关键词" loading />);

    expect(screen.getByRole('search')).toHaveAttribute('data-loading', 'true');
    expect(screen.getByLabelText('加载中')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '清除' })).not.toBeInTheDocument();
  });

  it('clears with Escape unless the keyboard event is prevented', async () => {
    const user = userEvent.setup();
    const onClear = vi.fn();
    render(<SearchBar aria-label="搜索" defaultValue="关键词" onClear={onClear} />);

    await user.type(screen.getByRole('searchbox'), '{Escape}');

    expect(screen.getByRole('searchbox')).toHaveValue('');
    expect(onClear).toHaveBeenCalledOnce();
  });
});
