import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DatePicker } from '../components/DatePicker';
import { DateTimePicker } from '../components/DateTimePicker';
import { Select } from '../components/Select';
import { TimePicker } from '../components/TimePicker';
import { TreeSelect } from '../components/TreeSelect';

describe('interactive cursors', () => {
  it('shows a pointer cursor on select and picker triggers', () => {
    render(
      <>
        <Select
          aria-label="Project"
          options={[{ label: 'Lumen', value: 'lumen' }]}
          value={null}
          onChange={() => undefined}
        />
        <TreeSelect
          nodes={[{ id: 'frontend', label: 'Frontend' }]}
          value={null}
          onChange={() => undefined}
          getValue={(node) => node.id}
          getLabel={(node) => node.label}
        />
        <DatePicker
          value=""
          triggerAriaLabel="Date"
          onChange={() => undefined}
        />
        <TimePicker value="" placeholder="Time" onChange={() => undefined} />
        <DateTimePicker
          value=""
          label="Date and time"
          onChange={() => undefined}
        />
      </>,
    );

    expect(screen.getByTestId('select-trigger')).toHaveClass('cursor-pointer');
    expect(screen.getByTestId('tree-select-trigger')).toHaveClass('cursor-pointer');
    expect(screen.getByRole('button', { name: 'Date' })).toHaveClass('cursor-pointer');
    expect(screen.getByRole('button', { name: 'Time' })).toHaveClass('cursor-pointer');
    expect(screen.getByRole('button', { name: 'Date and time' })).toHaveClass(
      'cursor-pointer',
    );
  });
});
