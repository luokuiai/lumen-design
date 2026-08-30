import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Select } from '../components/Select';

const options = [
  { label: '项目一', value: 'one' },
  { label: '项目二', value: 'two' },
];

describe('Select', () => {
  it('uses compact option padding with visible spacing between items', () => {
    render(
      <Select
        options={options}
        value={null}
        onChange={() => undefined}
      />,
    );

    fireEvent.click(screen.getByTestId('select-trigger'));
    const option = document.querySelector('[data-ui="select-option"]');

    expect(option).toHaveClass('py-2', 'pl-2.5', 'pr-2');
    expect(option?.parentElement).toHaveClass('flex', 'flex-col', 'gap-1');
  });
});
