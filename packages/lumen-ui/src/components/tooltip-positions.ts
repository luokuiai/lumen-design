import type React from 'react';

/** 提示框放置方向 */
export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';

/** 位置计算结果 */
export interface PositionResult {
  /** 提示框 left 坐标（相对视口） */
  x: number;
  /** 提示框 top 坐标（相对视口） */
  y: number;
  /** 实际放置方向（可能因视口翻转而改变） */
  actualPlacement: TooltipPlacement;
  /** 箭头内联样式 */
  arrowStyle: React.CSSProperties;
}

/** 视口尺寸 */
export interface ViewportSize {
  width: number;
  height: number;
}

const ARROW_SIZE = 6;
const TOOLTIP_BG = 'var(--lumen-color-tooltip)';

/** 方向对应的反方向 */
const OPPOSITE: Record<TooltipPlacement, TooltipPlacement> = {
  top: 'bottom',
  bottom: 'top',
  left: 'right',
  right: 'left',
};

/** 计算指定方向所需的空间 */
function getAvailableSpace(
  triggerRect: DOMRect,
  placement: TooltipPlacement,
  viewportPadding: number,
  viewport: ViewportSize,
): number {
  switch (placement) {
    case 'top':
      return triggerRect.top - viewportPadding;
    case 'bottom':
      return viewport.height - triggerRect.bottom - viewportPadding;
    case 'left':
      return triggerRect.left - viewportPadding;
    case 'right':
      return viewport.width - triggerRect.right - viewportPadding;
  }
}

/** 判断该方向上是否有足够空间（tooltip 尺寸 + offset） */
function fitsInDirection(
  triggerRect: DOMRect,
  tooltipSize: { width: number; height: number },
  placement: TooltipPlacement,
  offset: number,
  viewportPadding: number,
  viewport: ViewportSize,
): boolean {
  const needed =
    (placement === 'top' || placement === 'bottom')
      ? tooltipSize.height + offset
      : tooltipSize.width + offset;
  return getAvailableSpace(triggerRect, placement, viewportPadding, viewport) >= needed;
}

/** 生成箭头的 CSS border trick 样式 */
function buildArrowStyle(
  placement: TooltipPlacement,
  arrowOffset: number,
): React.CSSProperties {
  const border = `${ARROW_SIZE}px solid transparent`;
  const borderColored = `${ARROW_SIZE}px solid ${TOOLTIP_BG}`;

  switch (placement) {
    case 'top':
      return {
        position: 'absolute',
        bottom: -ARROW_SIZE,
        left: arrowOffset,
        transform: 'translateX(-50%)',
        width: 0,
        height: 0,
        borderLeft: border,
        borderRight: border,
        borderTop: borderColored,
      };
    case 'bottom':
      return {
        position: 'absolute',
        top: -ARROW_SIZE,
        left: arrowOffset,
        transform: 'translateX(-50%)',
        width: 0,
        height: 0,
        borderLeft: border,
        borderRight: border,
        borderBottom: borderColored,
      };
    case 'left':
      return {
        position: 'absolute',
        right: -ARROW_SIZE,
        top: arrowOffset,
        transform: 'translateY(-50%)',
        width: 0,
        height: 0,
        borderTop: border,
        borderBottom: border,
        borderLeft: borderColored,
      };
    case 'right':
      return {
        position: 'absolute',
        left: -ARROW_SIZE,
        top: arrowOffset,
        transform: 'translateY(-50%)',
        width: 0,
        height: 0,
        borderTop: border,
        borderBottom: border,
        borderRight: borderColored,
      };
  }
}

/**
 * 计算提示框位置（纯函数，无副作用）
 * @param triggerRect 触发元素的 getBoundingClientRect()
 * @param tooltipSize 提示框的 { width, height }
 * @param placement 期望的放置方向
 * @param offset 与触发元素的间距
 * @param viewportPadding 距视口边缘的安全边距，默认 8
 * @param viewport 视口尺寸，默认使用 window.innerWidth/innerHeight
 */
export function computePosition(
  triggerRect: DOMRect,
  tooltipSize: { width: number; height: number },
  placement: TooltipPlacement,
  offset: number,
  viewportPadding: number = 8,
  viewport: ViewportSize = typeof window !== 'undefined'
    ? { width: window.innerWidth, height: window.innerHeight }
    : { width: 1024, height: 768 },
): PositionResult {
  // 翻转逻辑：空间不足时尝试反方向
  let actualPlacement = placement;
  if (!fitsInDirection(triggerRect, tooltipSize, placement, offset, viewportPadding, viewport)) {
    const opposite = OPPOSITE[placement];
    if (fitsInDirection(triggerRect, tooltipSize, opposite, offset, viewportPadding, viewport)) {
      actualPlacement = opposite;
    }
    // 都不够则保持原方向，后续 clamp
  }

  const { width: tw, height: th } = tooltipSize;
  const triggerCenterX = triggerRect.left + triggerRect.width / 2;
  const triggerCenterY = triggerRect.top + triggerRect.height / 2;

  let x: number;
  let y: number;
  let arrowOffset: number;

  switch (actualPlacement) {
    case 'top':
      x = triggerCenterX - tw / 2;
      y = triggerRect.top - th - offset;
      arrowOffset = triggerCenterX - x;
      break;
    case 'bottom':
      x = triggerCenterX - tw / 2;
      y = triggerRect.bottom + offset;
      arrowOffset = triggerCenterX - x;
      break;
    case 'left':
      x = triggerRect.left - tw - offset;
      y = triggerCenterY - th / 2;
      arrowOffset = triggerCenterY - y;
      break;
    case 'right':
      x = triggerRect.right + offset;
      y = triggerCenterY - th / 2;
      arrowOffset = triggerCenterY - y;
      break;
  }

  // 水平 clamp（top/bottom 方向）
  if (actualPlacement === 'top' || actualPlacement === 'bottom') {
    if (x < viewportPadding) {
      arrowOffset += x - viewportPadding;
      x = viewportPadding;
    } else if (x + tw > viewport.width - viewportPadding) {
      const overflow = x + tw - (viewport.width - viewportPadding);
      arrowOffset -= overflow;
      x -= overflow;
    }
  }

  // 垂直 clamp（left/right 方向）
  if (actualPlacement === 'left' || actualPlacement === 'right') {
    if (y < viewportPadding) {
      arrowOffset += y - viewportPadding;
      y = viewportPadding;
    } else if (y + th > viewport.height - viewportPadding) {
      const overflow = y + th - (viewport.height - viewportPadding);
      arrowOffset -= overflow;
      y -= overflow;
    }
  }

  const arrowStyle = buildArrowStyle(actualPlacement, arrowOffset);

  return { x, y, actualPlacement, arrowStyle };
}
