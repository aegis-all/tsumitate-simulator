import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { RATE_KEYS, RATE_LABELS } from '../../domain/constraints';
import { manYenAxis, percent } from '../../domain/format';
import type { SimulationResult } from '../../domain/simulate';
import { PATTERN_COLORS, PRINCIPAL_COLOR } from '../patternColors';
import { ChartTooltip } from './ChartTooltip';
import { toChartRows, xTickInterval } from './chartData';

/** 折れ線: 元本(破線) + A/B/C (design.md §6.4) */
export function GrowthChart({ result }: { result: SimulationResult }) {
  const data = toChartRows(result);
  const ageOf = (year: number) => result.inputs.age + year;
  const dots = { a: false, b: { r: 2.5 }, c: { r: 2.5, strokeWidth: 0 } } as const;

  return (
    <div
      className="chart-area"
      role="img"
      aria-label={`${result.inputs.years}年間の運用資産額の推移。元本と3パターンの折れ線グラフ。数値は下の表で確認できます。`}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
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
          <Tooltip content={<ChartTooltip ageOf={ageOf} />} />
          <Legend wrapperStyle={{ fontSize: 13 }} />
          <Line
            type="monotone"
            dataKey="principal"
            name="元本"
            stroke={PRINCIPAL_COLOR}
            strokeDasharray="6 4"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
          {RATE_KEYS.map((key) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              name={`${RATE_LABELS[key]} ${percent(result.inputs.rates[key])}`}
              stroke={PATTERN_COLORS[key]}
              strokeWidth={2.5}
              dot={dots[key]}
              activeDot={{ r: 5 }}
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
