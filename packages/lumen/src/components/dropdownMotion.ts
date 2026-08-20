export function dropdownTransformOrigin(
  shouldDropUp: boolean,
  horizontalAlign: 'left' | 'right' = 'left',
): string {
  const vertical = shouldDropUp ? 'bottom' : 'top';
  const horizontal = horizontalAlign === 'right' ? 'right' : 'left';
  return `${horizontal} ${vertical}`;
}
