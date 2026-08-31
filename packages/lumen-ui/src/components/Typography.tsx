import React from 'react';
import { cn } from './classNames';

export type TypographyVariant =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'body'
  | 'body-sm'
  | 'caption';

export type TypographyTone =
  | 'strong'
  | 'default'
  | 'secondary'
  | 'muted'
  | 'placeholder'
  | 'inherit';

export interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  variant?: TypographyVariant;
  tone?: TypographyTone;
  as?: React.ElementType;
}

export const typographyVariantClassNames: Record<TypographyVariant, string> = {
  h1: 'm-0 text-[22px] font-medium leading-[30px]',
  h2: 'm-0 text-[20px] font-medium leading-7',
  h3: 'm-0 text-[18px] font-medium leading-[26px]',
  h4: 'm-0 text-[16px] font-medium leading-6',
  h5: 'm-0 text-[15px] font-medium leading-[22px]',
  h6: 'm-0 text-[14px] font-medium leading-5',
  body: 'm-0 text-[14px] font-normal leading-[22px]',
  'body-sm': 'm-0 text-[13px] font-normal leading-5',
  caption: 'm-0 text-[12px] font-normal leading-[18px]',
};

const typographyToneClassNames: Record<TypographyTone, string> = {
  strong: 'text-[var(--lumen-color-text-strong)]',
  default: 'text-[var(--lumen-color-text)]',
  secondary: 'text-[var(--lumen-color-text-secondary)]',
  muted: 'text-[var(--lumen-color-text-muted)]',
  placeholder: 'text-[var(--lumen-color-text-placeholder)]',
  inherit: 'text-inherit',
};

const typographyElementByVariant: Record<TypographyVariant, React.ElementType> = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  h5: 'h5',
  h6: 'h6',
  body: 'p',
  'body-sm': 'p',
  caption: 'span',
};

const isHeadingVariant = (variant: TypographyVariant) => variant.startsWith('h');

export const Typography = React.forwardRef<HTMLElement, TypographyProps>(
  (
    {
      variant = 'body',
      tone,
      as,
      className,
      ...props
    },
    ref,
  ) => {
    const Component = as ?? typographyElementByVariant[variant];
    const resolvedTone = tone ?? (isHeadingVariant(variant) ? 'strong' : 'default');

    return (
      <Component
        {...props}
        ref={ref}
        data-ui="typography"
        data-variant={variant}
        className={cn(
          typographyVariantClassNames[variant],
          typographyToneClassNames[resolvedTone],
          className,
        )}
      />
    );
  },
);

Typography.displayName = 'Typography';
