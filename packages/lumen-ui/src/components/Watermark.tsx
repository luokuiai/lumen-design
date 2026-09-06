import React, { useMemo } from 'react';
import { cn } from './classNames';

export interface WatermarkFont {
  color?: string;
  fontFamily?: string;
  fontSize?: number;
  fontStyle?: React.CSSProperties['fontStyle'];
  fontWeight?: React.CSSProperties['fontWeight'];
}

export interface WatermarkProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'content'> {
  content?: string | string[];
  image?: string;
  rotate?: number;
  opacity?: number;
  gap?: [number, number];
  offset?: [number, number];
  markSize?: [number, number];
  font?: WatermarkFont;
  zIndex?: number;
  fullPage?: boolean;
  overlayClassName?: string;
  overlayStyle?: React.CSSProperties;
}

const escapeXml = (value: string) => value
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&apos;');

const toDataUrl = (svg: string) => {
  const bytes = new TextEncoder().encode(svg);
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return `url("data:image/svg+xml;base64,${btoa(binary)}")`;
};

export const Watermark = React.forwardRef<HTMLDivElement, WatermarkProps>(
  (
    {
      content,
      image,
      rotate = -22,
      opacity = 0.12,
      gap = [100, 100],
      offset = [0, 0],
      markSize = [160, 64],
      font = {},
      zIndex = 9,
      fullPage = false,
      overlayClassName,
      overlayStyle,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const [gapX, gapY] = gap;
    const [offsetX, offsetY] = offset;
    const [markWidth, markHeight] = markSize;
    const {
      color = 'var(--lumen-color-text)',
      fontFamily = 'sans-serif',
      fontSize = 14,
      fontStyle = 'normal',
      fontWeight = 400,
    } = font;
    const tileWidth = Math.max(1, markWidth + gapX);
    const tileHeight = Math.max(1, markHeight + gapY);

    const pattern = useMemo(() => {
      const transform = `translate(${tileWidth / 2} ${tileHeight / 2}) rotate(${rotate})`;
      if (image) {
        return toDataUrl(
          `<svg xmlns="http://www.w3.org/2000/svg" width="${tileWidth}" height="${tileHeight}" viewBox="0 0 ${tileWidth} ${tileHeight}">`
          + `<g transform="${transform}"><image href="${escapeXml(image)}" x="${-markWidth / 2}" y="${-markHeight / 2}" width="${markWidth}" height="${markHeight}" preserveAspectRatio="xMidYMid meet"/></g></svg>`,
        );
      }

      const lines = (Array.isArray(content) ? content : [content ?? '']).filter(Boolean);
      if (!lines.length) return undefined;
      const lineHeight = fontSize * 1.4;
      const firstLineY = -((lines.length - 1) * lineHeight) / 2;
      const text = lines.map((line, index) => (
        `<text x="0" y="${firstLineY + index * lineHeight}" text-anchor="middle" dominant-baseline="middle" font-family="${escapeXml(fontFamily)}" font-size="${fontSize}" font-style="${fontStyle}" font-weight="${fontWeight}" fill="white">${escapeXml(line)}</text>`
      )).join('');
      return toDataUrl(
        `<svg xmlns="http://www.w3.org/2000/svg" width="${tileWidth}" height="${tileHeight}" viewBox="0 0 ${tileWidth} ${tileHeight}"><g transform="${transform}">${text}</g></svg>`,
      );
    }, [content, fontFamily, fontSize, fontStyle, fontWeight, image, markHeight, markWidth, rotate, tileHeight, tileWidth]);

    const patternStyle: React.CSSProperties = image
      ? {
          backgroundImage: pattern,
          backgroundPosition: `${offsetX}px ${offsetY}px`,
          backgroundRepeat: 'repeat',
          backgroundSize: `${tileWidth}px ${tileHeight}px`,
        }
      : {
          backgroundColor: color,
          maskImage: pattern,
          maskPosition: `${offsetX}px ${offsetY}px`,
          maskRepeat: 'repeat',
          maskSize: `${tileWidth}px ${tileHeight}px`,
          WebkitMaskImage: pattern,
          WebkitMaskPosition: `${offsetX}px ${offsetY}px`,
          WebkitMaskRepeat: 'repeat',
          WebkitMaskSize: `${tileWidth}px ${tileHeight}px`,
        };

    return (
      <div
        {...props}
        ref={ref}
        data-ui="watermark"
        className={cn('isolate relative', className)}
      >
        {children}
        {pattern ? (
          <div
            aria-hidden="true"
            data-watermark-overlay
            className={cn(
              'pointer-events-none inset-0 select-none',
              fullPage ? 'fixed' : 'absolute',
              overlayClassName,
            )}
            style={{
              zIndex,
              opacity: Math.min(1, Math.max(0, opacity)),
              ...patternStyle,
              ...overlayStyle,
            }}
          />
        ) : null}
      </div>
    );
  },
);

Watermark.displayName = 'Watermark';
