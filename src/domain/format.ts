/**
 * 表示整形 (requirement.md §6.3 / design.md §5.3)
 * 丸めはここでのみ行う。
 */

const jaInt = new Intl.NumberFormat('ja-JP', { maximumFractionDigits: 0 });
const jaOneDecimal = new Intl.NumberFormat('ja-JP', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

const DASH = '—';

/** 12331010 → "12,331,010円" (1円未満四捨五入) */
export function yen(n: number): string {
  if (!Number.isFinite(n)) return DASH;
  return `${jaInt.format(Math.round(n))}円`;
}

/** 万円 (小数1桁) の数値。12331010 → 1233.1。1,000円未満を四捨五入。 */
export function toManYen(n: number): number {
  return Math.round(n / 1000) / 10;
}

/** 12331010 → "約1,233.1万円" */
export function manYen(n: number, prefix = '約'): string {
  if (!Number.isFinite(n)) return DASH;
  return `${prefix}${jaOneDecimal.format(toManYen(n))}万円`;
}

/** グラフ軸・表用: 12331010 → "1,233.1万" */
export function manYenShort(n: number): string {
  if (!Number.isFinite(n)) return DASH;
  return `${jaOneDecimal.format(toManYen(n))}万`;
}

/** 軸ラベル用 (小数なし): 12331010 → "1,233万" */
export function manYenAxis(n: number): string {
  if (!Number.isFinite(n)) return DASH;
  return `${jaInt.format(Math.round(n / 10_000))}万`;
}

/** 1.7126 → "1.71倍" */
export function multiple(x: number): string {
  if (!Number.isFinite(x)) return DASH;
  return `${x.toFixed(2)}倍`;
}

/** 5 → "5.0%" */
export function percent(x: number): string {
  if (!Number.isFinite(x)) return DASH;
  return `${x.toFixed(1)}%`;
}

/** 入力欄のラベル横に出す万円換算: 30000 → "3万円", 35000 → "3.5万円", 500 → "0.05万円" ではなく "500円" */
export function monthlyHint(n: number): string {
  if (!Number.isFinite(n)) return DASH;
  if (n < 10_000) return `${jaInt.format(n)}円`;
  const man = n / 10_000;
  const s = Number.isInteger(man) ? jaInt.format(man) : man.toFixed(1).replace(/\.0$/, '');
  return `${s}万円`;
}
