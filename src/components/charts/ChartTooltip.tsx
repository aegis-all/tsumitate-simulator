import { manYenShort } from '../../domain/format';

interface Item {
  name?: string | number;
  value?: number | string | ReadonlyArray<number | string>;
  color?: string;
  dataKey?: string | number;
}

interface Props {
  active?: boolean;
  payload?: ReadonlyArray<Item>;
  label?: string | number;
  /** year → age の解決 */
  ageOf: (year: number) => number;
}

export function ChartTooltip({ active, payload, label, ageOf }: Props) {
  if (!active || !payload || payload.length === 0) return null;
  const year = Number(label);
  return (
    <div className="tt">
      <div className="tt-title">
        {year}年目({ageOf(year)}歳)
      </div>
      {payload.map((p) => (
        <div className="tt-row" key={String(p.dataKey)}>
          <span style={{ color: p.color }}>{p.name}</span>
          <span>{manYenShort(Number(p.value))}</span>
        </div>
      ))}
    </div>
  );
}
