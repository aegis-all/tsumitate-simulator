/**
 * 入力範囲・初期値・クランプ・警告 (requirement.md §4.1, §4.3 / design.md §4)
 * このモジュールは UI・ブラウザAPI に依存しない。
 */

export type RateKey = 'a' | 'b' | 'c';
export const RATE_KEYS: readonly RateKey[] = ['a', 'b', 'c'] as const;

export interface SimulatorInputs {
  /** 現在の年齢 (歳, 整数) */
  age: number;
  /** 積立期間 (年, 整数) */
  years: number;
  /** 毎月の積立金額 (円, 整数) */
  monthly: number;
  /** 想定利回り 年率 % (小数1桁) */
  rates: Record<RateKey, number>;
}

export interface NumericConstraint {
  min: number;
  max: number;
  step: number;
}

export const CONSTRAINTS = {
  age: { min: 0, max: 100, step: 1 },
  years: { min: 1, max: 50, step: 1 },
  monthly: { min: 1000, max: 1_000_000, step: 1000 },
  rate: { min: 0, max: 20, step: 0.1 },
} as const satisfies Record<string, NumericConstraint>;

export const DEFAULT_INPUTS: SimulatorInputs = {
  age: 30,
  years: 20,
  monthly: 30_000,
  rates: { a: 3, b: 5, c: 7 },
};

export const RATE_LABELS: Record<RateKey, string> = {
  a: '堅め',
  b: '標準',
  c: '強め',
};

/** 到達年齢がこの値を超えると警告 (V-3) */
export const MAX_REACH_AGE = 100;

/** step の小数桁数 (0.1 → 1, 1 → 0) */
function decimalsOf(step: number): number {
  const s = step.toString();
  const i = s.indexOf('.');
  return i === -1 ? 0 : s.length - i - 1;
}

/**
 * 範囲内に収め、step の倍数に丸める。NaN は min、±Infinity は max/min に収まる。
 * 丸めは min を起点とし、(5.05 - 0) / 0.1 = 50.4999… のような浮動小数誤差は
 * 小数6桁で切ってから四捨五入する。
 */
export function clamp(value: number, c: NumericConstraint): number {
  if (Number.isNaN(value)) return c.min;
  const bounded = Math.min(c.max, Math.max(c.min, value));
  const steps = Math.round(Number(((bounded - c.min) / c.step).toFixed(6)));
  const snapped = c.min + steps * c.step;
  const fixed = Number(snapped.toFixed(decimalsOf(c.step)));
  // 丸めで max を超えないように最終ガード
  return Math.min(c.max, Math.max(c.min, fixed));
}

function pick(value: number | undefined, fallback: number, c: NumericConstraint): number {
  if (value === undefined || value === null || !Number.isFinite(value)) return fallback;
  return clamp(value, c);
}

/** 欠損は既定値、範囲外はクランプして完全な入力値にする */
export function sanitizeInputs(partial: Partial<SimulatorInputs> | undefined | null): SimulatorInputs {
  const p = partial ?? {};
  const rates = p.rates ?? {};
  return {
    age: pick(p.age, DEFAULT_INPUTS.age, CONSTRAINTS.age),
    years: pick(p.years, DEFAULT_INPUTS.years, CONSTRAINTS.years),
    monthly: pick(p.monthly, DEFAULT_INPUTS.monthly, CONSTRAINTS.monthly),
    rates: {
      a: pick((rates as Partial<Record<RateKey, number>>).a, DEFAULT_INPUTS.rates.a, CONSTRAINTS.rate),
      b: pick((rates as Partial<Record<RateKey, number>>).b, DEFAULT_INPUTS.rates.b, CONSTRAINTS.rate),
      c: pick((rates as Partial<Record<RateKey, number>>).c, DEFAULT_INPUTS.rates.c, CONSTRAINTS.rate),
    },
  };
}

export type Warning = {
  code: 'REACH_AGE_OVER';
  message: string;
};

/** 入力値に対する警告 (計算は妨げない)。空配列なら警告なし。 */
export function validate(inputs: SimulatorInputs): Warning[] {
  const warnings: Warning[] = [];
  const reachAge = inputs.age + inputs.years;
  if (reachAge > MAX_REACH_AGE) {
    warnings.push({
      code: 'REACH_AGE_OVER',
      message: `到達年齢が${MAX_REACH_AGE}歳を超えます(${reachAge}歳)。積立期間または年齢をご確認ください。`,
    });
  }
  return warnings;
}

/** 範囲外入力をクランプしたときのメッセージ (V-1) */
export function rangeMessage(c: NumericConstraint, unit: string): string {
  const fmt = (n: number) => n.toLocaleString('ja-JP');
  return `${fmt(c.min)}〜${fmt(c.max)}${unit}の範囲で入力してください`;
}
