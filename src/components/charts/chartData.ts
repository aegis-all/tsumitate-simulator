import type { SimulationResult } from '../../domain/simulate';

export interface ChartRow {
  year: number;
  age: number;
  principal: number;
  a: number;
  b: number;
  c: number;
  /** 選択パターンの収益 (StackedChart 用に後で詰める) */
  gain?: number;
}

export function toChartRows(result: SimulationResult): ChartRow[] {
  const [pa, pb, pc] = result.patterns;
  return result.principalSeries.map((principal, idx) => ({
    year: idx + 1,
    age: result.inputs.age + idx + 1,
    principal,
    a: pa.series[idx].balance,
    b: pb.series[idx].balance,
    c: pc.series[idx].balance,
  }));
}

/** 期間が長いときの X 軸ラベル間引き (design.md §6.4) */
export function xTickInterval(years: number): number {
  if (years > 30) return 4; // 5年刻み
  if (years > 15) return 1; // 2年刻み
  return 0;
}
