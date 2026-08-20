import { type ReactNode } from 'react';
import { cn } from './classNames';

type BadgeSize = 'sm' | 'md' | 'lg';
type BadgeVariant = 'default' | 'outline';
type BadgeShape = 'pill' | 'square';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  shape?: BadgeShape;
  className?: string;
}

const sizeClasses: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-[11px]',
  md: 'px-2.5 py-1 text-[12px]',
  lg: 'px-3 py-1.5 text-[13px]',
};

const shapeClasses: Record<BadgeShape, string> = {
  pill: 'rounded-full',
  square: 'rounded-[4px]',
};

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  shape = 'pill',
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'app-badge inline-flex items-center whitespace-nowrap',
        sizeClasses[size],
        shapeClasses[shape],
        variant === 'outline' && 'border',
        className,
      )}
    >
      {children}
    </span>
  );
}

export type { BadgeProps, BadgeShape, BadgeSize, BadgeVariant };
