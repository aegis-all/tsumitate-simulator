import { describe, it, expect } from 'vitest';
import { manYen, manYenAxis, manYenShort, monthlyHint, multiple, percent, toManYen, yen } from './format';

describe('yen', () => {
  it('カンマ区切り + 円、1円未満四捨五入', () => {
    expect(yen(12_331_010)).toBe('12,331,010円');
    expect(yen(12_331_010.4)).toBe('12,331,010円');
    expect(yen(12_331_010.5)).toBe('12,331,011円');
    expect(yen(0)).toBe('0円');
  });
  it('非有限は —', () => {
    expect(yen(NaN)).toBe('—');
    expect(yen(Infinity)).toBe('—');
  });
});

describe('manYen / toManYen', () => {
  it('12,331,010円 → 約1,233.1万円', () => {
    expect(manYen(12_331_010)).toBe('約1,233.1万円');
  });
  it('丸め境界: 1,000円未満を四捨五入 (…499 切り捨て / …500 切り上げ)', () => {
    expect(toManYen(12_330_499)).toBe(1233.0);
    expect(toManYen(12_330_500)).toBe(1233.1);
    expect(manYen(9_999_500)).toBe('約1,000.0万円');
    expect(manYen(9_999_499)).toBe('約999.9万円');
  });
  it('小数1桁を必ず表示', () => {
    expect(manYen(7_200_000)).toBe('約720.0万円');
    expect(manYen(7_200_000, '')).toBe('720.0万円');
  });
  it('manYenShort / manYenAxis', () => {
    expect(manYenShort(12_331_010)).toBe('1,233.1万');
    expect(manYenAxis(12_331_010)).toBe('1,233万');
    expect(manYenAxis(0)).toBe('0万');
  });
});

describe('multiple / percent', () => {
  it('倍率は小数2桁', () => {
    expect(multiple(12_331_010 / 7_200_000)).toBe('1.71倍');
    expect(multiple(1)).toBe('1.00倍');
  });
  it('% は小数1桁', () => {
    expect(percent(5)).toBe('5.0%');
    expect(percent(0.1)).toBe('0.1%');
    expect(percent(20)).toBe('20.0%');
  });
});

describe('monthlyHint', () => {
  it('万円換算', () => {
    expect(monthlyHint(30_000)).toBe('3万円');
    expect(monthlyHint(35_000)).toBe('3.5万円');
    expect(monthlyHint(1_000_000)).toBe('100万円');
    expect(monthlyHint(5_000)).toBe('5,000円');
  });
});
