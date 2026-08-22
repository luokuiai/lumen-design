import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Slider } from '../components/Slider';

describe('Slider', () => {
  it('supports uncontrolled values and formatting', () => {
    const onChange = vi.fn();
    render(
      <Slider
        aria-label="告警阈值"
        defaultValue={30}
        formatValue={(value) => `${value}%`}
        showValue
        onChange={onChange}
      />,
    );

    const slider = screen.getByRole('slider', { name: '告警阈值' });
    expect(slider).toHaveValue('30');
    expect(screen.getByText('30%')).toBeVisible();
    fireEvent.change(slider, { target: { value: '45' } });
    expect(slider).toHaveValue('45');
    expect(onChange).toHaveBeenCalledWith(45);
  });

  it('clamps controlled values to its range', () => {
    render(<Slider aria-label="范围" min={10} max={20} value={30} />);

    expect(screen.getByRole('slider', { name: '范围' })).toHaveValue('20');
  });
});
