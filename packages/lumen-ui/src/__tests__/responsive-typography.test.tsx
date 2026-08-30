import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Button } from '../components/Button';
import { DatePicker } from '../components/DatePicker';
import { DateTimePicker } from '../components/DateTimePicker';
import { FormField } from '../components/FormField';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { Switch } from '../components/Switch';
import { Textarea } from '../components/Textarea';
import { TimePicker } from '../components/TimePicker';
import { TreeSelect } from '../components/TreeSelect';

const controlSizes = [
  ['sm', 'h-[var(--lumen-control-height-sm)]', 'min-h-[var(--lumen-control-height-sm)]', 'px-3', 'px-2.5'],
  ['md', 'h-[var(--lumen-control-height-md)]', 'min-h-[var(--lumen-control-height-md)]', 'px-4', 'px-3'],
  ['lg', 'h-[var(--lumen-control-height-lg)]', 'min-h-[var(--lumen-control-height-lg)]', 'px-5', 'px-3.5'],
] as const;

describe.each(controlSizes)('%s control sizing', (size, heightClass, minHeightClass, buttonPadding, controlPadding) => {
  it('keeps buttons, inputs, and picker triggers aligned', () => {
    render(
      <>
        <Button size={size}>操作</Button>
        <Input size={size} aria-label="名称" />
        <Select
          size={size}
          options={[{ label: '项目一', value: 'one' }]}
          value={null}
          onChange={() => undefined}
          aria-label="选择项目"
        />
        <TreeSelect
          size={size}
          nodes={[{ label: '节点一', value: 'one' }]}
          value={null}
          onChange={() => undefined}
          getValue={(node) => node.value}
          getLabel={(node) => node.label}
          placeholder="选择节点"
        />
        <DatePicker
          size={size}
          value=""
          onChange={() => undefined}
          triggerAriaLabel="选择日期"
        />
        <TimePicker
          size={size}
          value=""
          onChange={() => undefined}
          placeholder="选择时间"
        />
        <DateTimePicker
          size={size}
          value=""
          onChange={() => undefined}
          label="选择日期时间"
        />
      </>,
    );

    expect(screen.getByRole('button', { name: '操作' })).toHaveClass(
      heightClass,
      buttonPadding,
    );
    expect(screen.getByRole('textbox', { name: '名称' })).toHaveClass(heightClass, controlPadding);
    expect(screen.getByTestId('select-trigger')).toHaveClass(minHeightClass, controlPadding);
    expect(screen.getByTestId('tree-select-trigger')).toHaveClass(minHeightClass, controlPadding);
    expect(screen.getByRole('button', { name: '选择日期' })).toHaveClass(heightClass, controlPadding);
    expect(screen.getByRole('button', { name: '选择时间' })).toHaveClass(heightClass, controlPadding);
    expect(screen.getByRole('button', { name: '选择日期时间' })).toHaveClass(heightClass, controlPadding);
  });
});

describe('responsive typography', () => {
  it('reserves equal label metrics for required and optional fields', () => {
    render(
      <>
        <FormField label="必填字段" required>
          <Input aria-label="必填输入" />
        </FormField>
        <FormField label="可选字段">
          <Input aria-label="可选输入" />
        </FormField>
      </>,
    );

    const indicators = screen.getAllByText('*');
    expect(indicators[0]).toHaveClass('opacity-100');
    expect(indicators[1]).toHaveClass('opacity-0');
    expect(indicators[0]).toHaveAttribute('aria-hidden', 'true');
    expect(indicators[1]).toHaveAttribute('aria-hidden', 'true');
  });

  it('uses readable default text across primary controls', async () => {
    const user = userEvent.setup();
    render(
      <>
        <Button>提交</Button>
        <Select
          options={[{ label: '项目一', value: 'one' }]}
          value={null}
          onChange={() => undefined}
          placeholder="选择项目"
        />
        <TreeSelect
          nodes={[{ label: '节点一', value: 'one' }]}
          value={null}
          onChange={() => undefined}
          getValue={(node) => node.value}
          getLabel={(node) => node.label}
          placeholder="选择节点"
        />
        <DatePicker
          value=""
          onChange={() => undefined}
          triggerAriaLabel="选择日期"
        />
        <TimePicker
          value=""
          onChange={() => undefined}
          placeholder="选择时间"
        />
      </>,
    );

    expect(screen.getByRole('button', { name: '提交' })).toHaveClass('text-[14px]');
    expect(screen.getByTestId('select-trigger')).toHaveClass('text-[14px]');
    expect(screen.getByTestId('tree-select-trigger')).toHaveClass('text-[14px]');
    expect(screen.getByRole('button', { name: '选择日期' })).toHaveClass('text-[14px]');
    expect(screen.getByRole('button', { name: '选择时间' })).toHaveClass('text-[14px]');

    await user.click(screen.getByTestId('tree-select-trigger'));
    expect(screen.getByTestId('tree-select-option-one').parentElement).toHaveClass(
      'text-[14px]',
    );
  });

  it('keeps editable text at 16px on mobile and 14px on wider screens', () => {
    render(
      <>
        <Input aria-label="名称" />
        <Textarea aria-label="备注" />
      </>,
    );

    expect(screen.getByRole('textbox', { name: '名称' })).toHaveClass(
      'text-[14px]',
      'mobile:text-[16px]',
    );
    expect(screen.getByRole('textbox', { name: '备注' })).toHaveClass(
      'text-[14px]',
      'mobile:text-[16px]',
    );
  });
});

describe('compact Switch', () => {
  it('uses a shorter medium track and toggles through its label', async () => {
    const user = userEvent.setup();
    render(<Switch label="开启提醒" />);

    const control = screen.getByRole('switch');
    const track = document.querySelector('[data-switch-track]');
    const knob = document.querySelector('[data-switch-knob]');

    expect(track).toHaveClass('h-[22px]', 'w-10');
    expect(knob).toHaveClass('h-[18px]', 'w-[18px]');

    await user.click(screen.getByText('开启提醒'));

    expect(control).toBeChecked();
    expect(knob).toHaveClass('translate-x-[18px]');
  });
});
