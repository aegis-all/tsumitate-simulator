import type { RateKey } from '../domain/constraints';

/**
 * 系列色 (design.md §6.5)。tokens.css の --c-rate-* と同じ値。
 * SVG 属性(Recharts)に渡すため、CSS 変数ではなく実値を持つ。
 */
export const PATTERN_COLORS: Record<RateKey, string> = {
  a: '#2f6fed',
  b: '#1f9d6a',
  c: '#d9731a',
};

export const PRINCIPAL_COLOR = '#8a8f98';
