import type { CSSProperties } from 'react';
import { RATE_LABELS } from '../domain/constraints';
import { manYen, multiple, percent, yen } from '../domain/format';
import type { SimulationResult } from '../domain/simulate';
import { PATTERN_COLORS } from './patternColors';

export function SummaryCards({ result }: { result: SimulationResult }) {
  const { inputs, reachAge, patterns } = result;
  return (
    <section className="summary card" aria-labelledby="summary-title">
      <h2 id="summary-title">{reachAge}歳時点の運用資産額</h2>
      <p className="summary-sub">
        毎月{yen(inputs.monthly)}を{inputs.years}年間({inputs.age}歳〜{reachAge}歳)積み立てた場合
      </p>
      <div className="summary-grid">
        {patterns.map((p) => (
          <article
            key={p.key}
            className="pattern-card"
            style={{ '--accent': PATTERN_COLORS[p.key] } as CSSProperties}
            aria-label={`${RATE_LABELS[p.key]} ${percent(p.ratePercent)}`}
          >
            <div className="pc-head">
              <span className="pc-label">{RATE_LABELS[p.key]}</span>
              <span className="pc-rate">年率 {percent(p.ratePercent)}</span>
            </div>
            <div className="pc-final">{manYen(p.final.balance)}</div>
            <div className="pc-final-yen">{yen(p.final.balance)}</div>
            <dl>
              <dt>うち元本</dt>
              <dd>{manYen(p.final.principal, '')}</dd>
              <dt>うち運用収益</dt>
              <dd>{manYen(p.final.gain, '')}</dd>
              <dt>元本に対して</dt>
              <dd className="pc-multiple">{multiple(p.gainMultiple)}</dd>
            </dl>
          </article>
        ))}
      </div>
    </section>
  );
}
