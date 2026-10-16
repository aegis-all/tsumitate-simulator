import { useState, type CSSProperties } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { RATE_KEYS, RATE_LABELS, type RateKey } from '../../domain/constraints';
import { manYenAxis, percent } from '../../domain/format';
import type { SimulationResult } from '../../domain/simulate';
import { PATTERN_COLORS, PRINCIPAL_COLOR } from '../patternColors';
import { ChartTooltip } from './ChartTooltip';
import { xTickInterval } from './chartData';

/** 積み上げ棒: 元本 + 運用収益、パターン切替 (design.md §6.4) */
export function StackedChart({ result }: { result: SimulationResult }) {
  const [selected, setSelected] = useState<RateKey>('b');
  const pattern = result.patterns.find((p) => p.key === selected) ?? result.patterns[0];
  const data = pattern.series.map((pt) => ({
    year: pt.year,
    age: pt.age,
    principal: pt.principal,
    gain: Math.max(0, pt.gain),
  }));
  const ageOf = (year: number) => result.inputs.age + year;
  const color = PATTERN_COLORS[pattern.key];

  return (
    <div>
      <div className="segmented" role="group" aria-label="表示するパターン">
        {RATE_KEYS.map((key) => (
          <button
            key={key}
            type="button"
            className="seg"
            aria-pressed={key === selected}
            style={{ '--accent': PATTERN_COLORS[key] } as CSSProperties}
            onClick={() => setSelected(key)}
          >
            {RATE_LABELS[key]} {percent(result.inputs.rates[key])}
          </button>
        ))}
      </div>
      <div
        className="chart-area"
        role="img"
        aria-label={`${RATE_LABELS[pattern.key]}(年率${percent(pattern.ratePercent)})の年ごとの元本と運用収益の積み上げ棒グラフ。数値は下の表で確認できます。`}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="year"
              interval={xTickInterval(result.inputs.years)}
              tickFormatter={(v: number) => `${v}年`}
              tick={{ fill: 'var(--muted)', fontSize: 12 }}
              stroke="var(--border)"
            />
            <YAxis
              tickFormatter={manYenAxis}
              width={64}
              tick={{ fill: 'var(--muted)', fontSize: 12 }}
              stroke="var(--border)"
            />
            <Tooltip content={<ChartTooltip ageOf={ageOf} />} cursor={{ fill: 'var(--surface)' }} />
            <Legend wrapperStyle={{ fontSize: 13 }} />
            <Bar
              dataKey="principal"
              name="元本"
              stackId="s"
              fill={PRINCIPAL_COLOR}
              isAnimationActive={false}
            />
            <Bar
              dataKey="gain"
              name="運用収益"
              stackId="s"
              fill={color}
              radius={[3, 3, 0, 0]}
              isAnimationActive={false}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
