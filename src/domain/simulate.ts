/**
 * 複利計算 (requirement.md §6 / design.md §5)
 * 前提: 毎月末に一定額を積み立て、年率÷12 の月利で月複利運用。
 * このモジュールは UI・ブラウザAPI に依存しない。丸めは行わない (format.ts の責務)。
 */
import { RATE_KEYS, type RateKey, type SimulatorInputs } from './constraints';

export interface YearPoint {
  /** k 年目 (1..years) */
  year: number;
  /** 現在の年齢 + k */
  age: number;
  /** 元本累計 (円, 未丸め) */
  principal: number;
  /** 運用資産額 (円, 未丸め) */
  balance: number;
  /** balance - principal */
  gain: number;
}

export interface PatternResult {
  key: RateKey;
  ratePercent: number;
  /** 最終年 (= series[series.length - 1]) */
  final: YearPoint;
  /** balance / principal (元本の何倍か) */
  gainMultiple: number;
  series: YearPoint[];
}

export interface SimulationResult {
  inputs: SimulatorInputs;
  /** age + years */
  reachAge: number;
  /** 元本累計 (パターン共通)。index 0 = 1年目 */
  principalSeries: number[];
  /** a, b, c の順 */
  patterns: PatternResult[];
}

/**
 * 月末積立・月複利の将来価値。
 * @param monthly 毎月の積立金額 (円)
 * @param rateAnnualPercent 年率 (%) 例: 5
 * @param months 積立回数 (月)
 */
export function futureValue(monthly: number, rateAnnualPercent: number, months: number): number {
  if (months <= 0) return 0;
  const i = rateAnnualPercent / 100 / 12;
  if (i === 0) return monthly * months; // V-4: 0 除算回避
  return (monthly * (Math.pow(1 + i, months) - 1)) / i;
}

export function simulate(inputs: SimulatorInputs): SimulationResult {
  const { age, years, monthly, rates } = inputs;
  const principalSeries: number[] = [];
  for (let k = 1; k <= years; k++) {
    principalSeries.push(monthly * 12 * k);
  }

  const patterns: PatternResult[] = RATE_KEYS.map((key) => {
    const ratePercent = rates[key];
    const series: YearPoint[] = principalSeries.map((principal, idx) => {
      const k = idx + 1;
      const balance = futureValue(monthly, ratePercent, 12 * k);
      return { year: k, age: age + k, principal, balance, gain: balance - principal };
    });
    const final = series[series.length - 1];
    return {
      key,
      ratePercent,
      final,
      gainMultiple: final.principal > 0 ? final.balance / final.principal : 0,
      series,
    };
  });

  return { inputs, reachAge: age + years, principalSeries, patterns };
}
