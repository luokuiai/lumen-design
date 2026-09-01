import React, {
  cloneElement,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { cn } from './classNames';
import { computePosition } from './tooltip-positions';
import type { TooltipPlacement } from './tooltip-positions';

export type { TooltipPlacement };

/** 动画阶段 */
type Phase = 'hidden' | 'entering' | 'visible' | 'exiting';

export interface TooltipProps {
  /** 要显示的提示内容 */
  content: React.ReactNode;
  /** 触发元素（必须是单个 ReactElement） */
  children: React.ReactElement;
  /** 放置位置，默认 'top' */
  placement?: TooltipPlacement;
  /** 显示延迟 (ms)，默认 350 */
  showDelay?: number;
  /** 隐藏延迟 (ms)，默认 150 */
  hideDelay?: number;
  /** 是否禁用 tooltip */
  disabled?: boolean;
  /** 自定义 className */
  className?: string;
  /** 与触发元素的间距 (px)，默认 12 */
  offset?: number;
  /** 是否显示小箭头，默认 true */
  showArrow?: boolean;
}

/** 合并多个 ref */
function mergeRefs<T>(
  ...refs: Array<React.Ref<T> | undefined | null>
): (el: T | null) => void {
  return (el: T | null) => {
    refs.forEach((ref) => {
      if (typeof ref === 'function') {
        ref(el);
      } else if (ref && typeof ref === 'object') {
        (ref as React.MutableRefObject<T | null>).current = el;
      }
    });
  };
}

/** 根据 placement 获取 transform-origin 类名 */
function getOriginClass(placement: TooltipPlacement): string {
  switch (placement) {
    case 'top':
      return 'origin-bottom';
    case 'bottom':
      return 'origin-top';
    case 'left':
      return 'origin-right';
    case 'right':
      return 'origin-left';
  }
}

/**
 * 通用 Tooltip 组件
 *
 * 支持延迟展示、多种放置方向、视口自动翻转、入场/退场动画和小三角箭头。
 * 使用 Portal 渲染到 document.body，避免被父级 overflow 裁剪。
 */
export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  placement = 'top',
  showDelay = 350,
  hideDelay = 150,
  disabled = false,
  className,
  offset = 12,
  showArrow = true,
}) => {
  const [phase, setPhase] = useState<Phase>('hidden');
  const [positionStyle, setPositionStyle] = useState<React.CSSProperties>({
    position: 'fixed',
    pointerEvents: 'none',
  });
  const [actualPlacement, setActualPlacement] = useState<TooltipPlacement>(placement);
  const [arrowStyle, setArrowStyle] = useState<React.CSSProperties>({});

  const triggerRef = useRef<HTMLElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const showTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // 清理所有定时器
  const clearTimers = useCallback(() => {
    clearTimeout(showTimerRef.current);
    clearTimeout(hideTimerRef.current);
    showTimerRef.current = undefined;
    hideTimerRef.current = undefined;
  }, []);

  // 计算位置
  const updatePosition = useCallback(() => {
    const triggerEl = triggerRef.current;
    const tooltipEl = tooltipRef.current;
    if (!triggerEl || !tooltipEl) return;

    const triggerRect = triggerEl.getBoundingClientRect();
    const tooltipSize = {
      width: tooltipEl.offsetWidth,
      height: tooltipEl.offsetHeight,
    };
    const result = computePosition(triggerRect, tooltipSize, placement, offset);
    setPositionStyle({
      position: 'fixed',
      left: result.x,
      top: result.y,
      zIndex: 1200,
      pointerEvents: 'none',
    });
    setActualPlacement(result.actualPlacement);
    setArrowStyle(result.arrowStyle);
  }, [placement, offset]);

  // 触发显示
  const show = useCallback(() => {
    if (disabled) return;
    clearTimers();
    showTimerRef.current = setTimeout(() => {
      setPhase('entering');
    }, showDelay);
  }, [disabled, showDelay, clearTimers]);

  // 触发隐藏
  const hide = useCallback(() => {
    clearTimers();
    if (phase === 'hidden') return;
    hideTimerRef.current = setTimeout(() => {
      setPhase('exiting');
    }, hideDelay);
  }, [phase, hideDelay, clearTimers]);

  const dismissOnScroll = useCallback(() => {
    clearTimers();
    setPhase('hidden');
  }, [clearTimers]);

  // 挂载后先计算位置；方向动画由 CSS keyframe 驱动。
  useLayoutEffect(() => {
    if (phase === 'entering') {
      updatePosition();
    }
  }, [phase, updatePosition]);

  // 滚动任意容器时立即关闭，并取消等待显示的 tooltip。
  useEffect(() => {
    window.addEventListener('scroll', dismissOnScroll, {
      capture: true,
      passive: true,
    });

    return () => {
      window.removeEventListener('scroll', dismissOnScroll, true);
    };
  }, [dismissOnScroll]);

  // 展示期间仅在视口尺寸变化时重新计算位置。
  useEffect(() => {
    if (phase !== 'visible' && phase !== 'entering') return;

    const handleResize = () => updatePosition();
    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [phase, updatePosition]);

  // 组件卸载清理
  useEffect(() => {
    return clearTimers;
  }, [clearTimers]);

  // 事件处理 — 使用 pointer 事件兼容平板触摸板
  const handlePointerEnter = useCallback(() => show(), [show]);
  const handlePointerLeave = useCallback(() => hide(), [hide]);
  const handleAnimationEnd = useCallback((event: React.AnimationEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    setPhase((currentPhase) => {
      if (currentPhase === 'entering') return 'visible';
      if (currentPhase === 'exiting') return 'hidden';
      return currentPhase;
    });
  }, []);

  const tooltipNode = phase !== 'hidden' ? (
    <div
      ref={tooltipRef}
      data-lumen-motion
      data-placement={actualPlacement}
      data-state={phase === 'entering' ? 'opening' : phase === 'exiting' ? 'closing' : 'open'}
      className={cn(
        'lumen-tooltip bg-[var(--lumen-color-tooltip)]/90 text-[var(--lumen-color-on-primary)] text-[12px] px-3 py-1.5 rounded-md shadow-xl whitespace-nowrap',
        getOriginClass(actualPlacement),
        className,
      )}
      style={positionStyle}
      role="tooltip"
      onAnimationEnd={handleAnimationEnd}
    >
      {content}
      {showArrow && <div style={arrowStyle} />}
    </div>
  ) : null;

  return (
    <>
      {cloneElement(children, {
        ref: mergeRefs((children as React.ReactElement & { ref?: React.Ref<HTMLElement> }).ref, triggerRef),
        onPointerEnter: handlePointerEnter,
        onPointerLeave: handlePointerLeave,
      } as React.HTMLAttributes<HTMLElement> & { ref: React.Ref<HTMLElement> })}
      {tooltipNode && createPortal(tooltipNode, document.body)}
    </>
  );
};
