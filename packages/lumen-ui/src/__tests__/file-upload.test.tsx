import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { FileUpload } from '../components/FileUpload';

describe('FileUpload', () => {
  it('selects files through the native input', () => {
    const onChange = vi.fn();
    const file = new File(['report'], 'report.pdf', {
      type: 'application/pdf',
    });
    const { container } = render(
      <FileUpload
        value={[]}
        onChange={onChange}
        accept=".pdf"
        inputAriaLabel="Upload report"
      />,
    );

    fireEvent.change(container.querySelector('input[type="file"]')!, {
      target: { files: [file] },
    });

    expect(onChange).toHaveBeenCalledWith([file]);
  });

  it('reports rejected files', () => {
    const onChange = vi.fn();
    const onReject = vi.fn();
    const file = new File(['too large'], 'notes.txt', { type: 'text/plain' });
    const { container } = render(
      <FileUpload
        value={[]}
        onChange={onChange}
        maxSize={2}
        onReject={onReject}
      />,
    );

    fireEvent.change(container.querySelector('input[type="file"]')!, {
      target: { files: [file] },
    });

    expect(onChange).not.toHaveBeenCalled();
    expect(onReject).toHaveBeenCalledWith([
      expect.objectContaining({ file, reason: 'size' }),
    ]);
  });

  it('renders selected files and removes them', () => {
    const onChange = vi.fn();
    const file = new File(['report'], 'report.pdf', {
      type: 'application/pdf',
    });
    render(<FileUpload value={[file]} onChange={onChange} />);

    expect(screen.getByText('report.pdf')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '移除 report.pdf' }));
    expect(onChange).toHaveBeenCalledWith([]);
  });
});
