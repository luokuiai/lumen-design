import React from 'react';
import { cn } from './classNames';

export type ScrollbarOrientation = 'vertical' | 'horizontal' | 'both';
export type ScrollbarSize = 'sm' | 'md';

export interface ScrollbarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 可滚动方向 */
  orientation?: ScrollbarOrientation;
  /** 滚动条粗细 */
  size?: ScrollbarSize;
  /** 仅在悬停或获得焦点时显示滑块 */
  autoHide?: boolean;
}

const orientationClassNames: Record<ScrollbarOrientation, string> = {
  vertical: 'overflow-x-hidden overflow-y-auto',
  horizontal: 'overflow-x-auto overflow-y-hidden',
  both: 'overflow-auto',
};

export const Scrollbar = React.forwardRef<HTMLDivElement, ScrollbarProps>(
  (
    {
      orientation = 'vertical',
      size = 'md',
      autoHide = false,
      className,
      tabIndex = 0,
      ...props
    },
    ref,
  ) => (
    <div
      ref={ref}
      data-ui="scrollbar"
      data-orientation={orientation}
      data-size={size}
      data-auto-hide={autoHide || undefined}
      tabIndex={tabIndex}
      className={cn(
        'lumen-scrollbar overscroll-contain',
        orientationClassNames[orientation],
        className,
      )}
      {...props}
    />
  ),
);

Scrollbar.displayName = 'Scrollbar';
