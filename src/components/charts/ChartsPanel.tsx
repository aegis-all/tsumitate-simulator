import { useState } from 'react';
import type { SimulationResult } from '../../domain/simulate';
import { GrowthChart } from './GrowthChart';
import { StackedChart } from './StackedChart';

type Tab = 'growth' | 'stacked';

/** 遅延読み込みされる本体 (Recharts を含む chunk)。design.md D-5 */
export default function ChartsPanel({ result }: { result: SimulationResult }) {
  const [tab, setTab] = useState<Tab>('growth');
  return (
    <div>
      <div className="charts-tabs" role="tablist" aria-label="グラフの種類">
        <button
          type="button"
          role="tab"
          className="tab"
          aria-selected={tab === 'growth'}
          aria-controls="chart-growth"
          onClick={() => setTab('growth')}
        >
          資産の推移
        </button>
        <button
          type="button"
          role="tab"
          className="tab"
          aria-selected={tab === 'stacked'}
          aria-controls="chart-stacked"
          onClick={() => setTab('stacked')}
        >
          元本と収益の内訳
        </button>
      </div>
      {tab === 'growth' ? (
        <div id="chart-growth" role="tabpanel">
          <GrowthChart result={result} />
        </div>
      ) : (
        <div id="chart-stacked" role="tabpanel">
          <StackedChart result={result} />
        </div>
      )}
    </div>
  );
}
