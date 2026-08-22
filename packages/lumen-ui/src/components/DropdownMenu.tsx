import React, {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { cn } from './classNames';

interface DropdownMenuRenderState {
  open: boolean;
  menuId: string;
  close: () => void;
  toggle: () => void;
}

interface DropdownMenuContentState {
  open: boolean;
  close: () => void;
}

export type DropdownMenuAlign = 'auto' | 'left' | 'right';

export interface DropdownMenuProps {
  trigger: (state: DropdownMenuRenderState) => React.ReactNode;
  children:
    | React.ReactNode
    | ((state: DropdownMenuContentState) => React.ReactNode);
  className?: string;
  menuClassName?: string;
  align?: DropdownMenuAlign;
  closeDelayMs?: number;
  menuMode?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const DEFAULT_CLOSE_DELAY_MS = 120;
const OPEN_ANIMATION_DELAY_MS = 16;
const DROPDOWN_OPEN_EVENT = 'intelliconf-dropdown-menu-open';
type DropdownMenuPhase = 'closed' | 'opening' | 'open' | 'closing';

export const DropdownMenu: React.FC<DropdownMenuProps> = ({
  trigger,
  children,
  className,
  menuClassName,
  align = 'auto',
  closeDelayMs = DEFAULT_CLOSE_DELAY_MS,
  menuMode = false,
  onOpenChange,
}) => {
  const menuId = useId();
  const [phase, setPhase] = useState<DropdownMenuPhase>('closed');
  const [resolvedAlign, setResolvedAlign] = useState<'left' | 'right'>(
    align === 'right' ? 'right' : 'left',
  );
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({
    left: -9999,
    position: 'fixed',
    right: 'auto',
    top: -9999,
  });
  const closeTimerRef = useRef<ReturnType<typeof setTimeout>>(null);
  const openTimerRef = useRef<ReturnType<typeof setTimeout>>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerElementRef = useRef<HTMLElement | null>(null);
  const mounted = phase !== 'closed';
  const triggerOpen = phase === 'opening' || phase === 'open';

  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const clearOpenTimer = useCallback(() => {
    if (openTimerRef.current) {
      clearTimeout(openTimerRef.current);
      openTimerRef.current = null;
    }
  }, []);

  const openMenu = useCallback(() => {
    clearCloseTimer();
    clearOpenTimer();
    if (menuMode) {
      const activeElement = document.activeElement;
      triggerElementRef.current =
        activeElement instanceof HTMLElement &&
        containerRef.current?.contains(activeElement)
          ? activeElement
          : (containerRef.current?.querySelector<HTMLElement>(
              'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
            ) ?? null);
    }
    setPhase('opening');
    onOpenChange?.(true);
    window.dispatchEvent(new CustomEvent(DROPDOWN_OPEN_EVENT, { detail: menuId }));
  }, [clearCloseTimer, clearOpenTimer, menuId, menuMode, onOpenChange]);

  const closeMenuImmediately = useCallback(() => {
    clearCloseTimer();
    clearOpenTimer();
    setPhase('closed');
    onOpenChange?.(false);
  }, [clearCloseTimer, clearOpenTimer, onOpenChange]);

  const closeMenu = useCallback(() => {
    clearCloseTimer();
    clearOpenTimer();
    setPhase('closing');
    onOpenChange?.(false);
    if (menuMode) {
      triggerElementRef.current?.focus();
    }
    closeTimerRef.current = setTimeout(() => {
      setPhase('closed');
      closeTimerRef.current = null;
    }, closeDelayMs);
  }, [
    clearCloseTimer,
    clearOpenTimer,
    closeDelayMs,
    menuMode,
    onOpenChange,
  ]);

  const toggleMenu = useCallback(() => {
    if (triggerOpen) {
      closeMenu();
      return;
    }
    openMenu();
  }, [closeMenu, triggerOpen, openMenu]);

  const getMenuItems = useCallback(
    () =>
      Array.from(
        menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ??
          [],
      ).filter(
        (item) =>
          !item.hasAttribute('disabled') &&
          item.getAttribute('aria-disabled') !== 'true',
      ),
    [],
  );

  const handleMenuKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (!menuMode) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        closeMenu();
        return;
      }

      const menuItems = getMenuItems();
      if (menuItems.length === 0) return;

      const currentIndex = menuItems.indexOf(
        document.activeElement as HTMLElement,
      );
      let nextIndex: number | null = null;
      switch (event.key) {
        case 'ArrowDown':
          nextIndex = currentIndex < 0 ? 0 : (currentIndex + 1) % menuItems.length;
          break;
        case 'ArrowUp':
          nextIndex =
            currentIndex < 0
              ? menuItems.length - 1
              : (currentIndex - 1 + menuItems.length) % menuItems.length;
          break;
        case 'Home':
          nextIndex = 0;
          break;
        case 'End':
          nextIndex = menuItems.length - 1;
          break;
        default:
          return;
      }
      event.preventDefault();
      menuItems[nextIndex]?.focus();
    },
    [closeMenu, getMenuItems, menuMode],
  );

  const updateMenuPosition = useCallback(() => {
    if (!containerRef.current) return;

    const triggerElement = containerRef.current.firstElementChild;
    const triggerRect =
      triggerElement instanceof HTMLElement
        ? triggerElement.getBoundingClientRect()
        : containerRef.current.getBoundingClientRect();
    const measuredMenuWidth = menuRef.current?.offsetWidth || 200;
    const menuHeight = menuRef.current?.offsetHeight || 200;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const viewportPadding = 8;
    const verticalGap = 8;
    const menuWidth = Math.min(
      measuredMenuWidth,
      Math.max(0, viewportWidth - viewportPadding * 2),
    );

    const spaceToRight = viewportWidth - viewportPadding - triggerRect.left;
    const spaceToLeft = triggerRect.right - viewportPadding;
    const nextAlign =
      align === 'auto'
        ? spaceToRight >= menuWidth || spaceToRight >= spaceToLeft
          ? 'left'
          : 'right'
        : align;
    const preferredLeft =
      nextAlign === 'right' ? triggerRect.right - menuWidth : triggerRect.left;
    const maxLeft = Math.max(
      viewportPadding,
      viewportWidth - menuWidth - viewportPadding,
    );
    const left = Math.min(
      Math.max(viewportPadding, preferredLeft),
      maxLeft,
    );
    setResolvedAlign(nextAlign);

    let top = triggerRect.bottom + verticalGap;
    if (top + menuHeight > viewportHeight - viewportPadding) {
      const topPlacement = triggerRect.top - verticalGap - menuHeight;
      top =
        topPlacement >= viewportPadding
          ? topPlacement
          : Math.max(viewportPadding, viewportHeight - menuHeight - viewportPadding);
    }

    setMenuStyle({
      left,
      position: 'fixed',
      right: 'auto',
      top,
      maxWidth: `calc(100vw - ${viewportPadding * 2}px)`,
    });
  }, [align]);

  useEffect(() => {
    const handleAnotherMenuOpen = (event: Event) => {
      const openedMenuId = (event as CustomEvent<string>).detail;
      if (openedMenuId && openedMenuId !== menuId) {
        closeMenuImmediately();
      }
    };
    window.addEventListener(DROPDOWN_OPEN_EVENT, handleAnotherMenuOpen);
    return () => {
      window.removeEventListener(DROPDOWN_OPEN_EVENT, handleAnotherMenuOpen);
    };
  }, [closeMenuImmediately, menuId]);

  useEffect(() => {
    if (!mounted) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && menuRef.current.contains(event.target as Node)) {
        return;
      }
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        closeMenu();
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeMenu();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [closeMenu, mounted]);

  useLayoutEffect(() => {
    if (!mounted) return;
    updateMenuPosition();
    if (menuMode && phase === 'opening') {
      menuRef.current?.focus();
    }
  }, [getMenuItems, menuMode, mounted, phase, updateMenuPosition]);

  useEffect(() => {
    if (!mounted || phase !== 'opening') return;
    openTimerRef.current = setTimeout(() => {
      setPhase('open');
      openTimerRef.current = null;
    }, OPEN_ANIMATION_DELAY_MS);
    return () => {
      clearOpenTimer();
    };
  }, [mounted, phase, clearOpenTimer]);

  useEffect(() => {
    if (!mounted) return;
    window.addEventListener('scroll', updateMenuPosition, true);
    window.addEventListener('resize', updateMenuPosition);

    return () => {
      window.removeEventListener('scroll', updateMenuPosition, true);
      window.removeEventListener('resize', updateMenuPosition);
    };
  }, [mounted, updateMenuPosition]);

  useEffect(() => {
    return () => {
      clearCloseTimer();
      clearOpenTimer();
    };
  }, [clearCloseTimer, clearOpenTimer]);

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {trigger({
        open: triggerOpen,
        menuId,
        close: closeMenu,
        toggle: toggleMenu,
      })}

      {mounted &&
        createPortal(
        <div
          id={menuId}
          role={menuMode ? 'menu' : undefined}
          aria-orientation={menuMode ? 'vertical' : undefined}
          tabIndex={menuMode ? -1 : undefined}
          data-testid="dropdown-menu"
          data-state={phase}
          data-align={resolvedAlign}
          ref={menuRef}
          onKeyDown={menuMode ? handleMenuKeyDown : undefined}
          style={menuStyle}
          className="z-50 outline-none"
        >
          <div
            data-lumen-motion
            className={cn(
              'rounded-[var(--lumen-radius-icon)] border border-[var(--lumen-color-border)] bg-[var(--lumen-color-surface)] py-1 shadow-[0_4px_16px_var(--lumen-color-shadow)]',
              resolvedAlign === 'right' ? 'origin-top-right' : 'origin-top-left',
              menuMode && 'min-w-max whitespace-nowrap [&_svg]:shrink-0',
              menuClassName,
            )}
            style={{
              animation:
                phase === 'closing'
                  ? 'lumen-dropdown-out 0.12s ease-in forwards'
                  : 'lumen-dropdown-in 0.12s ease-out',
            }}
          >
            {typeof children === 'function'
              ? children({ open: triggerOpen, close: closeMenu })
              : children}
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
};
