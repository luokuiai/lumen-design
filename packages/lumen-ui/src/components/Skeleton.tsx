import React from 'react';
import { cn } from './classNames';
import { radiusTokens } from './designTokens';

export type SkeletonVariant = 'text' | 'rectangular' | 'circular';
export type SkeletonAnimation = 'pulse' | 'none';

export interface SkeletonProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'> {
  variant?: SkeletonVariant;
  animation?: SkeletonAnimation;
  width?: React.CSSProperties['width'];
  height?: React.CSSProperties['height'];
}

const variantClasses: Record<SkeletonVariant, string> = {
  text: 'h-4 w-full rounded-[var(--lumen-radius-tag)]',
  rectangular: `h-4 w-full ${radiusTokens.card}`,
  circular: 'h-10 w-10 shrink-0 rounded-full',
};

export const Skeleton = React.forwardRef<HTMLSpanElement, SkeletonProps>(
  (
    {
      variant = 'text',
      animation = 'pulse',
      width,
      height,
      className,
      style,
      'aria-hidden': ariaHidden = true,
      ...props
    },
    ref,
  ) => (
    <span
      ref={ref}
      aria-hidden={ariaHidden}
      data-animation={animation}
      data-lumen-motion={animation === 'pulse' ? '' : undefined}
      className={cn(
        'lumen-skeleton block overflow-hidden bg-[var(--lumen-color-surface-muted)]',
        variantClasses[variant],
        className,
      )}
      style={{
        ...style,
        ...(width !== undefined ? { width } : {}),
        ...(height !== undefined ? { height } : {}),
      }}
      {...props}
    />
  ),
);

Skeleton.displayName = 'Skeleton';
