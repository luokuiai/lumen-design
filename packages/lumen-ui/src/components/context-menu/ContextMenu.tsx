import React, {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { useLongPress } from '../../hooks/useLongPress';
import { cn } from '../classNames';
import {
  FLOATING_LAYER_OPEN_EVENT,
  announceFloatingLayerOpen,
} from '../floatingEvents';
import { useOverlayPortalScope } from '../useOverlayBehavior';

export interface ContextMenuContentState {
  close: () => void;
}

export interface ContextMenuProps {
  /** 可触发菜单的目标内容。 */
  children: React.ReactNode;
  /** 菜单内容，菜单项应使用 role="menuitem"。 */
  content:
    | React.ReactNode
    | ((state: ContextMenuContentState) => React.ReactNode);
  /** 移动端触发长按所需时间，单位毫秒。 */
  longPressDelay?: number;
  /** 是否禁用右键和长按触发。 */
  disabled?: boolean;
  /** 关闭动画时长，单位毫秒。 */
  closeDelayMs?: number;
  /** 菜单打开状态变化时调用。 */
  onOpenChange?: (open: boolean) => void;
  /** 触发区域类名。 */
  className?: string;
  /** 菜单表面类名。 */
  menuClassName?: string;
  /** 菜单的无障碍名称。 */
  ariaLabel?: string;
}

type ContextMenuPhase = 'closed' | 'opening' | 'open' | 'closing';

const OPEN_ANIMATION_DELAY_MS = 16;
const DEFAULT_CLOSE_DELAY_MS = 120;
const VIEWPORT_PADDING = 8;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), Math.max(min, max));

