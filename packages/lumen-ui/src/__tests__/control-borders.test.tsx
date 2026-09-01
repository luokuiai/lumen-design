import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Badge } from '../components/Badge';
import { Checkbox } from '../components/Checkbox';
import { FileUpload } from '../components/FileUpload';
import { Input } from '../components/Input';
import { Radio } from '../components/Radio';
import { Textarea } from '../components/Textarea';
import { TimePicker } from '../components/TimePicker';

const standardBorderClassName = 'border-[var(--lumen-color-border)]';

describe('control borders', () => {
  it('uses the standard border token for resting controls', () => {
    render(
      <>
        <Input aria-label="Name" />
        <Input aria-label="Search" prefix={<span>Prefix</span>} />
        <Textarea aria-label="Notes" />
        <TimePicker value="" onChange={() => undefined} />
        <Checkbox aria-label="Enable" />
        <Radio aria-label="Choose" />
        <Badge variant="outline">Status</Badge>
        <FileUpload value={[]} onChange={() => undefined} />
      </>,
    );

    expect(screen.getByRole('textbox', { name: 'Name' })).toHaveClass(
      standardBorderClassName,
    );
    expect(screen.getByRole('textbox', { name: 'Search' }).parentElement).toHaveClass(
      standardBorderClassName,
    );
    expect(screen.getByRole('textbox', { name: 'Notes' })).toHaveClass(
      standardBorderClassName,
    );
    expect(screen.getByRole('button', { name: '请选择时间' })).toHaveClass(
      standardBorderClassName,
    );
    expect(screen.getByRole('checkbox', { name: 'Enable' }).nextElementSibling).toHaveClass(
      standardBorderClassName,
    );
    expect(screen.getByRole('radio', { name: 'Choose' }).nextElementSibling).toHaveClass(
      standardBorderClassName,
    );
    expect(screen.getByText('Status')).toHaveClass(standardBorderClassName);
    expect(screen.getByRole('button', { name: '文件上传' })).toHaveClass(
      standardBorderClassName,
    );
  });
});
