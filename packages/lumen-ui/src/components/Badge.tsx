import { type ReactNode } from 'react';
import { cn } from './classNames';
import { semanticBadgeToneClassNames } from './designTokens';

type BadgeSize = 'sm' | 'md' | 'lg';
type BadgeTone = keyof typeof semanticBadgeToneClassNames;
type BadgeVariant = 'default' | 'outline' | BadgeTone;
type BadgeShape = 'pill' | 'square';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  shape?: BadgeShape;
  className?: string;
}

const sizeClasses: Record<BadgeSize, string> = {
  sm: 'h-5 px-2 text-[12px]',
  md: 'h-[26px] px-2.5 text-[13px]',
  lg: 'h-[30px] px-3 text-[14px]',
};

const shapeClasses: Record<BadgeShape, string> = {
  pill: 'rounded-full',
  square: 'rounded-[4px]',
};

const variantClasses: Record<BadgeVariant, string> = {
  default: `border-transparent ${semanticBadgeToneClassNames.info}`,
  neutral: `border-transparent ${semanticBadgeToneClassNames.neutral}`,
  info: `border-transparent ${semanticBadgeToneClassNames.info}`,
  success: `border-transparent ${semanticBadgeToneClassNames.success}`,
  warning: `border-transparent ${semanticBadgeToneClassNames.warning}`,
  danger: `border-transparent ${semanticBadgeToneClassNames.danger}`,
  outline:
    'border-[var(--lumen-color-border-hover)] bg-[var(--lumen-color-surface)] text-[var(--lumen-color-text-secondary)]',
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
        'inline-flex items-center whitespace-nowrap border font-normal leading-none',
        sizeClasses[size],
        shapeClasses[shape],
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}

export type { BadgeProps, BadgeShape, BadgeSize, BadgeTone, BadgeVariant };
