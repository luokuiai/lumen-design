import React from "react";
import { cn } from "./classNames";
import { OuterScrollbar } from "./scrollbar/OuterScrollbar";

export type ScrollbarOrientation = "vertical" | "horizontal" | "both";
export type ScrollbarSize = "sm" | "md";

export interface ScrollbarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 默认跳过容器，直接聚焦内部控件；纯内容滚动区可设置为 0。 */
  tabIndex?: number;
  /** 可滚动方向 */
  orientation?: ScrollbarOrientation;
  /** 滚动条粗细 */
  size?: ScrollbarSize;
  /** 仅在悬停或获得焦点时显示滑块 */
  autoHide?: boolean;
  /** inner 使用原生轨道；outer 在内容外侧单独预留轨道区域。 */
  placement?: "inner" | "outer";
}

const orientationClassNames: Record<ScrollbarOrientation, string> = {
  vertical: "overflow-x-hidden overflow-y-auto",
  horizontal: "overflow-x-auto overflow-y-hidden",
  both: "overflow-auto",
};

export const Scrollbar = React.forwardRef<HTMLDivElement, ScrollbarProps>(
  (
    {
      orientation = "vertical",
      size = "md",
      autoHide = false,
      placement = "inner",
      className,
      tabIndex = -1,
      ...props
    },
    ref,
  ) => placement === "outer" ? (
    <OuterScrollbar ref={ref} orientation={orientation} size={size} autoHide={autoHide} className={className} tabIndex={tabIndex} {...props} />
  ) : (
    <div
      ref={ref}
      data-ui="scrollbar"
      data-placement="inner"
      data-orientation={orientation}
      data-size={size}
      data-auto-hide={autoHide || undefined}
      tabIndex={tabIndex}
      className={cn(
        "lumen-scrollbar overscroll-contain",
        orientationClassNames[orientation],
        className,
      )}
      {...props}
    />
  ),
);

Scrollbar.displayName = "Scrollbar";
