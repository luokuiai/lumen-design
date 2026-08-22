import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { FileUpload } from '../components/FileUpload';

describe('FileUpload', () => {
  it('uses the reduced default height', () => {
    render(<FileUpload value={[]} onChange={() => undefined} />);

    expect(screen.getByRole('button', { name: '文件上传' })).toHaveClass(
      'py-3',
      'px-5',
      'border-2',
    );
  });

  it('keeps the compact trigger at its compact height', () => {
    render(
      <FileUpload
        density="compact"
        value={[]}
        onChange={() => undefined}
      />,
    );

    expect(screen.getByRole('button', { name: '文件上传' })).toHaveClass(
      'min-h-11',
      'px-3',
    );
  });
});
