import React from "react";
import { cn } from "../classNames";
import type { ScrollbarProps } from "../Scrollbar";

type Axis = "x" | "y";
type Metrics = { width: number; height: number; scrollWidth: number; scrollHeight: number; left: number; top: number };
const emptyMetrics: Metrics = { width: 0, height: 0, scrollWidth: 0, scrollHeight: 0, left: 0, top: 0 };

/** Keep the forwarded ref and DOM events on the actual scroll viewport. */
export const OuterScrollbar = React.forwardRef<HTMLDivElement, ScrollbarProps>(
  ({ orientation = "vertical", size = "md", autoHide = false, className, style, children, tabIndex = -1, onScroll, ...props }, ref) => {
    const viewportRef = React.useRef<HTMLDivElement>(null);
    const contentRef = React.useRef<HTMLDivElement>(null);
    const drag = React.useRef<{ axis: Axis; start: number; scroll: number; ratio: number } | null>(null);
    const [metrics, setMetrics] = React.useState(emptyMetrics);
    React.useImperativeHandle(ref, () => viewportRef.current!, []);

    const measure = React.useCallback(() => {
      const viewport = viewportRef.current;
      if (!viewport) return;
      const next: Metrics = {
        width: viewport.clientWidth, height: viewport.clientHeight,
        scrollWidth: viewport.scrollWidth, scrollHeight: viewport.scrollHeight,
        left: viewport.scrollLeft, top: viewport.scrollTop,
      };
      setMetrics((previous) => Object.keys(next).every((key) => previous[key as keyof Metrics] === next[key as keyof Metrics]) ? previous : next);
    }, []);

    React.useLayoutEffect(() => {
      measure();
      const observer = typeof ResizeObserver === "undefined" ? undefined : new ResizeObserver(measure);
      if (viewportRef.current) observer?.observe(viewportRef.current);
      if (contentRef.current) observer?.observe(contentRef.current);
      window.addEventListener("resize", measure);
      return () => { observer?.disconnect(); window.removeEventListener("resize", measure); };
    }, [children, orientation, measure]);

    const renderTrack = (axis: Axis) => {
      const vertical = axis === "y";
      const extent = vertical ? metrics.height : metrics.width;
      const total = vertical ? metrics.scrollHeight : metrics.scrollWidth;
      const position = vertical ? metrics.top : metrics.left;
      const overflowing = total > extent && extent > 0;
      const thumb = overflowing ? Math.min(extent, Math.max(20, extent * extent / total)) : 0;
      const travel = extent - thumb;
      const offset = overflowing ? Math.max(0, Math.min(travel, position / (total - extent) * travel)) : 0;
      const stopDrag = (event: React.PointerEvent<HTMLDivElement>) => {
        drag.current = null;
        if (event.currentTarget.hasPointerCapture?.(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
      };
      return (
        <div
          aria-hidden="true"
          data-ui="scrollbar-track"
          data-axis={axis}
          data-overflow={overflowing || undefined}
          onPointerDown={(event) => {
            const viewport = viewportRef.current;
            if (!overflowing || !viewport || event.button !== 0 || travel <= 0) return;
            event.preventDefault();
            const coordinate = vertical ? event.clientY : event.clientX;
            const rect = event.currentTarget.getBoundingClientRect();
            const local = coordinate - (vertical ? rect.top : rect.left);
            const ratio = (total - extent) / travel;
            const scroll = event.target === event.currentTarget
              ? Math.max(0, Math.min(travel, local - thumb / 2)) * ratio
              : vertical ? viewport.scrollTop : viewport.scrollLeft;
            if (vertical) viewport.scrollTop = scroll;
            else viewport.scrollLeft = scroll;
            drag.current = { axis, start: coordinate, scroll, ratio };
            event.currentTarget.setPointerCapture?.(event.pointerId);
            viewport.focus({ preventScroll: true });
            measure();
          }}
          onPointerMove={(event) => {
            const current = drag.current;
            const viewport = viewportRef.current;
            if (!current || current.axis !== axis || !viewport) return;
            const coordinate = vertical ? event.clientY : event.clientX;
            const scroll = current.scroll + (coordinate - current.start) * current.ratio;
            if (vertical) viewport.scrollTop = scroll;
            else viewport.scrollLeft = scroll;
            measure();
          }}
          onPointerUp={stopDrag}
          onPointerCancel={stopDrag}
          onLostPointerCapture={() => { drag.current = null; }}
        >
          <div data-ui="scrollbar-thumb" style={vertical ? { height: thumb, transform: `translateY(${offset}px)` } : { width: thumb, transform: `translateX(${offset}px)` }} />
        </div>
      );
    };

    return (
      <div className={cn("lumen-scrollbar lumen-scrollbar-outer", className)} style={style} data-ui="scrollbar-shell" data-orientation={orientation} data-size={size} data-auto-hide={autoHide || undefined}>
        <div
          {...props}
          ref={viewportRef}
          data-ui="scrollbar"
          data-placement="outer"
          data-orientation={orientation}
          data-size={size}
          data-auto-hide={autoHide || undefined}
          className="lumen-scrollbar-viewport"
          tabIndex={tabIndex}
          onScroll={(event) => { measure(); onScroll?.(event); }}
        >
          <div ref={contentRef}>{children}</div>
        </div>
        {orientation !== "horizontal" && renderTrack("y")}
        {orientation !== "vertical" && renderTrack("x")}
      </div>
    );
  },
);

OuterScrollbar.displayName = "OuterScrollbar";
