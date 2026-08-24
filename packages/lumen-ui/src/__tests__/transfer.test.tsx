import React, { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Transfer, type TransferItem } from '../components/Transfer';

const items: TransferItem[] = [
  { key: 'camera', label: '摄像机' },
  { key: 'radar', label: '雷达' },
  { key: 'weather', label: '气象站', disabled: true },
];

describe('Transfer', () => {
  it('keeps the transfer panels horizontal on tablet and desktop breakpoints', () => {
    const { container } = render(
      <Transfer items={items} targetKeys={[]} onChange={() => undefined} />,
    );

    expect(container.firstElementChild).toHaveClass(
      'pad:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]',
      'l:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]',
    );
  });

  it('moves selected source items through its controlled API', () => {
    const onChange = vi.fn();
    render(<Transfer items={items} targetKeys={['radar']} onChange={onChange} />);

    fireEvent.click(screen.getByRole('checkbox', { name: '摄像机' }));
    fireEvent.click(screen.getByRole('button', { name: '移到右侧' }));
    expect(onChange).toHaveBeenCalledWith(['radar', 'camera']);
  });

  it('filters panel items and completes a controlled move', () => {
    const Example = () => {
      const [targetKeys, setTargetKeys] = useState<React.Key[]>([]);
      return <Transfer items={items} targetKeys={targetKeys} onChange={setTargetKeys} />;
    };
    render(<Example />);

    fireEvent.change(screen.getByRole('textbox', { name: '可选列表搜索' }), {
      target: { value: '雷达' },
    });
    expect(screen.getByRole('checkbox', { name: '雷达' })).toBeVisible();
    expect(screen.queryByRole('checkbox', { name: '摄像机' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('checkbox', { name: '雷达' }));
    fireEvent.click(screen.getByRole('button', { name: '移到右侧' }));
    expect(screen.getByRole('checkbox', { name: '雷达' })).toBeVisible();
  });
});
