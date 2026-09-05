import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { Calendar } from '../components/calendar/Calendar';
import { CommandPalette } from '../components/command-palette/CommandPalette';
import { DataTable } from '../components/DataTable';
import { DatePicker } from '../components/DatePicker';
import { Empty } from '../components/Empty';
import { FileUpload } from '../components/FileUpload';
import { LumenProvider } from '../components/LumenProvider';
import { NumberInput } from '../components/number-input/NumberInput';
import { Select } from '../components/Select';
import { Spinner } from '../components/Spinner';
import { TimePicker } from '../components/TimePicker';
import { Toast } from '../components/Toast';
import { Transfer } from '../components/Transfer';
import { enUS } from '../i18n';

afterEach(() => Toast.resetForTests());

describe('LumenProvider locale', () => {
  it('localizes visible and accessible component defaults', () => {
    render(
      <LumenProvider locale={enUS}>
        <Empty />
        <Spinner />
        <NumberInput defaultValue={1} />
        <Select options={[]} value={null} onChange={() => undefined} />
        <Calendar value="2026-09-05" onChange={() => undefined} />
      </LumenProvider>,
    );

    expect(screen.getByText('No data')).toBeVisible();
    expect(screen.getByRole('status')).toHaveTextContent('Loading');
    expect(screen.getByRole('button', { name: 'Increase' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Select' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Previous month' })).toBeVisible();
    expect(screen.getByRole('grid', { name: 'September 2026' })).toBeVisible();
  });

  it('keeps component text props above the provider locale', () => {
    render(
      <LumenProvider locale={enUS}>
        <Empty title="Nothing here" />
        <Select
          options={[]}
          value={null}
          placeholder="Choose a project"
          onChange={() => undefined}
        />
      </LumenProvider>,
    );

    expect(screen.getByText('Nothing here')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Choose a project' })).toBeVisible();
  });

  it('localizes picker and command defaults', () => {
    render(
      <LumenProvider locale={enUS}>
        <DatePicker value="" onChange={() => undefined} />
        <TimePicker value="" onChange={() => undefined} />
        <CommandPalette open onOpenChange={() => undefined} groups={[]} />
      </LumenProvider>,
    );

    expect(screen.getByRole('button', { name: 'Select date' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Select time' })).toBeVisible();
    expect(screen.getByRole('dialog', { name: 'Command palette' })).toBeVisible();
    expect(screen.getByRole('combobox', { name: 'Search commands...' })).toBeVisible();
  });

  it('localizes upload, transfer, and table defaults', () => {
    render(
      <LumenProvider locale={enUS}>
        <FileUpload value={[]} onChange={() => undefined} />
        <Transfer items={[]} targetKeys={[]} onChange={() => undefined} />
        <DataTable columns={[]} data={[]} getRowKey={() => 'row'} />
      </LumenProvider>,
    );

    expect(screen.getByRole('button', { name: 'Upload files' })).toBeVisible();
    expect(screen.getByText('Available')).toBeVisible();
    expect(screen.getByText('Selected')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Move right' })).toBeVisible();
    expect(screen.getAllByText('No data')).toHaveLength(3);
  });

  it('uses the provider locale for static toast calls', async () => {
    render(
      <LumenProvider locale={enUS}>
        <button type="button" onClick={() => Toast.success('Saved')}>Notify</button>
      </LumenProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Notify' }));

    expect(await screen.findByText('Success')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Close notification' })).toBeVisible();
  });
});
