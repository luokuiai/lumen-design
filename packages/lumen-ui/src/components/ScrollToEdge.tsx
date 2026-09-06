import React, { useCallback, useEffect, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useLumenLocale } from '../i18n';
import { Button } from './Button';
import { cn } from './classNames';
import {
  floatingButtonIconSizeTokens,
  type ButtonSize,
  type ButtonVariant,
} from './designTokens';

export type ScrollToEdgeDirection = 'top' | 'bottom';
export type ScrollToEdgePosition = 'fixed' | 'absolute' | 'static';

export interface ScrollToEdgeProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  direction?: ScrollToEdgeDirection;
  containerRef?: React.RefObject<HTMLElement | null>;
  threshold?: number;
  behavior?: ScrollBehavior;
  position?: ScrollToEdgePosition;
  offset?: number | string;
  safeArea?: boolean;
  alwaysVisible?: boolean;
  icon?: React.ReactNode;
  label?: string;
  size?: ButtonSize;
  variant?: ButtonVariant;
}

const toCssLength = (value: number | string) =>
  typeof value === 'number' ? `${value}px` : value;

const getScrollMetrics = (container?: HTMLElement | null) => {
  if (container) {
    return {
      position: container.scrollTop,
      viewport: container.clientHeight,
      extent: container.scrollHeight,
    };
  }

  const root = document.scrollingElement ?? document.documentElement;
  return {
    position: window.scrollY || root.scrollTop,
    viewport: window.innerHeight,
    extent: root.scrollHeight,
  };
};

export const ScrollToEdge: React.FC<ScrollToEdgeProps> = (
    {
      direction = 'top',
      containerRef,
      threshold = 200,
      behavior = 'smooth',
      position = 'fixed',
      offset = 16,
      safeArea = true,
      alwaysVisible = false,
      icon,
      label,
      size = 'md',
      variant = 'secondary',
      className,
      style,
      onClick,
      tabIndex,
      ...props
    },
  ) => {
    const locale = useLumenLocale();
    const [visible, setVisible] = useState(alwaysVisible);

    const updateVisibility = useCallback(() => {
      if (alwaysVisible) {
        setVisible(true);
        return;
      }

      const { position: scrollPosition, viewport, extent } = getScrollMetrics(
        containerRef?.current,
      );
      const distance = direction === 'top'
        ? scrollPosition
        : Math.max(0, extent - viewport - scrollPosition);
      setVisible(distance > Math.max(0, threshold));
    }, [alwaysVisible, containerRef, direction, threshold]);

    useEffect(() => {
      const target = containerRef?.current ?? window;
      updateVisibility();
      target.addEventListener('scroll', updateVisibility, { passive: true });
      window.addEventListener('resize', updateVisibility);
      return () => {
        target.removeEventListener('scroll', updateVisibility);
        window.removeEventListener('resize', updateVisibility);
      };
    }, [containerRef, updateVisibility]);

    const offsetValue = toCssLength(offset);
    const resolvedLabel = label ?? (direction === 'top'
      ? locale.accessibility.scrollToTop ?? 'Scroll to top'
      : locale.accessibility.scrollToBottom ?? 'Scroll to bottom');
    const resolvedIcon = icon ?? (direction === 'top'
      ? <ChevronUp aria-hidden="true" size={19} />
      : <ChevronDown aria-hidden="true" size={19} />);

    return (
      <Button
        {...props}
        iconOnly
        icon={resolvedIcon}
        size={size}
        variant={variant}
        aria-label={resolvedLabel}
        aria-hidden={!visible || undefined}
        data-scroll-to-edge
        data-direction={direction}
        data-visible={visible || undefined}
        tabIndex={visible ? tabIndex : -1}
        className={cn(
          position,
          floatingButtonIconSizeTokens[size],
          'z-40 !rounded-full !border-0 shadow-[0_3px_10px_var(--lumen-color-shadow)] transition-[opacity,transform,box-shadow] duration-200',
          visible
            ? 'translate-y-0 opacity-100 hover:-translate-y-0.5 hover:shadow-[0_5px_16px_var(--lumen-color-shadow)]'
            : 'pointer-events-none translate-y-2 opacity-0',
          className,
        )}
        style={{
          ...(position === 'static' ? {} : {
            bottom: safeArea
              ? `calc(${offsetValue} + env(safe-area-inset-bottom))`
              : offsetValue,
            right: offsetValue,
          }),
          ...style,
        }}
        onClick={(event) => {
          onClick?.(event);
          if (event.defaultPrevented) return;
          const target = containerRef?.current;
          const scrollBehavior = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
            ? 'auto'
            : behavior;
          const top = direction === 'top'
            ? 0
            : getScrollMetrics(target).extent;
          if (target) target.scrollTo({ top, behavior: scrollBehavior });
          else window.scrollTo({ top, behavior: scrollBehavior });
        }}
      />
    );
  };
