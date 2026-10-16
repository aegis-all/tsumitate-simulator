import { describe, it, expect } from 'vitest';
import {
  CONSTRAINTS,
  DEFAULT_INPUTS,
  MAX_REACH_AGE,
  clamp,
  rangeMessage,
  sanitizeInputs,
  validate,
} from './constraints';

describe('clamp', () => {
  const years = CONSTRAINTS.years;
  it('境界: min-1 → min, min → min, max → max, max+1 → max', () => {
    expect(clamp(years.min - 1, years)).toBe(years.min);
    expect(clamp(years.min, years)).toBe(years.min);
    expect(clamp(years.max, years)).toBe(years.max);
    expect(clamp(years.max + 1, years)).toBe(years.max);
  });
  it('step に丸める (整数)', () => {
    expect(clamp(20.4, years)).toBe(20);
    expect(clamp(20.6, years)).toBe(21);
    expect(clamp(31_500, CONSTRAINTS.monthly)).toBe(32_000);
    expect(clamp(31_499, CONSTRAINTS.monthly)).toBe(31_000);
  });
  it('step に丸める (小数 0.1) — 浮動小数誤差を残さない', () => {
    expect(clamp(5.04, CONSTRAINTS.rate)).toBe(5);
    expect(clamp(5.05, CONSTRAINTS.rate)).toBe(5.1);
    expect(clamp(0.3, CONSTRAINTS.rate)).toBe(0.3);
    expect(clamp(19.96, CONSTRAINTS.rate)).toBe(20);
  });
  it('NaN / Infinity は min', () => {
    expect(clamp(NaN, years)).toBe(years.min);
    expect(clamp(Infinity, years)).toBe(years.max); // 上に飛ぶ値は max に収まる
    expect(clamp(-Infinity, years)).toBe(years.min);
  });
});

describe('sanitizeInputs', () => {
  it('空なら既定値', () => {
    expect(sanitizeInputs({})).toEqual(DEFAULT_INPUTS);
    expect(sanitizeInputs(undefined)).toEqual(DEFAULT_INPUTS);
  });
  it('一部欠損は既定値で埋め、範囲外はクランプ', () => {
    const r = sanitizeInputs({ age: 200, rates: { a: -1 } as never });
    expect(r.age).toBe(100);
    expect(r.years).toBe(DEFAULT_INPUTS.years);
    expect(r.rates).toEqual({ a: 0, b: 5, c: 7 });
  });
  it('NaN は既定値', () => {
    expect(sanitizeInputs({ monthly: NaN }).monthly).toBe(DEFAULT_INPUTS.monthly);
  });
});

describe('validate', () => {
  it('年齢30・期間20 は警告なし', () => {
    expect(validate(DEFAULT_INPUTS)).toEqual([]);
  });
  it(`年齢85・期間20 は到達年齢 ${MAX_REACH_AGE} 超で警告 (V-3)`, () => {
    const w = validate({ ...DEFAULT_INPUTS, age: 85, years: 20 });
    expect(w).toHaveLength(1);
    expect(w[0].code).toBe('REACH_AGE_OVER');
    expect(w[0].message).toContain('105歳');
  });
  it('ちょうど 100 歳は警告なし', () => {
    expect(validate({ ...DEFAULT_INPUTS, age: 80, years: 20 })).toEqual([]);
  });
});

describe('rangeMessage', () => {
  it('範囲を日本語で示す', () => {
    expect(rangeMessage(CONSTRAINTS.years, '年')).toBe('1〜50年の範囲で入力してください');
    expect(rangeMessage(CONSTRAINTS.monthly, '円')).toBe('1,000〜1,000,000円の範囲で入力してください');
  });
});