export const ContextMenu: React.FC<ContextMenuProps> = ({
  children,
  content,
  longPressDelay = 500,
  disabled = false,
  closeDelayMs = DEFAULT_CLOSE_DELAY_MS,
  onOpenChange,
  className,
  menuClassName,
  ariaLabel,
}) => {
  const overlayScopeId = useOverlayPortalScope();
  const menuId = useId();
  const [phase, setPhase] = useState<ContextMenuPhase>('closed');
  const [anchor, setAnchor] = useState({ x: -9999, y: -9999 });
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({
    left: -9999,
    position: 'fixed',
    top: -9999,
  });
  const menuRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const openTimerRef = useRef<ReturnType<typeof setTimeout>>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout>>(null);
  const mounted = phase !== 'closed';

  const clearTimers = useCallback(() => {
    if (openTimerRef.current) clearTimeout(openTimerRef.current);
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    openTimerRef.current = null;
    closeTimerRef.current = null;
  }, []);

  const openAt = useCallback((x: number, y: number) => {
    if (disabled) return;
    clearTimers();
    restoreFocusRef.current = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    setAnchor({ x, y });
    setPhase('opening');
    onOpenChange?.(true);
    announceFloatingLayerOpen(menuId);
  }, [clearTimers, disabled, menuId, onOpenChange]);

  const closeImmediately = useCallback(() => {
    clearTimers();
    setPhase('closed');
    onOpenChange?.(false);
  }, [clearTimers, onOpenChange]);

  const close = useCallback(() => {
    if (phase === 'closed' || phase === 'closing') return;
    clearTimers();
    setPhase('closing');
    onOpenChange?.(false);
    closeTimerRef.current = setTimeout(() => {
      setPhase('closed');
      closeTimerRef.current = null;
    }, closeDelayMs);
  }, [clearTimers, closeDelayMs, onOpenChange, phase]);

  const longPressHandlers = useLongPress<HTMLDivElement>({
    delay: longPressDelay,
    disabled,
    onLongPress: (event) => openAt(event.clientX, event.clientY),
  });

  const getMenuItems = useCallback(
    () => Array.from(
      menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [],
    ).filter(
      (item) => !item.hasAttribute('disabled') && item.getAttribute('aria-disabled') !== 'true',
    ),
    [],
  );

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      close();
      restoreFocusRef.current?.focus();
      return;
    }

    const menuItems = getMenuItems();
    if (menuItems.length === 0) return;
    const currentIndex = menuItems.indexOf(document.activeElement as HTMLElement);
    let nextIndex: number | null = null;
    if (event.key === 'ArrowDown') nextIndex = currentIndex < 0 ? 0 : (currentIndex + 1) % menuItems.length;
    if (event.key === 'ArrowUp') nextIndex = currentIndex < 0
      ? menuItems.length - 1
      : (currentIndex - 1 + menuItems.length) % menuItems.length;
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = menuItems.length - 1;
    if (nextIndex === null) return;
    event.preventDefault();
    menuItems[nextIndex]?.focus();
  };

  useLayoutEffect(() => {
    if (!mounted || !menuRef.current) return;
    const width = menuRef.current.offsetWidth || 176;
    const height = menuRef.current.offsetHeight || 160;
    setMenuStyle({
      left: clamp(anchor.x, VIEWPORT_PADDING, window.innerWidth - width - VIEWPORT_PADDING),
      position: 'fixed',
      top: clamp(anchor.y, VIEWPORT_PADDING, window.innerHeight - height - VIEWPORT_PADDING),
      maxHeight: `calc(100vh - ${VIEWPORT_PADDING * 2}px)`,
      maxWidth: `calc(100vw - ${VIEWPORT_PADDING * 2}px)`,
    });
    if (phase === 'opening') menuRef.current.focus({ preventScroll: true });
  }, [anchor, mounted, phase]);

  useEffect(() => {
    if (!mounted || phase !== 'opening') return;
    openTimerRef.current = setTimeout(() => {
      setPhase('open');
      openTimerRef.current = null;
    }, OPEN_ANIMATION_DELAY_MS);
    return () => {
      if (openTimerRef.current) clearTimeout(openTimerRef.current);
      openTimerRef.current = null;
    };
  }, [mounted, phase]);

  useEffect(() => {
    if (!mounted) return;
    const handleOutside = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) close();
    };
    const handleViewportChange = () => close();
    document.addEventListener('pointerdown', handleOutside);
    window.addEventListener('scroll', handleViewportChange, true);
    window.addEventListener('resize', handleViewportChange);
    return () => {
      document.removeEventListener('pointerdown', handleOutside);
      window.removeEventListener('scroll', handleViewportChange, true);
      window.removeEventListener('resize', handleViewportChange);
    };
  }, [close, mounted]);

  useEffect(() => {
    const handleAnotherLayerOpen = (event: Event) => {
      const openedMenuId = (event as CustomEvent<string>).detail;
      if (mounted && openedMenuId && openedMenuId !== menuId) closeImmediately();
    };
    window.addEventListener(FLOATING_LAYER_OPEN_EVENT, handleAnotherLayerOpen);
    return () => window.removeEventListener(FLOATING_LAYER_OPEN_EVENT, handleAnotherLayerOpen);
  }, [closeImmediately, menuId, mounted]);

  useEffect(() => clearTimers, [clearTimers]);

  return (
    <div
      data-ui="context-menu-trigger"
      className={cn('relative', className)}
      {...longPressHandlers}
      onContextMenu={(event) => {
        longPressHandlers.onContextMenu(event);
        if (event.defaultPrevented || disabled) return;
        event.preventDefault();
        openAt(event.clientX, event.clientY);
      }}
    >
      {children}
      {mounted && createPortal(
        <div
          id={menuId}
          ref={menuRef}
          role="menu"
          tabIndex={-1}
          aria-label={ariaLabel}
          aria-orientation="vertical"
          data-testid="context-menu"
          data-state={phase}
          data-lumen-overlay-scope={overlayScopeId ?? undefined}
          className="z-[90] outline-none"
          style={menuStyle}
          onKeyDown={handleKeyDown}
          onClick={(event) => {
            const item = (event.target as Element).closest('[role="menuitem"]');
            if (item && !item.hasAttribute('disabled') && item.getAttribute('aria-disabled') !== 'true') close();
          }}
        >
          <div
            data-lumen-motion
            data-ui="context-menu"
            className={cn(
              'min-w-40 max-w-[320px] overflow-auto rounded-[var(--lumen-radius-icon)] border border-[var(--lumen-color-border)] bg-[var(--lumen-color-surface)] py-1 shadow-[var(--lumen-shadow-dropdown)]',
              menuClassName,
            )}
            style={{
              animation: phase === 'closing'
                ? 'lumen-dropdown-out 0.12s ease-in forwards'
                : 'lumen-dropdown-in 0.12s ease-out',
            }}
          >
            {typeof content === 'function' ? content({ close }) : content}
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
};
