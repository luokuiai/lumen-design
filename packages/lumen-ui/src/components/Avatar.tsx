import React, { useState } from 'react';
import { User } from 'lucide-react';
import { cn } from './classNames';
import { radiusTokens } from './designTokens';

export type AvatarSize = 'sm' | 'md' | 'lg';
export type AvatarShape = 'circle' | 'rounded';

export interface AvatarProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'> {
  src?: string;
  alt?: string;
  name?: string;
  fallback?: React.ReactNode;
  size?: AvatarSize;
  shape?: AvatarShape;
  imageProps?: Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'alt' | 'src'>;
}

const sizeClasses: Record<AvatarSize, string> = {
  sm: 'h-8 w-8 text-[11px]',
  md: 'h-10 w-10 text-[13px]',
  lg: 'h-12 w-12 text-[16px]',
};

const iconSizes: Record<AvatarSize, number> = {
  sm: 14,
  md: 17,
  lg: 20,
};

const getInitials = (name: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0]}${parts.at(-1)![0]}`.toUpperCase();
};

export const Avatar = React.forwardRef<HTMLSpanElement, AvatarProps>(
  (
    {
      src,
      alt,
      name,
      fallback,
      size = 'md',
      shape = 'circle',
      imageProps,
      className,
      role = 'img',
      'aria-label': ariaLabel,
      ...props
    },
    ref,
  ) => {
    const [failedSrc, setFailedSrc] = useState<string | null>(null);
    const showImage = Boolean(src && failedSrc !== src);
    const {
      className: imageClassName,
      onError: onImageError,
      ...restImageProps
    } = imageProps ?? {};
    const initials = name ? getInitials(name) : '';

    return (
      <span
        ref={ref}
        role={role}
        aria-label={ariaLabel ?? alt ?? name ?? 'Avatar'}
        className={cn(
          'relative inline-flex shrink-0 select-none items-center justify-center overflow-hidden border border-[var(--lumen-color-border)] bg-[var(--lumen-color-surface-muted)] font-medium text-[var(--lumen-color-text-muted)]',
          sizeClasses[size],
          shape === 'circle' ? 'rounded-full' : radiusTokens.icon,
          className,
        )}
        {...props}
      >
        {showImage ? (
          <img
            {...restImageProps}
            src={src}
            alt=""
            aria-hidden="true"
            draggable={false}
            className={cn('h-full w-full object-cover', imageClassName)}
            onError={(event) => {
              setFailedSrc(src ?? null);
              onImageError?.(event);
            }}
          />
        ) : (
          fallback ??
          (initials || <User size={iconSizes[size]} aria-hidden="true" />)
        )}
      </span>
    );
  },
);

Avatar.displayName = 'Avatar';
