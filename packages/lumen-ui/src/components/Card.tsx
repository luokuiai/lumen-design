import React from 'react';
import { cn } from './classNames';

export type CardVariant = 'elevated' | 'outlined' | 'subtle';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
}

const cardVariantClassNames: Record<CardVariant, string> = {
  elevated:
    'border-[var(--lumen-color-border)] bg-[var(--lumen-color-surface)] shadow-[var(--lumen-shadow-card)]',
  outlined:
    'border-[var(--lumen-color-border)] bg-[var(--lumen-color-surface)]',
  subtle:
    'border-[var(--lumen-color-surface-muted)] bg-[var(--lumen-color-surface-muted)]',
};

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'elevated', className, ...props }, ref) => (
    <div
      ref={ref}
      data-ui="card"
      data-variant={variant}
      className={cn(
        'min-w-0 overflow-hidden rounded-[var(--lumen-radius-card)] border',
        cardVariantClassNames[variant],
        className,
      )}
      {...props}
    />
  ),
);

Card.displayName = 'Card';

export const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-ui="card-header"
    className={cn(
      'flex min-w-0 items-start justify-between gap-3 px-5 py-4 pad:px-6',
      className,
    )}
    {...props}
  />
));

CardHeader.displayName = 'CardHeader';

export const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    data-ui="card-title"
    className={cn(
      'm-0 text-[15px] font-medium text-[var(--lumen-color-text-strong)]',
      className,
    )}
    {...props}
  />
));

CardTitle.displayName = 'CardTitle';

export const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    data-ui="card-description"
    className={cn(
      'mt-1 text-[13px] leading-5 text-[var(--lumen-color-text-muted)]',
      className,
    )}
    {...props}
  />
));

CardDescription.displayName = 'CardDescription';

export const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-ui="card-content"
    className={cn('min-w-0 p-5 pad:p-6', className)}
    {...props}
  />
));

CardContent.displayName = 'CardContent';

export const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-ui="card-footer"
    className={cn(
      'flex min-w-0 items-center justify-end gap-2 border-t border-[var(--lumen-color-surface-muted)] px-5 py-4 pad:px-6',
      className,
    )}
    {...props}
  />
));

CardFooter.displayName = 'CardFooter';
