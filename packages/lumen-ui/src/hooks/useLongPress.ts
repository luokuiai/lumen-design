import React, { useCallback, useEffect, useRef } from 'react';

export type LongPressCancelReason =
  | 'disabled'
  | 'leave'
  | 'move'
  | 'pointer-cancel'
  | 'released'
  | 'scroll';

export type LongPressPointerType = 'touch' | 'pen' | 'mouse';

const defaultPointerTypes: readonly LongPressPointerType[] = ['touch', 'pen'];

export interface UseLongPressOptions<T extends HTMLElement> {
  /** 长按达到触发时间后调用。 */
  onLongPress: (event: React.PointerEvent<T>) => void;
  /** 未触发长按时的普通点击回调。 */
  onClick?: (event: React.MouseEvent<T>) => void;
  /** 开始识别长按时调用。 */
  onStart?: (event: React.PointerEvent<T>) => void;
  /** 长按触发并松开指针时调用。 */
  onFinish?: (event: React.PointerEvent<T>) => void;
  /** 长按识别被取消时调用。 */
  onCancel?: (reason: LongPressCancelReason) => void;
  /** 触发长按所需时间，单位毫秒。 */
  delay?: number;
  /** 取消长按的最大移动距离，单位像素。 */
  moveThreshold?: number;
  /** 是否禁用长按识别。 */
  disabled?: boolean;
  /** 长按触发后是否抑制紧随其后的点击。 */
  suppressClick?: boolean;
  /** 识别期间是否阻止浏览器原生长按菜单。 */
  preventContextMenu?: boolean;
  /** 响应的指针类型，默认仅触摸和触控笔。 */
  pointerTypes?: readonly LongPressPointerType[];
}

export interface LongPressHandlers<T extends HTMLElement> {
  onPointerDown: React.PointerEventHandler<T>;
  onPointerMove: React.PointerEventHandler<T>;
  onPointerUp: React.PointerEventHandler<T>;
  onPointerCancel: React.PointerEventHandler<T>;
  onPointerLeave: React.PointerEventHandler<T>;
  onLostPointerCapture: React.PointerEventHandler<T>;
  onClick: React.MouseEventHandler<T>;
  onContextMenu: React.MouseEventHandler<T>;
}

type Gesture<T extends HTMLElement> = {
  pointerId: number;
  startX: number;
  startY: number;
  event: React.PointerEvent<T>;
};

export const useLongPress = <T extends HTMLElement = HTMLElement>({
  onLongPress,
  onClick,
  onStart,
  onFinish,
  onCancel,
  delay = 500,
  moveThreshold = 10,
  disabled = false,
  suppressClick = true,
  preventContextMenu = true,
  pointerTypes = defaultPointerTypes,
}: UseLongPressOptions<T>): LongPressHandlers<T> => {
  const optionsRef = useRef({ onLongPress, onClick, onStart, onFinish, onCancel });
  const gestureRef = useRef<Gesture<T> | null>(null);
  const timerRef = useRef<number | null>(null);
  const triggeredRef = useRef(false);
  const suppressClickRef = useRef(false);
  const suppressContextMenuRef = useRef(false);
  const cancelRef = useRef<(reason: LongPressCancelReason) => void>(() => undefined);

  optionsRef.current = { onLongPress, onClick, onStart, onFinish, onCancel };

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const handleScroll = useCallback(() => {
    cancelRef.current('scroll');
  }, []);

  const removeScrollListener = useCallback(() => {
    window.removeEventListener('scroll', handleScroll, true);
  }, [handleScroll]);

  const cancel = useCallback((reason: LongPressCancelReason) => {
    if (!gestureRef.current) return;
    const triggered = triggeredRef.current;
    gestureRef.current = null;
    triggeredRef.current = false;
    clearTimer();
    removeScrollListener();
    if (!triggered) optionsRef.current.onCancel?.(reason);
  }, [clearTimer, removeScrollListener]);
  cancelRef.current = cancel;

  useEffect(() => () => {
    clearTimer();
    removeScrollListener();
  }, [clearTimer, removeScrollListener]);

  useEffect(() => {
    if (disabled) cancel('disabled');
  }, [cancel, disabled]);

  const onPointerDownHandler: React.PointerEventHandler<T> = (event) => {
    if (
      disabled
      || event.defaultPrevented
      || event.button !== 0
      || event.isPrimary === false
      || !pointerTypes.includes(event.pointerType as LongPressPointerType)
    ) return;

    clearTimer();
    gestureRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      event,
    };
    triggeredRef.current = false;
    suppressClickRef.current = false;
    suppressContextMenuRef.current = false;
    optionsRef.current.onStart?.(event);
    window.addEventListener('scroll', handleScroll, true);
    timerRef.current = window.setTimeout(() => {
      const gesture = gestureRef.current;
      if (!gesture) return;
      timerRef.current = null;
      triggeredRef.current = true;
      suppressClickRef.current = suppressClick;
      suppressContextMenuRef.current = preventContextMenu;
      optionsRef.current.onLongPress(gesture.event);
    }, Math.max(0, delay));
  };

  const onPointerMoveHandler: React.PointerEventHandler<T> = (event) => {
    const gesture = gestureRef.current;
    if (!gesture || gesture.pointerId !== event.pointerId || triggeredRef.current) return;
    if (Math.hypot(event.clientX - gesture.startX, event.clientY - gesture.startY) > Math.max(0, moveThreshold)) {
      cancel('move');
    }
  };

  const onPointerUpHandler: React.PointerEventHandler<T> = (event) => {
    const gesture = gestureRef.current;
    if (!gesture || gesture.pointerId !== event.pointerId) return;
    const triggered = triggeredRef.current;
    gestureRef.current = null;
    triggeredRef.current = false;
    clearTimer();
    removeScrollListener();
    if (triggered) optionsRef.current.onFinish?.(event);
    else optionsRef.current.onCancel?.('released');
  };

  return {
    onPointerDown: onPointerDownHandler,
    onPointerMove: onPointerMoveHandler,
    onPointerUp: onPointerUpHandler,
    onPointerCancel: () => cancel('pointer-cancel'),
    onPointerLeave: (event) => {
      if (event.pointerType === 'mouse') cancel('leave');
    },
    onLostPointerCapture: () => cancel('pointer-cancel'),
    onClick: (event) => {
      if (suppressClickRef.current) {
        suppressClickRef.current = false;
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      optionsRef.current.onClick?.(event);
    },
    onContextMenu: (event) => {
      if (preventContextMenu && (gestureRef.current || suppressContextMenuRef.current)) {
        suppressContextMenuRef.current = false;
        event.preventDefault();
      }
    },
  };
};
