import { describe, it, expect } from 'vitest';
import { futureValue, simulate } from './simulate';
import { DEFAULT_INPUTS } from './constraints';

/** requirement.md §6.4 の期待値 (円未満四捨五入, ±1円) */
const CASES: Array<{ monthly: number; rate: number; years: number; fv: number; principal: number }> = [
  { monthly: 30_000, rate: 5.0, years: 20, fv: 12_331_010, principal: 7_200_000 },
  { monthly: 10_000, rate: 3.0, years: 10, fv: 1_397_414, principal: 1_200_000 },
  { monthly: 50_000, rate: 7.0, years: 30, fv: 60_998_550, principal: 18_000_000 },
  { monthly: 30_000, rate: 0.0, years: 20, fv: 7_200_000, principal: 7_200_000 },
  { monthly: 100_000, rate: 3.0, years: 1, fv: 1_216_638, principal: 1_200_000 },
  { monthly: 30_000, rate: 3.0, years: 20, fv: 9_849_060, principal: 7_200_000 },
  { monthly: 30_000, rate: 7.0, years: 20, fv: 15_627_800, principal: 7_200_000 },
];

describe('futureValue (要件 §6.4)', () => {
  for (const c of CASES) {
    it(`毎月${c.monthly}円・${c.rate}%・${c.years}年 → ${c.fv}円`, () => {
      const v = futureValue(c.monthly, c.rate, c.years * 12);
      expect(Math.abs(Math.round(v) - c.fv)).toBeLessThanOrEqual(1);
    });
  }
  it('0% は元本と同額 (0 除算なし)', () => {
    const v = futureValue(30_000, 0, 240);
    expect(v).toBe(7_200_000);
    expect(Number.isFinite(v)).toBe(true);
  });
  it('0 ヶ月は 0', () => {
    expect(futureValue(30_000, 5, 0)).toBe(0);
  });
  it('範囲上限 (100万円・20%・50年) でも有限', () => {
    expect(Number.isFinite(futureValue(1_000_000, 20, 600))).toBe(true);
  });
});

describe('simulate', () => {
  const result = simulate(DEFAULT_INPUTS);

  it('reachAge = age + years', () => {
    expect(result.reachAge).toBe(50);
  });
  it('series.length === years、年と年齢が連続', () => {
    for (const p of result.patterns) {
      expect(p.series).toHaveLength(DEFAULT_INPUTS.years);
      expect(p.series[0].year).toBe(1);
      expect(p.series[0].age).toBe(31);
      expect(p.series.at(-1)?.year).toBe(20);
      expect(p.series.at(-1)?.age).toBe(50);
    }
  });
  it('principalSeries は単調増加で毎年 12 ヶ月分増える', () => {
    expect(result.principalSeries).toHaveLength(20);
    for (let i = 0; i < result.principalSeries.length; i++) {
      expect(result.principalSeries[i]).toBe(30_000 * 12 * (i + 1));
      if (i > 0) expect(result.principalSeries[i]).toBeGreaterThan(result.principalSeries[i - 1]);
    }
  });
  it('初期値 (3/5/7%) の最終金額が要件 §8-1 と一致', () => {
    const [a, b, c] = result.patterns;
    expect(a.key).toBe('a');
    expect(Math.round(a.final.balance)).toBeCloseTo(9_849_060, -1);
    expect(Math.round(b.final.balance)).toBeCloseTo(12_331_010, -1);
    expect(Math.round(c.final.balance)).toBeCloseTo(15_627_800, -1);
  });
  it('gain = balance - principal、gainMultiple = balance / principal', () => {
    const b = result.patterns[1];
    expect(b.final.gain).toBeCloseTo(b.final.balance - b.final.principal, 6);
    expect(b.gainMultiple).toBeCloseTo(12_331_010 / 7_200_000, 4);
  });
  it('final は series の最終要素', () => {
    for (const p of result.patterns) expect(p.final).toBe(p.series[p.series.length - 1]);
  });
  it('各年の principal は principalSeries と一致', () => {
    for (const p of result.patterns) {
      p.series.forEach((pt, idx) => expect(pt.principal).toBe(result.principalSeries[idx]));
    }
  });
});
