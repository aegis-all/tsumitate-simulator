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

/** X 軸の目盛は幅に応じて自動で間引く (design.md §6.4)。最低ギャップ px */
export const X_TICK_MIN_GAP = 28;

/** 凡例の並び順 (元本 → A → B → C)。Recharts v3 は既定で値順に並べ替えるため明示する */
const LEGEND_ORDER = ['principal', 'a', 'b', 'c', 'gain'];
export function legendSorter(item: { dataKey?: unknown }): number {
  const i = LEGEND_ORDER.indexOf(String(item.dataKey));
  return i === -1 ? 99 : i;
}
