import type { CSSProperties } from 'react';
import { RATE_LABELS } from '../domain/constraints';
import { manYenShort, percent } from '../domain/format';
import type { SimulationResult } from '../domain/simulate';
import { PATTERN_COLORS } from './patternColors';

/** CSV 本文 (円単位・四捨五入)。BOM は呼び出し側で付ける。 */
export function buildCsv(result: SimulationResult): string {
  const header = [
    '経過年',
    '年齢',
    '元本累計(円)',
    ...result.patterns.map((p) => `${RATE_LABELS[p.key]} ${percent(p.ratePercent)} 資産額(円)`),
  ];
  const rows = result.principalSeries.map((principal, idx) => [
    String(idx + 1),
    String(result.inputs.age + idx + 1),
    String(Math.round(principal)),
    ...result.patterns.map((p) => String(Math.round(p.series[idx].balance))),
  ]);
  return [header, ...rows].map((r) => r.join(',')).join('\r\n') + '\r\n';
}

export function csvFileName(result: SimulationResult): string {
  const { age, years, monthly } = result.inputs;
  return `tsumitate_${age}_${years}_${monthly}.csv`;
}

function downloadCsv(result: SimulationResult) {
  const bom = '﻿';
  const blob = new Blob([bom + buildCsv(result)], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = csvFileName(result);
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function YearlyTable({ result }: { result: SimulationResult }) {
  const { inputs, patterns, principalSeries } = result;
  return (
    <section className="yearly card">
      <details>
        <summary>年ごとの推移を見る</summary>
        <div className="table-actions">
          <button type="button" className="btn" onClick={() => downloadCsv(result)}>
            CSVダウンロード
          </button>
        </div>
        <div className="table-wrap">
          <table>
            <caption className="visually-hidden">
              年ごとの元本累計と各パターンの運用資産額(万円)
            </caption>
            <thead>
              <tr>
                <th scope="col">経過年</th>
                <th scope="col">年齢</th>
                <th scope="col">元本累計</th>
                {patterns.map((p) => (
                  <th
                    key={p.key}
                    scope="col"
                    className="th-accent"
                    style={{ '--accent': PATTERN_COLORS[p.key] } as CSSProperties}
                  >
                    {RATE_LABELS[p.key]} {percent(p.ratePercent)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {principalSeries.map((principal, idx) => (
                <tr key={idx}>
                  <td>{idx + 1}年</td>
                  <td>{inputs.age + idx + 1}歳</td>
                  <td>{manYenShort(principal)}</td>
                  {patterns.map((p) => (
                    <td key={p.key}>{manYenShort(p.series[idx].balance)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="muted" style={{ fontSize: '0.85rem', margin: '8px 0 0' }}>
          単位: 万円(小数1桁、1,000円未満を四捨五入)。CSVは円単位で出力します。
        </p>
      </details>
    </section>
  );
}
