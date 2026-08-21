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

interface DropdownMenuProps {
  trigger: (state: DropdownMenuRenderState) => React.ReactNode;
  children:
    | React.ReactNode
    | ((state: DropdownMenuContentState) => React.ReactNode);
  className?: string;
  menuClassName?: string;
  align?: 'left' | 'right';
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
  align = 'right',
  closeDelayMs = DEFAULT_CLOSE_DELAY_MS,
  menuMode = false,
  onOpenChange,
}) => {
  const menuId = useId();
  const [phase, setPhase] = useState<DropdownMenuPhase>('closed');
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

    const triggerRect = containerRef.current.getBoundingClientRect();
    const menuWidth = menuRef.current?.offsetWidth ?? 200;
    const menuHeight = menuRef.current?.offsetHeight ?? 200;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const viewportPadding = 8;
    const verticalGap = 8;

    const preferredLeft =
      align === 'right' ? triggerRect.right - menuWidth : triggerRect.left;
    const maxLeft = Math.max(
      viewportPadding,
      viewportWidth - menuWidth - viewportPadding,
    );
    const left = Math.min(
      Math.max(viewportPadding, preferredLeft),
      maxLeft,
    );

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
      getMenuItems()[0]?.focus();
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
          data-testid="dropdown-menu"
          data-state={phase}
          ref={menuRef}
          onKeyDown={menuMode ? handleMenuKeyDown : undefined}
          style={menuStyle}
          className="z-50"
        >
          <div
            className={cn(
              'rounded-[var(--lumen-radius-icon)] border border-[var(--lumen-color-border)] bg-[var(--lumen-color-surface)] py-1 shadow-[0_4px_16px_var(--lumen-color-shadow)]',
              align === 'right' ? 'origin-top-right' : 'origin-top-left',
              menuMode && 'min-w-max whitespace-nowrap [&_svg]:shrink-0',
              menuClassName,
            )}
            style={{
              animation:
                phase === 'closing'
                  ? 'dropdownMenuOutUp 0.12s ease-in forwards'
                  : 'dropdownMenuInDown 0.12s ease-out',
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
